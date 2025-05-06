import "../types.js";
import { Tile } from "./Tile.js";

export class Map {
  static tribe = "Ai-mo";

  /** @type {Tile[]} */
  map;
  /** @type {Size} */
  size;

  /**
   * @param {Size} size
   */
  constructor(size) {
    this.size = size;
  }

  /**
   * @param {Tile} center
   * @param {Number} offset
   * @returns {Number[]} list of the tiles index in the border
   */
  getBorderTilesIndex(center, offset) {
    let borderTilesIndex = [];
    this.map.forEach((t, i) => {
      if (t.col >= center.col - offset && t.col <= center.col + offset) {
        if (t.row === center.row - offset) borderTilesIndex.push(i);
        if (t.row === center.row + offset) borderTilesIndex.push(i);
      }
      if (t.row > center.row - offset && t.row < center.row + offset) {
        if (t.col === center.col - offset) borderTilesIndex.push(i);
        if (t.col === center.col + offset) borderTilesIndex.push(i);
      }
    });
    return borderTilesIndex;
  }
}
