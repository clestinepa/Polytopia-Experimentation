import { Biome, Resource, Territory } from "../../types.js";

export class TileGenerator {
  row: number;
  col: number;

  private _biome: Biome = "field";
  resource: Resource | null = null;
  territory: Territory = "none";
  private _isCapitalCity: boolean = false;
  known: boolean = false;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  get biome() {
    return this._biome;
  }
  get isCapitalCity() {
    return this._isCapitalCity;
  }

  set biome(value) {
    this._biome = ["capital", "lighthouse", "village"].includes(this._biome) ? this._biome : value;
    if (this._biome === "capital") this.setCapitalCity();
  }
  setCapitalCity() {
    this._isCapitalCity = true;
    this.known = true;
  }
}
