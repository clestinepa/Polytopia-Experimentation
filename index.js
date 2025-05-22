import { get_assets } from "./scripts/assets.js";
import { State } from "./scripts/models/Simulator/State.js";
import { MapGenerator } from "./scripts/models/Generator/MapGenerator.js";
import { Display } from "./scripts/models/Display.js";

const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const runButton = document.getElementById("run");
const information = document.getElementById("information");

/** @type {MapGenerator | undefined} */
let mapGeneration;

/** @type {Display | undefined} */
let display;

/** @type {State | undefined} */
let state;

document.getElementById("generate").addEventListener("click", () => {
  mapGeneration = new MapGenerator();
  display = new Display(mapGeneration.size);
  state = undefined;

  mapGeneration.generate();
  display.drawMap(mapGeneration);
  generateButtons();
});

prevButton.addEventListener("click", () => {
  state.prev();
  disablePrev();

  display.drawState(state);
});

nextButton.addEventListener("click", () => {
  if (!state) {
    state = new State(mapGeneration, true);
    state.start();
    startButtons();
  } else {
    state.next();
    ablePrev();
  }

  display.drawState(state);
});


document.addEventListener("DOMContentLoaded", get_assets);

function generateButtons() {
  prevButton.style.display = "none";
  prevButton.disabled = true;
  nextButton.innerHTML = "Start";
  nextButton.style.display = "block";
  runButton.style.display = "none";
  information.style.display = "none";
}
function startButtons() {
  prevButton.style.display = "block";
  nextButton.innerHTML = "Next";
  runButton.style.display = "block";
  information.style.display = "block";
}
function ablePrev() {
  if (state.actions.length === 1) prevButton.disabled = false;
}
function disablePrev() {
  if (state.actions.length === 0) prevButton.disabled = true;
}
