export class Tile {
  /** @type {Number} */
  #row;
  /** @type {Number} */
  #col;

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
    this.#row = row;
    this.#col = col;
  }

  get row() {
    return this.#row;
  }
  get col() {
    return this.#col;
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
}
