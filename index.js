import { display_map, get_assets } from "./display.js";
import { MapGenerator } from "./generate.js";

document.getElementById("generate").addEventListener("click", () => {
  const map = new MapGenerator();
  map.generate();
  display_map(map);
});

document.addEventListener("DOMContentLoaded", get_assets);
