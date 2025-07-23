import { Size } from "../../types.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { City } from "./City.js";
import { Tile } from "./Tile.js";

export class Map {
  static tribe: "Ai-mo" = "Ai-mo";

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
        if (this.cities.length === 0) this.cities.push(new City(tile, 0));
        else this.cities[0].addTile(tile);
      }
      return tile;
    });
  }

  /**
   * Clone everything and link cities and tiles together thanks to the city_id.
   * A clone has isDisplayMap to false.
   * @returns the cloned map
   */
  clone() {
    const newMap = Object.create(Map.prototype) as Map;
    newMap.size = this.size;
    newMap.isDisplayMap = false;
    newMap.tiles = this.tiles.map((tile) => tile.clone());

    // Create empty city list
    newMap.cities = [];
    // Re-link tiles to cities dynamically using city_id
    for (const tile of newMap.tiles) {
      if (tile.city_id !== null) {
        let city = newMap.cities.find((c) => c.city_id === tile.city_id);
        if (!city) {
          city = new City(tile, tile.city_id);
          newMap.cities[tile.city_id] = city;
        } else {
          city.addTile(tile);
        }
      }
    }

    return newMap;
  }
}
