import { Biome, Resource, Territory } from "../../types.js";
import { Tile } from "../Tile.js";

export class TileGenerator extends Tile {
  private _biome: Biome = "field";
  resource: Resource | null = null;
  territory: Territory = "none";
  private _isCapitalCity: boolean = false;
  known: boolean = false;

  constructor(row: number, col: number) {
    super(row, col);
  }

  get biome() {
    return this._biome;
  }
  get isCapitalCity() {
    return this._isCapitalCity;
  }

  set biome(value) {
    this._biome = ["capital", "lighthouse", "village"].includes(this._biome) ? this._biome : value;
    if (this._biome === "capital") this.isCapitalCity = true;
  }
  set isCapitalCity(value) {
    this._isCapitalCity = value;
    if (value) this.known = value;
  }
}
