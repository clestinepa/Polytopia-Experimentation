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

  /** @type {Boolean} */
  isDisplayMap;
  /** @type {Size} */
  size;
  /** @type {TileSimulator[]} */
  tiles;
  /** @type {City[]} */
  cities = [];

  /**
   * @param {MapGenerator} map
   * @param {Boolean} isDisplayMap
   */
  constructor(map, isDisplayMap = false) {
    this.isDisplayMap = isDisplayMap;
    this.size = map.size;
    this.tiles = Array.from({ length: this.size ** 2 }, (_, i) => {
      const tile = new TileSimulator(map.tiles[i]);
      if (map.tiles[i].isCapitalCity) {
        if (this.cities.length === 0) this.cities.push(new City(tile, 0));
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

  clone() {
    const newMap = new Map(new MapGenerator(this.size));
    newMap.populations = this.populations;
    newMap.stars = this.stars;
    newMap.stars_production = this.stars_production;
    newMap.tiles = this.tiles.map((tile) => tile.clone());
    newMap.cities = this.cities.map((city) => city.clone());
    //link cities and tiles together
    newMap.tiles.forEach((tile) => {
      if (tile.city_id !== null) newMap.cities[tile.city_id].addTile(tile);
    });
    return newMap;
  }

  getTile(row, col) {
    return this.tiles[row * this.size + col];
  }
}
