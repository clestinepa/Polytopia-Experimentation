import { Tile } from "../Tile.js";

export class TileGenerator extends Tile {
  /** @type {Biome} */
  #biome = "field";
  /** @type {Resource | null} */
  resource = null;
  /** @type {Territory} */
  territory = "none";
  /** @type {boolean} */
  #isCapitalCity = false;
  /** @type {boolean} */
  known = false;

  /**
   * @param {Number} row
   * @param {Number} col
   */
  constructor(row, col) {
    super(row, col);
  }

  get biome() {
    return this.#biome;
  }
  get isCapitalCity() {
    return this.#isCapitalCity;
  }

  set biome(value) {
    this.#biome = ["capital", "lighthouse", "village"].includes(this.#biome) ? this.#biome : value;
    if (this.#biome === "capital") this.isCapitalCity = true;
  }
  set isCapitalCity(value) {
    this.#isCapitalCity = value;
    if (value) this.known = value;
  }
}
