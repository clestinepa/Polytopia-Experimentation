import { Size } from "../../types.js";
import { getRandomElement, randomInt } from "../../utils.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { City } from "./City.js";
import { Tile } from "./Tile.js";

export class Map {
  static tribe: "Ai-mo" = "Ai-mo";
  static city_name = {
    "Ai-mo": [" ", "dee", "fï", "kï", "lee", "lï", "nï", "po", "pï", "so", "sï", "to", "tï"],
  };

  isDisplayMap: boolean;
  size: Size;
  tiles: Tile[];
  cities: City[] = [];

  constructor(map: MapGenerator, isDisplayMap: boolean = false) {
    this.isDisplayMap = isDisplayMap;
    this.size = map.size;
    this.tiles = Array.from({ length: this.size ** 2 }, (_, i) => {
      const tile = new Tile(map.tiles[i]);
      if (map.tiles[i].isCapitalCity) {
        if (this.cities.length === 0) this.cities.push(new City(tile, this.newCityName, true));
        else this.cities[0].addTile(tile);
      }
      return tile;
    });
  }

  get newCityName() {
    let city_name: string = "";
    while (city_name === "" || this.cities.find((c) => c.name === city_name)) {
      for (let i = 0; i < randomInt(2, 5); i++) {
        city_name += getRandomElement(Map.city_name[Map.tribe]);
      }
    }
    return city_name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Clone everything and link cities and tiles together thanks to the city_name.
   * A clone has isDisplayMap to false.
   * @returns the cloned map
   */
  clone() {
    const newMap = Object.create(Map.prototype) as Map;
    newMap.size = this.size;
    newMap.isDisplayMap = false;
    newMap.tiles = this.tiles.map((tile) => tile.clone());
    newMap.cities = this.cities.map((city) => city.clone());
    //link cities and tiles together
    newMap.tiles.forEach((tile) => {
      if (tile.city_name !== null) newMap.cities.find((c) => c.name === tile.city_name)?.addTile(tile);
    });

    return newMap;
  }
}
