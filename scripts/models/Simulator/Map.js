import "../../types.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { City } from "./City.js";
import { TileSimulator } from "./TileSimulator.js";

export class Map {
  static tribe = "Ai-mo";

  /** @type {Number} */
  #populations;
  /** @type {Number} */
  #stars;
  /** @type {Number} */
  #stars_production;

  /** @type {Size} */
  size;
  /** @type {TileSimulator[]} */
  tiles;
  /** @type {City[]} */
  cities = [];

  /**
   * @param {MapGenerator} map
   */
  constructor(map) {
    this.size = map.size;
    this.tiles = Array.from({ length: this.size ** 2 }, (_, i) => {
      const tile = new TileSimulator(map.tiles[i]);
      if (map.tiles[i].isCapitalCity) {
        if (this.cities.length === 0) this.cities.push(new City(tile, 1));
        else this.cities[0].addTile(tile);
      }
      return tile;
    });
  }

  get populations() {
    return this.#populations;
  }
  get stars() {
    return this.#stars;
  }
  get stars_production() {
    return this.#stars_production;
  }

  set populations(value) {
    this.#populations = value;
    document.getElementById("populations").innerHTML = this.#populations;
  }
  set stars(value) {
    this.#stars = value;
    document.getElementById("stars").innerHTML = this.#stars;
  }
  set stars_production(value) {
    this.#stars_production = value;
    document.getElementById("stars_production").innerHTML = this.#stars_production;
  }
}
