import { Tile } from "./Tile.js";

export class TileGenerator extends Tile {
  /** @type {Biome} */
  #biome = "field";
  /** @type {Resource} */
  #resource = null;
  /** @type {Territory} */
  #territory = "virgin";

  /**
   * @param {Number} row
   * @param {Number} col
   */
  constructor(row, col) {
    super(row, col);
  }

  /**
   * @param {Biome} value
   */
  set biome(value) {
    this.#biome = ["capital", "lighthouse", "village"].includes(this.#biome) ? this.#biome : value;
    if (this.#biome === "village" || this.#biome === "capital") this.territory = "city";
  }
  get biome() {
    return this.#biome;
  }
  /**
   * @param {Resource} value
   */
  set resource(value) {
    this.#resource = value;
  }
  get resource() {
    return this.#resource;
  }
  /**
   * @param {Territory} value
   */
  set territory(value) {
    this.#territory = value;
  }
  get territory() {
    return this.#territory;
  }
}
