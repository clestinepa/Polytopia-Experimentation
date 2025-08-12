import { TileGenerator } from "../Generator/TileGenerator.js";
import { City } from "./City.js";
import { Biome, Building, Resource } from "../../types.js";

export class Tile {
  row: number;
  col: number;

  known: boolean = false;
  city_name: string | null = null;
  city: City | null = null;

  biome: Biome;
  resource: Resource | null;
  building: Building | null = null;

  constructor(tileGenerator: TileGenerator) {
    this.row = tileGenerator.row;
    this.col = tileGenerator.col;
    this.biome = tileGenerator.biome;
    this.resource = tileGenerator.resource;
    this.known = tileGenerator.known;
  }

  /**
   * Clone the tile with city_name but not city (keep it null)
   * @returns the cloned tile
   */
  clone() {
    const newTile = Object.create(Tile.prototype) as Tile;
    newTile.row = this.row;
    newTile.col = this.col;

    newTile.known = this.known;
    newTile.city_name = this.city_name;
    newTile.city = null;

    newTile.biome = this.biome;
    newTile.resource = this.resource;
    newTile.building = this.building;
    return newTile;
  }
}
