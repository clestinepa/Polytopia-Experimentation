import { TileGenerator } from "./models/Generator/TileGenerator.js";
import { Map } from "./models/Simulator/Map.js";
import { Tile } from "./models/Simulator/Tile.js";

export function randomInt(min: number, max: number) {
  let rand = min + Math.random() * (max - min);
  return Math.floor(rand);
}

export function getRandomIndex<T>(array: T[], condition: (el: T) => boolean = () => true) {
  let potentialArray: number[] = [];
  array.forEach((el, index) => {
    if (condition(el)) potentialArray.push(index);
  });
  return potentialArray[Math.floor(Math.random() * potentialArray.length)];
}

export function getRandomElement<T>(array: T[], condition: (el: T) => boolean = () => true) {
  return array[getRandomIndex(array, condition)];
}

export function printMap(
  map: Map,
  className: (tile: TileGenerator | Tile) => string,
  text: (tile: TileGenerator | Tile) => string
) {
  let seen_grid = Array(map.size).fill("");
  map.tiles.forEach((tile) => (seen_grid[tile.row] += '<div class="' + className(tile) + '">' + text(tile) + "</div>"));
  let output = "";
  seen_grid.forEach((row) => (output += '<div class="row">' + row + "</div>"));

  const display = document.getElementById("text_display") as HTMLElement;
  display.innerHTML = output;
  display.style.display = "block";
}
