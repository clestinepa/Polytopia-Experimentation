import { State } from "./State.js";
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
   * @param {State} state
   * @param {Number} value
   */
  increasePopulations(state, value) {
    this.populations += value;
    this.total_populations += value;
    state.populations += value;
  }
  /**
   * @param {State} state
   * @param {Number} value
   */
  decreasePopulations(state, value) {
    this.populations -= value;
    this.total_populations -= value;
    state.populations -= value;
  }

  /**
   * @param {State} state
   * @param {Number} value
   */
  increaseStarProduction(state, value = 1) {
    this.stars_production += value;
    state.stars_production += value;
  }
  /**
   * @param {State} state
   * @param {Number} value
   */
  decreaseStarProduction(state, value = 1) {
    this.stars_production -= value;
    state.stars_production -= value;
  }

  /**
   * @param {Number} value
   * @param {State} state
   */
  addPopulations(value, state) {
    this.increasePopulations(state, value);
    if (this.populations >= this.level + 1) {
      this.level++;
      this.increaseStarProduction(state);
      if (this.level === 2) this.increaseStarProduction(state);
      else if (this.level === 3) state.stars += 5;
      else if (this.level === 4) this.increasePopulations(state, 3);
      else if (this.level >= 5) this.increaseStarProduction(state);
      this.populations -= this.level;
      if (state.map.isDisplayMap) console.log("City is levelling to level " + this.level);
    }
  }
  /**
   * @param {Number} value
   * @param {State} state
   */
  removePopulations(value, state) {
    this.decreasePopulations(state, value);
    if (this.populations < 0) {
      this.level--;
      this.decreaseStarProduction(state);
      if (this.level === 1) this.decreaseStarProduction(state);
      else if (this.level === 2) state.stars -= 5;
      else if (this.level === 3) this.decreasePopulations(state, 3);
      else if (this.level >= 4) this.decreaseStarProduction(state);
      this.populations += this.level + 1;
      if (state.map.isDisplayMap) console.log("City is downgrading to level " + this.level);
    }
  }

  /** Clone without tiles */
  clone() {
    /** @type {City} */
    const newCity = Object.create(City.prototype);
    newCity.city_id = this.city_id;
    newCity.level = this.level;
    newCity.populations = this.populations;
    newCity.total_populations = this.total_populations;
    newCity.stars_production = this.stars_production;
    newCity.tiles = [];
    return newCity;
  }
}
