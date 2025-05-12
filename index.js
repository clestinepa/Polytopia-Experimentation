import { display_map, get_assets } from "./scripts/display.js";
import { MapSimulator } from "./scripts/models/Simulator/MapSimulator.js";
import { MapGenerator } from "./scripts/models/Generator/MapGenerator.js";

/** @type {MapGenerator | undefined} */
let mapGeneration;

/** @type {MapSimulator | undefined} */
let mapSimulator;

document.getElementById("generate").addEventListener("click", () => {
  mapSimulator = undefined;
  const map_size = parseInt(Array.from(document.getElementsByName("map_size")).find((r) => r.checked).value);
  mapGeneration = new MapGenerator(map_size);
  mapGeneration.generate();
  display_map(mapGeneration);

  document.getElementById("next").disabled = false;
  document.getElementById("next").innerHTML = "Start";
  document.getElementById("prev").style.display = "none";
  document.getElementById("information").style.display = "none";
});

document.getElementById("next").addEventListener("click", () => {
  if (!mapSimulator) {
    mapSimulator = new MapSimulator(mapGeneration);
    mapSimulator.start();
    document.getElementById("next").innerHTML = "Next";
    document.getElementById("prev").style.display = "block";
    document.getElementById("information").style.display = "block";
  } else mapSimulator.next();

  display_map(mapSimulator);
});

document.addEventListener("DOMContentLoaded", get_assets);
