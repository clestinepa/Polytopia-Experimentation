import { Map } from "./models/Map.js";
import { Display } from "./models/Display.js";

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

export let assets = [];

function get_image(src) {
  let image = new Image();
  image.src = src;
  return image;
}

function get_colored_svg(src) {
  let image = new Image();
  image.src = src;
  image.style.color = Display.color;
  image.style.opacity = Display.opacity_border;
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
