import { Tile } from "../Tile.js";
import { TileGenerator } from "../Generator/TileGenerator.js";
import { CitySimulator } from "./CitySimulator.js";

export class TileSimulator extends Tile {
  /** @type {Boolean} */
  known = false;
  /** @type {CitySimulator | null} */
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
