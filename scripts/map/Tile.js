export class Tile {
  /** @type {Number} */
  #row;
  /** @type {Number} */
  #col;

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
}
