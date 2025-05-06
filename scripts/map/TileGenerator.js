import { Tile } from "./Tile.js";

export class TileGenerator extends Tile {
  /** @type {Biome} */
  #biome = "field";
  /** @type {Resource} */
  #resource = null;

  /** @type {boolean} */
  #isCapitalCity = false;

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
  get resource() {
    return this.#resource;
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
   * @param {Resource} value
   */
  set resource(value) {
    this.#resource = value;
  }
  /**
   * @param {Boolean} value
   */
  set isCapitalCity(value) {
    this.#isCapitalCity = value;
  }
}
