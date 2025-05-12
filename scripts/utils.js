import { Map } from "./models/Map.js";
import { Tile } from "./models/Tile.js";

/**
 *
 * @param {Number} min
 * @param {Number} max
 * @returns random int between min and max
 */
export function randomInt(min, max) {
  let rand = min + Math.random() * (max - min);
  return Math.floor(rand);
}

/**
 * @param {any[]} array
 * @param {(any | undefined) => boolean} condition
 * @returns {Number}
 */
export function getRandomIndex(array, condition = () => true) {
  let potentialArray = [];
  array.forEach((el, index) => {
    if (condition(el)) potentialArray.push(index);
  });
  return potentialArray[Math.floor(Math.random() * potentialArray.length)];
}

/**
 * @param {Map} map
 * @param {(tile: Tile) => string} className
 * @param {(tile: Tile) => string} text
 */
export function printMap(map, className, text) {
  let seen_grid = Array(map.size).fill("");
  map.tiles.forEach((tile) => (seen_grid[tile.row] += '<div class="' + className(tile) + '">' + text(tile) + "</div>"));
  let output = "";
  seen_grid.forEach((row) => (output += '<div class="row">' + row + "</div>"));

  document.getElementById("text_display").innerHTML = output;
  document.getElementById("text_display").style.display = "block";
}
