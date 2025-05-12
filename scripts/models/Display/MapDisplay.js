import { Map } from "../Map.js";

export class MapDisplay extends Map {
  static default_asset = "field"; //name of the asset used to calculate height and width
  static ratio_ground = 0.63; //(in %) % of the ground coverage from the top of the default_asset
  static canvas_margin = 64; //(in px) margin of the canvas

  static offsetY = {
    //biome
    forest: 0.1,
    mountain: 0.25,
    capital: 0.3,
    lighthouse: 0.5,
    //building
    farm: 0.05,
    "mountain temple": 0.25,
    "forest temple": 0.1,
  };
}
