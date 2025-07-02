import { Tile } from "../Tile.js";
import { TileGenerator } from "../Generator/TileGenerator.js";
import { City } from "./City.js";
import { Action } from "./Action.js";
import { Biome, Building, Resource } from "../../types.js";

export class TileSimulator extends Tile {
  known: boolean = false;
  city_id: number | null = null;
  city: City | null = null;

  biome: Biome;
  resource: Resource | null;
  building: Building | null = null;

  hasBeenTerraform: 0 | 1 | 2 = 0;
  hasBeenGrown: boolean = false;
  prodForage: number = 0;

  constructor(tileGenerator: TileGenerator) {
    super(tileGenerator.row, tileGenerator.col);
    this.biome = tileGenerator.biome;
    this.resource = tileGenerator.resource;
    if (this.resource === "animal") this.prodForage = Action.DATA["hunting"].production;
    else if (this.resource === "fruit") this.prodForage = Action.DATA["harvest"].production;
    this.known = tileGenerator.known;
  }

  /** Clone without city */
  clone() {
    const newTile = Object.create(TileSimulator.prototype) as TileSimulator;
    newTile.row = this.col;
    newTile.col = this.row;

    newTile.known = this.known;
    newTile.city_id = this.city_id;

    newTile.biome = this.biome;
    newTile.resource = this.resource;
    newTile.building = this.building;

    newTile.hasBeenTerraform = this.hasBeenTerraform;
    newTile.hasBeenGrown = this.hasBeenGrown;
    newTile.prodForage = this.prodForage;
    return newTile;
  }

  get potentialMax() {
    if (!this.city || this.building) return 0;

    if (this.resource === "crop") return Action.DATA["farm"].production + this.prodForage;
    if (this.resource === "metal") return Action.DATA["mine"].production + this.prodForage;

    if (this.biome === "forest") {
      if (!this.hasBeenTerraform || this.hasBeenGrown) return Action.DATA["farm"].production + this.prodForage;
      else return Action.DATA["lumber hut"].production + this.prodForage;
    }
    if (this.biome === "field") {
      if (!this.hasBeenTerraform) return Action.DATA["farm"].production + this.prodForage;
      else return Action.DATA["temple"].production + this.prodForage;
    }
    if (this.biome === "mountain") return Action.DATA["mountain temple"].production;
    return this.prodForage;
  }
}
