import { Size } from "../../types.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { City } from "./City.js";
import { TileSimulator } from "./TileSimulator.js";

export class Map {
  static tribe: "Ai-mo" = "Ai-mo";

  isDisplayMap: boolean;
  size: Size;
  tiles: TileSimulator[];
  cities: City[] = [];

  constructor(map: MapGenerator, isDisplayMap: boolean = false) {
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

  clone() {
    const newMap = Object.create(Map.prototype) as Map;
    newMap.size = this.size;
    newMap.isDisplayMap = false;
    newMap.tiles = this.tiles.map((tile) => tile.clone());
    newMap.cities = this.cities.map((city) => city.clone());
    //link cities and tiles together
    newMap.tiles.forEach((tile) => {
      if (tile.city_id !== null) newMap.cities[tile.city_id].addTile(tile);
    });
    return newMap;
  }

  getTile(row: number, col: number) {
    return this.tiles[row * this.size + col];
  }
}
