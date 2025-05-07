import { Map } from "./Map.js";
import { TileGenerator } from "./TileGenerator.js";
import { getRandomIndex, randomInt } from "../utils.js";
import { ProbsGeneration } from "./ProbsGeneration.js";

/** NEXT STEPS :
 *  - All tribes are guaranteed to have at least two identical resources in their capital (fruit, animal).
 *  - Terrain will always be generated in accordance with the percentage rates
 *      for example, Luxidoor will always have 48% of their biome (or as close as possible) as field tiles.
 *      => do not generate tile alone but all tiles together
 */

export class MapGenerator extends Map {
  /** @type {ProbsGeneration} */
  probs;

  /** @type {boolean[]} */
  #potentialVillages;

  /**
   * @param {Size} size
   */
  constructor(size) {
    super(size);
    this.probs = new ProbsGeneration();
    this.map = Array.from({ length: this.size ** 2 }, (_, i) => new TileGenerator(i, this.size));
  }

  _initialization() {
    this.#potentialVillages = new Array(this.size ** 2).fill(true);
    for (let i = 0; i < this.size ** 2; i++) {
      let row = Math.floor(i / this.size);
      let col = i % this.size;
      if (row === 0 || row === this.size - 1 || col === 0 || col === this.size - 1) this.#potentialVillages[i] = false; // villages cannot spawn next to the map border
    }
  }

  _generateLighthouse() {
    [
      0 * this.size + 0,
      0 * this.size + (this.size - 1),
      (this.size - 1) * this.size + 0,
      (this.size - 1) * this.size + (this.size - 1),
    ].forEach((corner) => (this.map[corner].biome = "lighthouse"));
  }

  _generateCapital() {
    //cannot be to close from the edge
    let min = 2;
    let max = this.size - 3;
    let index = randomInt(min, max) * this.size + randomInt(min, max);
    this.map[index].biome = "capital";
    this.#potentialVillages[index] = false;
    super.getBorderTilesIndex(this.map[index], 2).forEach((i) => {
      this.map[i].territory = "outer";
      this.#potentialVillages[i] = false;
      this.map[i].known = true;
    });
    super.getBorderTilesIndex(this.map[index], 1).forEach((i) => {
      this.map[i].territory = "inner";
      this.#potentialVillages[i] = false;
      this.map[i].isCapitalCity = true;
    });
  }

  _generateBiome() {
    this.map.forEach((tile, i) => {
      let rand = Math.random(); // 0 forest field mountain 1
      if (rand < this.probs.forest.prob) tile.biome = "forest";
      else if (rand > 1 - this.probs.mountain.prob) {
        tile.biome = "mountain";
        this.#potentialVillages[i] = false;
      }
    });
  }

  _generateVillage() {
    while (this.#potentialVillages.indexOf(true) !== -1) {
      let index = getRandomIndex(this.#potentialVillages, (isPotential) => isPotential);
      this.map[index].biome = "village";
      this.#potentialVillages[index] = false;
      super.getBorderTilesIndex(this.map[index], 2).forEach((i) => {
        this.map[i].territory = "outer";
        this.#potentialVillages[i] = false;
      });
      super.getBorderTilesIndex(this.map[index], 1).forEach((i) => {
        this.map[i].territory = "inner";
        this.#potentialVillages[i] = false;
      });
    }
  }

  _generateResources() {
    for (let tile of this.map) {
      if (tile.territory !== "none") {
        switch (tile.biome) {
          case "field":
            let rand = Math.random(); // 0 fruit field crop 1
            if (rand < this.probs.field[tile.territory].fruit) tile.resource = "fruit";
            else if (rand > 1 - this.probs.field[tile.territory].crop) tile.resource = "crop";
            break;
          case "forest":
            if (Math.random() < this.probs.forest[tile.territory].animal) tile.resource = "animal";
            break;
          case "mountain":
            if (Math.random() < this.probs.mountain[tile.territory].metal) tile.resource = "metal";
            break;
        }
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
