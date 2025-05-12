import { MapSimulator } from "./MapSimulator.js";
import { TileSimulator } from "./TileSimulator.js";

export class CitySimulator {
  /** @type {Number | null} */
  #city_id;
  /** @typedef {Number} */
  #level = 1;
  /** @type {Number} */
  #populations = 0;
  /** @type {Number} */
  #total_populations = 0;
  /** @type {Number} */
  #stars_production;

  /** @type {TileSimulator[]} */
  tiles;

  /**
   * @param {TileSimulator} tile
   * @param {Number} id
   */
  constructor(tile, id) {
    this.tiles = [tile];
    this.#city_id = id;
    tile.city = this;
    this.#stars_production = this.#city_id === 1 ? 2 : 1;
  }

  get city_id() {
    return this.#city_id;
  }
  get level() {
    return this.#level;
  }
  get total_populations() {
    return this.#total_populations;
  }
  get stars_production() {
    return this.#stars_production;
  }

  /**
   * @param {TileSimulator} tile
   */
  addTile(tile) {
    this.tiles.push(tile);
    tile.city = this;
  }

  /**
   * @param {MapSimulator} map
   * @param {Number} value
   */
  increasePopulations(map, value) {
    this.#populations += value;
    this.#total_populations += value;
    map.populations += value;
  }

  /**
   * @param {MapSimulator} map
   * @param {Number} value
   */
  increaseStarProduction(map, value = 1) {
    this.#stars_production += value;
    map.stars_production += value;
  }

  /**
   * @param {Number} value
   * @param {MapSimulator} map
   */
  addPopulations(value, map) {
    this.increasePopulations(map, value);
    if (this.#populations >= this.#level + 1) {
      this.#level++;
      this.increaseStarProduction(map);
      if (this.#level === 2) this.increaseStarProduction(map);
      else if (this.#level === 3) map.stars += 5;
      else if (this.#level === 4) this.increasePopulations(map, 3);
      else if (this.#level >= 5) this.increaseStarProduction(map);
      this.#populations -= this.#level;
      console.log("City is levelling to level " + this.#level);
    }
  }
}
