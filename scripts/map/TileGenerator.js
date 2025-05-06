import { Tile } from "./Tile.js";

export class TileGenerator extends Tile {
  /** @type {Biome} */
  #biome = "field";
  /** @type {Resource} */
  resource = null;
  /** @type {Territory} */
  territory = "none";
  /** @type {boolean} */
  #isCapitalCity = false;
  /** @type {boolean} */
  known = false;

  /**
   * @param {Number} i
   * @param {Number} size
   */
  constructor(i, size) {
    let row = Math.floor(i / size);
    let col = i % size;
    super(row, col);
  }

  get biome() {
    return this.#biome;
  }
  get isCapitalCity() {
    return this.#isCapitalCity;
  }

  /**
   * @param {Biome} value
   */
  set biome(value) {
    this.#biome = ["capital", "lighthouse", "village"].includes(this.#biome) ? this.#biome : value;
    if (this.#biome === "capital") this.isCapitalCity = true;
  }
  /**
   * @param {Boolean} value
   */
  set isCapitalCity(value) {
    this.#isCapitalCity = value;
    if (value) this.known = value;
  }
}
