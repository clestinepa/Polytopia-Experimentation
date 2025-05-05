export class Tile {
  static ratio_ground = 0.63;

  /** @type {Number} */
  row;
  /** @type {Number} */
  col;

  /** @type {Biome} */
  #biome = "field";
  /** @type {Above} */
  #above = null;
  /** @type {Territory} */
  #territory = "virgin";

  /**
   * @param {Number} i
   * @param {Number} size
   */
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   * @param {Biome} value
   */
  set biome(value) {
    this.#biome = value;
  }
  get biome() {
    return this.#biome;
  }

  /**
   * @param {Above} value
   */
  set above(value) {
    if (value === "village" || value === "capital") {
      this.#biome = "field";
      this.#territory = "city";
    }
    this.#above = ["capital", "lighthouse", "village"].includes(this.#above) ? this.#above : value;
  }
  get above() {
    return this.#above;
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
