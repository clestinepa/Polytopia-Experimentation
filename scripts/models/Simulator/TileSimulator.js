import { Tile } from "../Tile.js";
import { TileGenerator } from "../Generator/TileGenerator.js";
import { City } from "./City.js";

export class TileSimulator extends Tile {
  /** @type {Boolean} */
  known = false;
  /** @type {Number | null} */
  city_id = null;
  /** @type {City | null} */
  city = null;

  /** @type {Biome} */
  biome;
  /** @type {Resource | null} */
  resource;
  /** @type {Building | null} */
  building = null;
  /** @type {0 | 1 | 2} */
  hasBeenTerraform = 0;
  /** @type {Boolean} */
  hasBeenGrown = false;

  /**
   * @param {TileGenerator} tileGenerator
   */
  constructor(tileGenerator) {
    super(tileGenerator.row, tileGenerator.col);
    this.biome = tileGenerator.biome;
    this.resource = tileGenerator.resource;
    this.known = tileGenerator.known;
  }

  /** Clone without city */
  clone() {
    const newTile = new TileSimulator(new TileGenerator(this.row, this.col));
    newTile.known = this.known;
    newTile.city_id = this.city_id;
    newTile.biome = this.biome;
    newTile.resource = this.resource;
    newTile.building = this.building;
    newTile.hasBeenTerraform = this.hasBeenTerraform;
    newTile.hasBeenGrown = this.hasBeenGrown;
    return newTile;
  }
}
