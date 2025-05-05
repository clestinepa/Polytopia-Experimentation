export class Tile {
  static ratio_ground = 0.63;

  /** @type {Number} */
  row;
  /** @type {Number} */
  col;
  /** @type {Number} */
  x;
  /** @type {Number} */
  y;

  /** @type {Biome} */
  #biome = "field";
  /** @type {Above} */
  #above = null;
  /** @type {Territory} */
  #territory = "virgin";
  /** @type {boolean} */
  isPotentialVillage = true;

  /**
   * @param {Number} i
   * @param {Number} size
   */
  constructor(i, size) {
    this.row = Math.floor(i / size);
    this.col = i % size;

    this.x = this.col - this.row;
    this.y = this.col + this.row - (size - 1);

    if (this.row === 0 || this.row === size - 1 || this.col === 0 || this.col === size - 1)
      this.isPotentialVillage = false; // villages don't spawn next to the map border
  }

  /**
   * @param {Biome} value
   */
  set biome(value) {
    if (value === "mountain") {
      this.isPotentialVillage = false;
    }
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
      this.isPotentialVillage = false;
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
    if (value !== "virgin") this.isPotentialVillage = false;
    this.#territory = value;
  }
  get territory() {
    return this.#territory;
  }
}
