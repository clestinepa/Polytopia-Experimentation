import { get_assets } from "./assets.js";
import { State } from "./models/Simulator/State.js";
import { MapGenerator } from "./models/Generator/MapGenerator.js";
import { Display } from "./models/Display.js";

const generateButton = document.getElementById("generate") as HTMLButtonElement;
const prevButton = document.getElementById("prev") as HTMLButtonElement;
const nextButton = document.getElementById("next") as HTMLButtonElement;
const runButton = document.getElementById("run") as HTMLButtonElement;
const info = document.getElementById("information") as HTMLElement;
const historic = document.getElementById("historic") as HTMLElement;

let mapGeneration: MapGenerator | undefined;
let display: Display | undefined;
let state: State | undefined;

generateButton.addEventListener("click", () => {
  mapGeneration = new MapGenerator();
  display = new Display(mapGeneration.size);
  state = undefined;

  mapGeneration.generate();
  state = new State(mapGeneration, true);
  startButtons();
  draw();
});

prevButton.addEventListener("click", () => {
  if (!state || !display) return;

  state.prev();
  changeDisablePrev();

  draw();
});

nextButton.addEventListener("click", () => {
  if (!mapGeneration || !state || !display) return;

  const radios = document.getElementsByName("verbose") as NodeListOf<HTMLInputElement>;
  const checked = Array.from(radios).find((r) => r.checked) as HTMLInputElement;
  state.next(checked.value === "true");
  changeDisablePrev();

  draw();
});

runButton.addEventListener("click", () => {
  if (!mapGeneration || !state || !display) return;

  const radios = document.getElementsByName("verbose") as NodeListOf<HTMLInputElement>;
  const checked = Array.from(radios).find((r) => r.checked) as HTMLInputElement;
  while (!state.isTerminal && state.stars < 500) state.next(checked.value === "true");
  changeDisablePrev();

  draw();
});

document.addEventListener("DOMContentLoaded", get_assets);

function startButtons() {
  offsetX = 0;
  offsetY = 0;
  scale = 1;
  prevButton.disabled = true;
  info.style.visibility = "visible";
  historic.style.visibility = "visible";
}

function changeDisablePrev() {
  if (state && state.historic.index === -1) prevButton.disabled = true;
  else prevButton.disabled = false;
}

/** CANVAS INTERACTIONS **/
const canvas = document.getElementById("canvas_html") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let offsetX = 0;
let offsetY = 0;
let scale = 1;
let isDragging = false;
let lastX: number, lastY: number;

canvas.addEventListener("wheel", (e) => {
  if (!display || !mapGeneration) return;

  e.preventDefault();

  const zoomSpeed = 1.1;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  if (e.deltaY < 0 && mapGeneration.size / scale > 3.9) {
    scale *= zoomSpeed;
    offsetX = mouseX - (mouseX - offsetX) * zoomSpeed;
    offsetY = mouseY - (mouseY - offsetY) * zoomSpeed;
  } else if (e.deltaY > 0 && scale > 1) {
    scale /= zoomSpeed;
    offsetX = mouseX - (mouseX - offsetX) / zoomSpeed;
    offsetY = mouseY - (mouseY - offsetY) / zoomSpeed;
  }

  clampPan();
  draw();
});

canvas.addEventListener("mousedown", (e) => {
  if (!display) return;
  isDragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
  if (!display) return;
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  if (!display) return;
  isDragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (display && mapGeneration && isDragging) {
    offsetX += e.offsetX - lastX;
    offsetY += e.offsetY - lastY;
    lastX = e.offsetX;
    lastY = e.offsetY;
    clampPan();
    draw();
  }
});

function clampPan() {
  if (!display || !mapGeneration) return;
  const VIEWPORT_MARGIN_RATIO = 0.25;

  const contentWidth = display.tile_width * mapGeneration.size * scale;
  const contentHeight =
    (display.tile_height * (mapGeneration.size - 1) * Display.ratio_ground + display.tile_height) * scale;

  const getPanLimits = (viewportSize: number, contentSize: number) => {
    const margin = (viewportSize * scale - contentSize) / 2;
    return {
      min: -(contentSize - viewportSize * (1 - VIEWPORT_MARGIN_RATIO)) - margin,
      max: viewportSize * VIEWPORT_MARGIN_RATIO - margin,
    };
  };

  const { min: minX, max: maxX } = getPanLimits(canvas.width, contentWidth);
  const { min: minY, max: maxY } = getPanLimits(canvas.height, contentHeight);

  offsetX = Math.min(Math.max(offsetX, minX), maxX);
  offsetY = Math.min(Math.max(offsetY, minY), maxY);
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  if (state && display) display.drawState(state);
}
