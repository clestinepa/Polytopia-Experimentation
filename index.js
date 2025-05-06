import { display_map, get_assets } from "./scripts/display.js";
import { MapExploiter } from "./scripts/map/MapExploiter.js";
import { MapGenerator } from "./scripts/map/MapGenerator.js";

/** @type {MapGenerator} */
let mapGeneration;

/** @type {MapCalculator} */
let mapExploit;

document.getElementById("generate").addEventListener("click", () => {
  const map_size = parseInt(Array.from(document.getElementsByName("map_size")).find((r) => r.checked).value);
  mapGeneration = new MapGenerator(map_size);
  mapGeneration.generate();
  display_map(mapGeneration);

  document.getElementById("calculate").disabled = false;
});

document.getElementById("calculate").addEventListener("click", () => {
  mapExploit = new MapExploiter(mapGeneration);
  mapExploit.exploit();
  display_map(mapExploit);
});

document.addEventListener("DOMContentLoaded", get_assets);
