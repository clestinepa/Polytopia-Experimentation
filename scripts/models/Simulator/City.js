import { TileGenerator } from "../Generator/TileGenerator.js";
import { Map } from "./Map.js";
import { TileSimulator } from "./TileSimulator.js";

export class City {
  /** @type {Number | null} */
  city_id;
  /** @typedef {Number} */
  level = 1;
  /** @type {Number} */
  populations = 0;
  /** @type {Number} */
  total_populations = 0;
  /** @type {Number} */
  stars_production;

  /** @type {TileSimulator[]} */
  tiles;

  /**
   * @param {TileSimulator} tile
   * @param {Number} id
   */
  constructor(tile, id) {
    this.tiles = [tile];
    this.city_id = id;
    this.linkCityToTile(tile);
    this.stars_production = this.city_id === 0 ? 2 : 1;
  }

  /**
   * @param {TileSimulator} tile
   */
  linkCityToTile(tile) {
    tile.city = this;
    tile.city_id = this.city_id;
  }

  /**
   * @param {TileSimulator} tile
   */
  addTile(tile) {
    this.tiles.push(tile);
    this.linkCityToTile(tile);
  }

  /**
   * @param {Map} map
   * @param {Number} value
   */
  increasePopulations(map, value) {
    this.populations += value;
    this.total_populations += value;
    map.populations += value;
  }

  /**
   * @param {Map} map
   * @param {Number} value
   */
  increaseStarProduction(map, value = 1) {
    this.stars_production += value;
    map.stars_production += value;
  }

  /**
   * @param {Number} value
   * @param {Map} map
   */
  addPopulations(value, map) {
    this.increasePopulations(map, value);
    if (this.populations >= this.level + 1) {
      this.level++;
      this.increaseStarProduction(map);
      if (this.level === 2) this.increaseStarProduction(map);
      else if (this.level === 3) map.stars += 5;
      else if (this.level === 4) this.increasePopulations(map, 3);
      else if (this.level >= 5) this.increaseStarProduction(map);
      this.populations -= this.level;
      console.log("City is levelling to level " + this.level);
    }
  }

  /** Clone without tiles */
  clone() {
    /** @type {City} */
    const newCity = Object.create(City.prototype); //random param, they will be overwrite
    newCity.city_id = this.city_id;
    newCity.level = this.level;
    newCity.populations = this.populations;
    newCity.total_populations = this.total_populations;
    newCity.stars_production = this.stars_production;
    newCity.tiles = [];
    return newCity;
  }
}
