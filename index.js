import { get_assets } from "./scripts/assets.js";
import { State } from "./scripts/models/Simulator/State.js";
import { MapGenerator } from "./scripts/models/Generator/MapGenerator.js";
import { Display } from "./scripts/models/Display.js";

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

  document.getElementById("next").disabled = false;
  document.getElementById("next").innerHTML = "Start";
  document.getElementById("prev").style.display = "none";
  document.getElementById("information").style.display = "none";
});

document.getElementById("next").addEventListener("click", () => {
  if (!state) {
    state = new State(mapGeneration, true);
    state.start();
    document.getElementById("next").innerHTML = "Next";
    document.getElementById("prev").style.display = "block";
    document.getElementById("information").style.display = "block";
  } else state.next();

  display.drawMap(state.map);
});

document.addEventListener("DOMContentLoaded", get_assets);
