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
  /** @type {Terraforming[] | null} */
  terraform = null;

  /**
   * @param {TileGenerator} tileGenerator
   */
  constructor(tileGenerator) {
    super(tileGenerator.row, tileGenerator.col);
    this.biome = tileGenerator.biome;
    if (this.biome !== "mountain") this.terraform = [];
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
    newTile.terraform = this.terraform ? this.terraform.slice() : null;
    return newTile;
  }
}
