import { get_assets } from "./assets.js";
import { State } from "./models/Simulator/State.js";
import { MapGenerator } from "./models/Generator/MapGenerator.js";
import { Display } from "./models/Display.js";

const generateButton = document.getElementById("generate") as HTMLButtonElement;
const prevButton = document.getElementById("prev") as HTMLButtonElement;
const nextButton = document.getElementById("next") as HTMLButtonElement;
const runButton = document.getElementById("run") as HTMLButtonElement;
const info = document.getElementById("info-game") as HTMLElement;

let mapGeneration: MapGenerator | undefined;
let display: Display | undefined;
let state: State | undefined;

generateButton.addEventListener("click", () => {
  mapGeneration = new MapGenerator();
  display = new Display(mapGeneration.size);
  state = undefined;

  mapGeneration.generate();
  display.drawMap(mapGeneration);
  generateButtons();
});

prevButton.addEventListener("click", () => {
  if (!state || !display) return;

  state.prev();
  changeDisablePrev();

  display.drawState(state);
});

nextButton.addEventListener("click", () => {
  if (!mapGeneration || !display) return;

  if (!state) {
    state = new State(mapGeneration, true);
    startButtons();
  } else {
    state.next();
    changeDisablePrev();
  }

  display.drawState(state);
});

runButton.addEventListener("click", () => {
  if (!mapGeneration || !display) return;

  if (!state) {
    state = new State(mapGeneration, true);
  }
  while (!state.isTerminal && state.stars < 500) state.next();
  changeDisablePrev();

  display.drawState(state);
});

document.addEventListener("DOMContentLoaded", get_assets);

function generateButtons() {
  prevButton.disabled = true;
  info.style.visibility = "hidden";
}
function startButtons() {
  info.style.visibility = "visible";
}

function changeDisablePrev() {
  if (state && state.historic.index === -1) prevButton.disabled = true;
  else prevButton.disabled = false;
}
