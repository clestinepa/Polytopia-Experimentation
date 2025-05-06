import { Tile } from "./Tile.js";

export class TileGenerator extends Tile {
  /** @type {Biome} */
  #biome = "field";
  /** @type {Resource} */
  #resource = null;
  /** @type {Territory} */
  #territory = "virgin";

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
  get territory() {
    return this.#territory;
  }

  /**
   * @param {Biome} value
   */
  set biome(value) {
    this.#biome = ["capital", "lighthouse", "village"].includes(this.#biome) ? this.#biome : value;
    if (this.#biome === "capital") this.territory = "city";
  }
  /**
   * @param {Resource} value
   */
  set resource(value) {
    this.#resource = value;
  }
  /**
   * @param {Territory} value
   */
  set territory(value) {
    this.#territory = value;
  }
}
