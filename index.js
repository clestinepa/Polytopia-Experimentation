import { display_map, get_assets } from "/scripts/display.js";
import { MapGenerator } from "/scripts/MapGenerator.js";

document.getElementById("generate").addEventListener("click", () => {
  const mapGenerator = new MapGenerator();
  mapGenerator.generate();
  display_map(mapGenerator);
});

document.addEventListener("DOMContentLoaded", get_assets);
