import { Map } from "./Map.js";
import { TileGenerator } from "./TileGenerator.js";
import { randomInt } from "../utils.js";

export class MapGenerator extends Map {
  static probs = {
    //biome
    mountain: 0.15 * 1.5,
    forest: 0.4,
    //resource
    fruit: 0.5,
    crop: 0.5 * 0.1,
    animal: 0.5,
    metal: 0.5,
  };

  /** @type {boolean[]} */
  #potentialVillages;

  /**
   * @param {Size} size
   */
  constructor(size) {
    super(size);
    this.map = Array.from({ length: this.size ** 2 }, (_, i) => new TileGenerator(i, this.size));
  }

  /**
   * @returns {Number}
   */
  _getRandomVillageIndex() {
    let potentialTiles = [];
    this.#potentialVillages.forEach((isPotential, index) => {
      if (isPotential) potentialTiles.push(index);
    });
    return potentialTiles[Math.floor(Math.random() * potentialTiles.length)];
  }

  _initialization() {
    this.#potentialVillages = new Array(this.size ** 2).fill(true);
    for (let i = 0; i < this.size ** 2; i++) {
      let row = Math.floor(i / this.size);
      let col = i % this.size;
      if (row === 0 || row === this.size - 1 || col === 0 || col === this.size - 1) this.#potentialVillages[i] = false; // villages cannot spawn next to the map border
    }
  }

  _generateCapital() {
    //cannot be to close from the edge
    let min = 2;
    let max = this.size - 3;
    let index = randomInt(min, max) * this.size + randomInt(min, max);
    this.map[index].biome = "capital";
    this.#potentialVillages[index] = false;
    super.getBorderTilesIndex(this.map[index], 2).forEach((i) => (this.#potentialVillages[i] = false));
    super.getBorderTilesIndex(this.map[index], 1).forEach((i) => {
      this.#potentialVillages[i] = false;
      this.map[i].territory = "initial";
    });
  }

  _generateLighthouse() {
    [
      0 * this.size + 0,
      0 * this.size + (this.size - 1),
      (this.size - 1) * this.size + 0,
      (this.size - 1) * this.size + (this.size - 1),
    ].forEach((corner) => (this.map[corner].biome = "lighthouse"));
  }

  _generateBiome() {
    this.map.forEach((tile, i) => {
      let rand = Math.random(); // 0 (---forest---)--field--(-mountain-) 1
      if (rand < MapGenerator.probs["forest"]) tile.biome = "forest";
      else if (rand > 1 - MapGenerator.probs["mountain"]) {
        tile.biome = "mountain";
        this.#potentialVillages[i] = false;
      }
    });
  }

  _generateVillage() {
    while (this.#potentialVillages.indexOf(true) !== -1) {
      let index = this._getRandomVillageIndex();
      this.map[index].biome = "village";
      this.#potentialVillages[index] = false;
      super.getBorderTilesIndex(this.map[index], 2).forEach((i) => (this.#potentialVillages[i] = false));
      super.getBorderTilesIndex(this.map[index], 1).forEach((i) => (this.#potentialVillages[i] = false));
    }
  }

  _generateResources() {
    for (let tile of this.map) {
      switch (tile.biome) {
        case "field":
          let rand = Math.random(); // 0 (---fruit---)--field--(-crop-) 1
          if (rand < MapGenerator.probs["fruit"]) tile.resource = "fruit";
          else if (rand > 1 - MapGenerator.probs["crop"]) tile.resource = "crop";
          break;
        case "forest":
          if (Math.random() < MapGenerator.probs["animal"]) tile.resource = "animal";
          break;
        case "mountain":
          if (Math.random() < MapGenerator.probs["metal"]) tile.resource = "metal";
          break;
      }
    }
  }

  generate() {
    console.time("Generation");
    this._initialization();
    this._generateCapital();
    this._generateLighthouse();
    this._generateBiome();
    this._generateVillage();
    this._generateResources();
    console.timeEnd("Generation");
  }
}
