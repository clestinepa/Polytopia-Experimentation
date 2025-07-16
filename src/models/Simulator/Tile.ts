import { TileGenerator } from "../Generator/TileGenerator.js";
import { City } from "./City.js";
import { Biome, Building, Resource } from "../../types.js";

export class Tile {
  row: number;
  col: number;

  known: boolean = false;
  city_id: number | null = null;
  city: City | null = null;

  biome: Biome;
  resource: Resource | null;
  building: Building | null = null;

  hasBeenTerraform: 0 | 1 | 2 = 0;
  hasBeenGrown: boolean = false;

  constructor(tileGenerator: TileGenerator) {
    this.row = tileGenerator.row;
    this.col = tileGenerator.col;
    this.biome = tileGenerator.biome;
    this.resource = tileGenerator.resource;
    this.known = tileGenerator.known;
  }

  /** Clone without city */
  clone() {
    const newTile = Object.create(Tile.prototype) as Tile;
    newTile.row = this.row;
    newTile.col = this.col;

    newTile.known = this.known;
    newTile.city_id = this.city_id;

    newTile.biome = this.biome;
    newTile.resource = this.resource;
    newTile.building = this.building;

    newTile.hasBeenTerraform = this.hasBeenTerraform;
    newTile.hasBeenGrown = this.hasBeenGrown;
    return newTile;
  }
}
