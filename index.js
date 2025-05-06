import { display_map, get_assets } from "./scripts/display.js";
import { MapGenerator } from "./scripts/map/MapGenerator.js";

document.getElementById("generate").addEventListener("click", () => {
  const map_size = parseInt(Array.from(document.getElementsByName("map_size")).find((r) => r.checked).value);
  const mapGenerator = new MapGenerator(map_size);
  mapGenerator.generate();
  display_map(mapGenerator);
});

document.addEventListener("DOMContentLoaded", get_assets);
