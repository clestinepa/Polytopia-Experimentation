import { get_assets } from "./scripts/assets.js";
import { Simulator } from "./scripts/models/Simulator/Simulator.js";
import { MapGenerator } from "./scripts/models/Generator/MapGenerator.js";
import { Display } from "./scripts/models/Display.js";

/** @type {MapGenerator | undefined} */
let mapGeneration;

/** @type {Display | undefined} */
let display;

/** @type {Simulator | undefined} */
let simulator;

document.getElementById("generate").addEventListener("click", () => {
  mapGeneration = new MapGenerator();
  display = new Display(mapGeneration.size);
  simulator = undefined;

  mapGeneration.generate();
  display.drawMap(mapGeneration);

  document.getElementById("next").disabled = false;
  document.getElementById("next").innerHTML = "Start";
  document.getElementById("prev").style.display = "none";
  document.getElementById("information").style.display = "none";
});

document.getElementById("next").addEventListener("click", () => {
  if (!simulator) {
    simulator = new Simulator(mapGeneration);
    simulator.start();
    document.getElementById("next").innerHTML = "Next";
    document.getElementById("prev").style.display = "block";
    document.getElementById("information").style.display = "block";
  } else simulator.next();

  display.drawMap(simulator.map);
});

document.addEventListener("DOMContentLoaded", get_assets);
