import { Map } from "./models/Simulator/Map.js";

const images = [
  "crop",
  "metal",
  "village",
  "lighthouse",
  "farm",
  "mine",
  "lumber hut",
  "mountain temple",
  "forest temple",
  "temple",
  "clouds",
] as const;
const tribe_images = ["forest", "fruit", "animal", "field", "mountain", "capital"] as const;
const borders = ["top", "right", "bottom", "left"] as const;

type ImagesCommon = (typeof images)[number];
type ImagesTribe = (typeof tribe_images)[number];
type AssetKey = ImagesCommon | ImagesTribe | "borders";
export type AssetKeyBorder = (typeof borders)[number] | "corner top" | "corner right" | "corner bottom" | "corner left";

export let assets: Partial<{
  [key in AssetKey]: key extends "borders" ? Partial<{ [key in AssetKeyBorder]: HTMLImageElement }> : HTMLImageElement;
}> = {};

function get_image(src: string) {
  let image = new Image();
  image.src = src;
  return image;
}

export function get_assets() {
  for (let img of images) assets[img] = get_image(`assets/${img}.png`);
  for (let img of tribe_images) assets[img] = get_image(`assets/${Map.tribe}/${Map.tribe} ${img}.png`);

  assets["borders"] = {};
  for (let svg of borders) {
    assets["borders"][svg] = get_image(`assets/borders/${svg}.svg`);
    assets["borders"][`corner ${svg}`] = get_image(`assets/borders/corner ${svg}.svg`);
  }
}
