import { display_map, get_assets } from "./scripts/display.js";
import { MapExploiter } from "./scripts/map/MapExploiter.js";
import { MapGenerator } from "./scripts/map/MapGenerator.js";

/** @type {MapGenerator} */
let mapGeneration;

/** @type {MapExploiter} */
let mapExploit;

document.getElementById("generate").addEventListener("click", () => {
  const map_size = parseInt(Array.from(document.getElementsByName("map_size")).find((r) => r.checked).value);
  mapGeneration = new MapGenerator(map_size);
  mapGeneration.generate();
  display_map(mapGeneration);

  document.getElementById("start").disabled = false;
});

document.getElementById("start").addEventListener("click", () => {
  document.getElementById("start").style.display = "none";
  document.getElementById("prev").style.display = "block";
  document.getElementById("next").style.display = "block";
  document.getElementById("information").style.display = "block";

  mapExploit = new MapExploiter(mapGeneration);
  mapExploit.start();
});

document.getElementById("next").addEventListener("click", () => {
  mapExploit.next();
  display_map(mapExploit);
});

document.addEventListener("DOMContentLoaded", get_assets);
