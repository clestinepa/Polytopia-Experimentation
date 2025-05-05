import { randomInt } from "./utils.js";

/**
 * @typedef {11 | 14 | 16 | 18 | 20 | 30} Size
 * @typedef {"field" | "forest" | "mountain"} Biome
 * @typedef {"crop" | "metal" | "village" | "lighthouse" | "fruit" | "animal" | "capital" | null} Above
 * @typedef {"city" | "initial" | "virgin"} Territory
 */

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

export class MapGenerator {
  static tribe = "Ai-mo";
  static general_probs = {
    //biome
    mountain: 0.15 * 1.5,
    forest: 0.4,
    //above
    fruit: 0.5,
    crop: 0.5 * 0.1,
    animal: 0.5,
    metal: 0.5,
  };

  /** @type {Tile[]} */
  map;
  /** @type {Size} */
  size;

  constructor() {
    console.time("Initialization");
    this.size = parseInt(Array.from(document.getElementsByName("map_size")).find((r) => r.checked).value);
    this.map = Array.from({ length: this.size ** 2 }, (_, i) => new Tile(i, this.size));
    console.timeEnd("Initialization");
  }

  /**
   * @param {Tile} center
   * @param {Number} offset
   * @returns list of tiles in the border
   */
  _getBorderTiles(center, offset) {
    let borderTiles = [];
    this.map.forEach((t) => {
      if (t.col >= center.col - offset && t.col <= center.col + offset) {
        if (t.row === center.row - offset) borderTiles.push(t);
        if (t.row === center.row + offset) borderTiles.push(t);
      }
      if (t.row > center.row - offset && t.row < center.row + offset) {
        if (t.col === center.col - offset) borderTiles.push(t);
        if (t.col === center.col + offset) borderTiles.push(t);
      }
    });
    return borderTiles;
  }

  /**
   * @param {(tile: Tile) => boolean} condition
   * @returns index of a random Tile with the condition
   */
  _getRandomTileIndex(condition) {
    let potentialTiles = [];
    this.map.forEach((tile, index) => {
      if (condition(tile)) potentialTiles.push(index);
    });
    return potentialTiles[Math.floor(Math.random() * potentialTiles.length)];
  }

  _generateCapital() {
    console.time("Capital position");
    //cannot be to close from the edge
    let min = 2;
    let max = this.size - 3;
    let index = randomInt(min, max) * this.size + randomInt(min, max);
    this.map[index].above = "capital";
    this._getBorderTiles(this.map[index], 2).forEach((tile) => (tile.isPotentialVillage = false));
    this._getBorderTiles(this.map[index], 1).forEach((tile) => (tile.territory = "initial"));
    console.timeEnd("Capital position");
  }

  _generateLighthouse() {
    console.time("Lighthouse generation");
    [
      0 * this.size + 0,
      0 * this.size + (this.size - 1),
      (this.size - 1) * this.size + 0,
      (this.size - 1) * this.size + (this.size - 1),
    ].forEach((corner) => (this.map[corner].above = "lighthouse"));
    console.timeEnd("Lighthouse generation");
  }

  _generateBiome() {
    console.time("Biome generation");
    for (let cell = 0; cell < this.size ** 2; cell++) {
      if (!this.map[cell].above) {
        let rand = Math.random(); // 0 (---forest---)--field--(-mountain-) 1
        if (rand < MapGenerator.general_probs["forest"]) this.map[cell].biome = "forest";
        else if (rand > 1 - MapGenerator.general_probs["mountain"]) this.map[cell].biome = "mountain";
      }
    }
    console.timeEnd("Biome generation");
  }

  _generateVillage() {
    console.time("Village generation");
    while (this.map.filter((tile) => tile.isPotentialVillage).length !== 0) {
      let new_village_index = this._getRandomTileIndex((tile) => tile.isPotentialVillage);
      this.map[new_village_index].above = "village";
      this._getBorderTiles(this.map[new_village_index], 2).forEach((tile) => (tile.isPotentialVillage = false));
      this._getBorderTiles(this.map[new_village_index], 1).forEach((tile) => (tile.territory = "initial"));
    }
    console.timeEnd("Village generation");
  }

  _generateResources() {
    console.time("Resource generation");
    for (let tile of this.map) {
      switch (tile.biome) {
        case "field":
          let rand = Math.random(); // 0 (---fruit---)--field--(-crop-) 1
          if (rand < MapGenerator.general_probs["fruit"]) tile.above = "fruit";
          else if (rand > 1 - MapGenerator.general_probs["crop"]) tile.above = "crop";
          break;
        case "forest":
          if (Math.random() < MapGenerator.general_probs["animal"]) tile.above = "animal";
          break;
        case "mountain":
          if (Math.random() < MapGenerator.general_probs["metal"]) tile.above = "metal";
          break;
      }
    }
    console.timeEnd("Resource generation");
  }

  generate() {
    this._generateCapital();
    this._generateLighthouse();
    this._generateBiome();
    this._generateVillage();
    this._generateResources();
    // this._printMap(
    //   (tile) => tile.above ?? tile.biome,
    //   (tile) => (tile.above ? tile.above[0] : tile.biome[0])
    // );
  }

  /**
   * @param {(tile: Tile) => string} className
   * @param {(tile: Tile) => string} text
   */
  _printMap(className, text) {
    let seen_grid = Array(this.size).fill("");
    this.map.forEach(
      (tile) => (seen_grid[tile.row] += '<div class="' + className(tile) + '">' + text(tile) + "</div>")
    );
    let output = "";
    seen_grid.forEach((row) => (output += '<div class="row">' + row + "</div>"));

    document.getElementById("text_display").innerHTML = output;
    document.getElementById("text_display").style.display = "block";
  }
}
