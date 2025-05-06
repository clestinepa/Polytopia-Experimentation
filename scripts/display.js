import { Map } from "./map/Map.js";
import { MapDisplay } from "./map/MapDisplay.js";

const terrains = ["crop", "metal", "village", "lighthouse", "lighthouse"];
const tribe_terrains = ["forest", "fruit", "animal", "field", "mountain", "capital"];

let assets = [];

function get_image(src) {
  let image = new Image();
  image.src = src;
  return image;
}

export let get_assets = new Promise((resolve) => {
  for (let terrain of terrains) assets[terrain] = get_image(`/assets/${terrain}.png`);

  for (let tribe_terrain of tribe_terrains)
    assets[tribe_terrain] = get_image(`/assets/${Map.tribe}/${Map.tribe} ${tribe_terrain}.png`);

  resolve();
});

/**
 * @param {Map} map
 */
export function display_map(map) {
  /** @type {HTMLCanvasElement} */
  let canvas_html = document.getElementById("canvas_html");
  canvas_html.width = window.innerWidth;
  canvas_html.height = window.innerHeight;
  let canvas = canvas_html.getContext("2d");

  let default_image = assets[MapDisplay.default_asset];
  let tile_height = (canvas_html.height - MapDisplay.canvas_margin * 2) / (map.size * MapDisplay.ratio_ground);
  let tile_width = (default_image.width * tile_height) / default_image.height;
  if (canvas_html.width < canvas_html.height) {
    tile_width = (canvas_html.width - MapDisplay.canvas_margin * 2) / map.size;
    tile_height = (default_image.height * tile_width) / default_image.width;
  }

  for (let tile of map.map) {
    let posX = tile.col - tile.row;
    let deltaX = (posX * tile_width) / 2;
    let posY = tile.col + tile.row - (map.size - 1);
    let deltaY = (posY * (tile_height * MapDisplay.ratio_ground)) / 2;

    let x = canvas_html.width / 2 - tile_width / 2 + deltaX;
    let y = canvas_html.height / 2 - tile_height / 2 + deltaY;

    function draw(image, offsetY = 0) {
      canvas.drawImage(image, x, y - offsetY * tile_height, tile_width, (image.height * tile_width) / image.width);
    }

    draw(assets["field"]);
    if (tile.biome !== "field") draw(assets[tile.biome], MapDisplay.offsetY[tile.biome]);

    if (tile.resource) draw(assets[tile.resource], MapDisplay.offsetY[tile.resource]);
  }
}
