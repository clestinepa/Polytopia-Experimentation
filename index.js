import { display_map, get_assets } from "./scripts/display.js";
import { MapExploiter } from "./scripts/map/MapExploiter.js";
import { MapGenerator } from "./scripts/map/MapGenerator.js";

/** @type {MapGenerator | undefined} */
let mapGeneration;

/** @type {MapExploiter | undefined} */
let mapExploit;

document.getElementById("generate").addEventListener("click", () => {
  mapExploit = undefined;
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
  if (!mapExploit) {
    mapExploit = new MapExploiter(mapGeneration);
    mapExploit.start();
    document.getElementById("next").innerHTML = "Next";
    document.getElementById("prev").style.display = "block";
    document.getElementById("information").style.display = "block";
  } else mapExploit.next();

  display_map(mapExploit);
});

document.addEventListener("DOMContentLoaded", get_assets);
