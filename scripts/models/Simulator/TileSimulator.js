import { Tile } from "../Tile.js";
import { TileGenerator } from "../Generator/TileGenerator.js";
import { City } from "./City.js";

export class TileSimulator extends Tile {
  /** @type {Boolean} */
  known = false;
  /** @type {City | null} */
  city = null;

  /** @type {Biome} */
  biome;
  /** @type {Resource | null} */
  resource;
  /** @type {Building | null} */
  building = null;

  /**
   * @param {TileGenerator} tileGenerator
   */
  constructor(tileGenerator) {
    super(tileGenerator.row, tileGenerator.col);
    this.biome = tileGenerator.biome;
    this.resource = tileGenerator.resource;
    this.known = tileGenerator.known;
  }
}
