import { Map } from "./map/Map.js";
import { MapDisplay } from "./map/MapDisplay.js";

const images = [
  "crop",
  "metal",
  "village",
  "lighthouse",
  "lighthouse",
  "farm",
  "mine",
  "lumber hut",
  "mountain temple",
  "forest temple",
  "temple",
  "clouds",
];
const tribe_images = ["forest", "fruit", "animal", "field", "mountain", "capital"];
const borders = ["top", "right", "bottom", "left"];

let assets = [];

function get_image(src) {
  let image = new Image();
  image.src = src;
  return image;
}

function get_colored_svg(src) {
  let image = new Image();
  image.src = src;
  image.style.color = MapDisplay.color;
  image.style.opacity = MapDisplay.opacity_border;
  return image;
}

export let get_assets = new Promise((resolve) => {
  for (let img of images) assets[img] = get_image(`/assets/${img}.png`);
  for (let img of tribe_images) assets[img] = get_image(`/assets/${Map.tribe}/${Map.tribe} ${img}.png`);

  assets["borders"] = [];
  for (let svg of borders) {
    assets["borders"][svg] = get_colored_svg(`/assets/borders/${svg}.svg`);
    assets["borders"][`corner ${svg}`] = get_colored_svg(`/assets/borders/corner ${svg}.svg`);
  }

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
  const max_height = canvas_html.height - MapDisplay.canvas_margin * 2;
  const max_width = canvas_html.width - MapDisplay.canvas_margin * 2;
  let tile_height = max_height / (map.size * MapDisplay.ratio_ground);
  let tile_width = (default_image.width * tile_height) / default_image.height;
  if (tile_width * map.size > max_width) {
    tile_width = max_width / map.size;
    tile_height = (default_image.height * tile_width) / default_image.width;
  }

  let x;
  let y;

  function get_x(tile) {
    let posX = tile.col - tile.row;
    let deltaX = (posX * tile_width) / 2;
    return canvas_html.width / 2 - tile_width / 2 + deltaX;
  }
  function get_y(tile) {
    let posY = tile.col + tile.row - (map.size - 1);
    let deltaY = (posY * (tile_height * MapDisplay.ratio_ground)) / 2;
    return canvas_html.height / 2 - tile_height / 2 + deltaY;
  }
  function draw(image, offsetY = 0) {
    canvas.drawImage(image, x, y - offsetY * tile_height, tile_width, (image.height * tile_width) / image.width);
  }

  for (let tile of map.map) {
    x = get_x(tile);
    y = get_y(tile);

    if (map.actions && !tile.known) {
      draw(assets["clouds"]); //clouds when start exploit
    } else {
      draw(assets["field"]);
      if (tile.biome !== "field") draw(assets[tile.biome], MapDisplay.offsetY[tile.biome]);
      if (tile.resource && !tile.building) draw(assets[tile.resource], MapDisplay.offsetY[tile.resource]);
      if (tile.building) draw(assets[tile.building], MapDisplay.offsetY[tile.building]);
    }
  }

  if (map.cities) {
    map.cities.forEach((city) => {
      const tileSet = new Set(city.tiles.map((t) => `${t.row},${t.col}`));
      const bordersTile = [
        { dr: -1, dc: -1, border: "corner top" },
        { dr: +1, dc: +1, border: "corner bottom" },
        { dr: -1, dc: +1, border: "corner right" },
        { dr: +1, dc: -1, border: "corner left" },
        { dr: -1, dc: 0, border: "top" },
        { dr: +1, dc: 0, border: "bottom" },
        { dr: 0, dc: +1, border: "right" },
        { dr: 0, dc: -1, border: "left" },
      ];

      for (let tile of city.tiles) {
        x = get_x(tile);
        y = get_y(tile);

        for (let { dr, dc, border } of bordersTile) {
          const neighborKey = `${tile.row + dr},${tile.col + dc}`;
          if (!tileSet.has(neighborKey)) {
            draw(assets.borders[border]);
          }
        }
      }
    });
  }
}
