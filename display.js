import { MapGenerator, Tile } from "./generate.js";

const general_terrain = ["crop", "metal", "village", "lighthouse", "lighthouse"];
const terrain = ["forest", "fruit", "animal", "field", "mountain", "capital"];

let assets = [];

function get_image(src) {
  let image = new Image();
  image.src = src;
  return image;
}

export let get_assets = new Promise((resolve) => {
  for (let g_terr of general_terrain) {
    assets[g_terr] = get_image("assets/" + g_terr + ".png");
  }
  for (let terr of terrain) {
    assets[terr] = get_image("assets/" + MapGenerator.tribe + "/" + MapGenerator.tribe + " " + terr + ".png");
  }

  resolve();
});

/**
 *
 * @param {MapGenerator} map
 */
export function display_map(map) {
  /** @type {HTMLCanvasElement} */
  let canvas_html = document.getElementById("canvas_html");
  canvas_html.width = window.innerWidth;
  canvas_html.height = window.innerHeight;
  let canvas = canvas_html.getContext("2d");

  const margin = 64;
  let default_image = assets["field"];
  let tile_height = (canvas_html.height - margin * 2) / (map.size * Tile.ratio_ground);
  let tile_width = (default_image.width * tile_height) / default_image.height;
  if (canvas_html.width < canvas_html.height) {
    tile_width = (canvas_html.width - margin * 2) / map.size;
    tile_height = (default_image.height * tile_width) / default_image.width;
  }

  console.log(tile_width, tile_height);

  for (let tile of map.map) {
    let x = canvas_html.width / 2 - tile_width / 2 + (tile.x * tile_width) / 2;
    let y = canvas_html.height / 2 - tile_width / 2 + (tile.y * (tile_height * Tile.ratio_ground)) / 2;
    let biome = tile.biome;
    let above = tile.above;

    function draw(image, lowering = 0) {
      canvas.drawImage(image, x, y - lowering * tile_height, tile_width, (image.height * tile_width) / image.width);
    }

    draw(assets["field"]);
    if (biome !== "field") draw(assets[biome], 0.2);

    if (above) {
      let lowering = 0;
      if (above === "capital") lowering = 0.3;
      else if (above === "lighthouse") lowering = 0.5;
      else if (above === "metal") lowering = 0.1;
      draw(assets[above], lowering);
    }
  }
}
