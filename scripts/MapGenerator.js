import { Tile } from "/scripts/Tile.js";
import { randomInt } from "/scripts/utils.js";

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
  /** @type {boolean[]} */
  potentialVillages;
  /** @type {Size} */
  size;

  constructor() {
    console.time("Initialization");
    this.size = parseInt(Array.from(document.getElementsByName("map_size")).find((r) => r.checked).value);
    this.map = new Array(this.size ** 2);
    this.potentialVillages = new Array(this.size ** 2).fill(true);
    for (let i = 0; i < this.size ** 2; i++) {
      let row = Math.floor(i / this.size);
      let col = i % this.size;
      this.map[i] = new Tile(row, col);
      if (row === 0 || row === this.size - 1 || col === 0 || this.col === this.size - 1)
        this.potentialVillages[i] = false; // villages don't spawn next to the map border
    }
    console.timeEnd("Initialization");
  }

  /**
   * @param {Tile} center
   * @param {Number} offset
   * @returns list of the tiles index in the border
   */
  _getBorderTilesIndex(center, offset) {
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

  _getRandomVillageIndex() {
    let potentialTiles = [];
    this.potentialVillages.forEach((isPotential, index) => {
      if (isPotential) potentialTiles.push(index);
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
    this.potentialVillages[index] = false;
    this._getBorderTilesIndex(this.map[index], 2).forEach((i) => (this.potentialVillages[i] = false));
    this._getBorderTilesIndex(this.map[index], 1).forEach((i) => {
      this.potentialVillages[i] = false;
      this.map[i].territory = "initial";
    });
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
    for (let i = 0; i < this.size ** 2; i++) {
      if (!this.map[i].above) {
        let rand = Math.random(); // 0 (---forest---)--field--(-mountain-) 1
        if (rand < MapGenerator.general_probs["forest"]) this.map[i].biome = "forest";
        else if (rand > 1 - MapGenerator.general_probs["mountain"]) {
          this.map[i].biome = "mountain";
          this.potentialVillages[i] = false;
        }
      }
    }
    console.timeEnd("Biome generation");
  }

  _generateVillage() {
    console.time("Village generation");
    while (this.potentialVillages.indexOf(true) !== -1) {
      let new_village_index = this._getRandomVillageIndex();
      this.map[new_village_index].above = "village";
      this.potentialVillages[new_village_index] = false;
      this._getBorderTilesIndex(this.map[new_village_index], 2).forEach((i) => (this.potentialVillages[i] = false));
      this._getBorderTilesIndex(this.map[new_village_index], 1).forEach((i) => {
        this.potentialVillages[i] = false;
        this.map[i].territory = "initial";
      });
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
