import { getRandomIndex, randomInt } from "../../utils.js";
import { TileGenerator } from "./TileGenerator.js";
import { ProbsGeneration } from "./ProbsGeneration.js";
import { Size } from "../../types.js";

/** NEXT STEPS :
 *  - All tribes are guaranteed to have at least two identical resources in their capital (fruit, animal).
 *  - Terrain will always be generated in accordance with the percentage rates
 *      for example, Luxidoor will always have 48% of their biome (or as close as possible) as field tiles.
 *      => do not generate tile alone but all tiles together
 */

export class MapGenerator {
  probs: ProbsGeneration;
  tiles: TileGenerator[];
  size: Size;

  private _potentialVillages: boolean[];

  constructor() {
    const radios = document.getElementsByName("map_size") as NodeListOf<HTMLInputElement>;
    const checked = Array.from(radios).find((r) => r.checked) as HTMLInputElement;
    this.size = parseInt(checked.value) as Size;

    this.probs = new ProbsGeneration();

    this.tiles = Array.from({ length: this.size ** 2 }, (_, i) => {
      let row = Math.floor(i / this.size);
      let col = i % this.size;
      return new TileGenerator(row, col);
    });

    this._potentialVillages = Array.from({ length: this.size ** 2 }, (_, i) => {
      let row = Math.floor(i / this.size);
      let col = i % this.size;
      return !(row === 0 || row === this.size - 1 || col === 0 || col === this.size - 1);
    });
  }

  _getBorderTilesIndex(center: TileGenerator, offset: number) {
    let borderTilesIndex: number[] = [];
    this.tiles.forEach((t, i) => {
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

  _generateLighthouse() {
    [
      0 * this.size + 0,
      0 * this.size + (this.size - 1),
      (this.size - 1) * this.size + 0,
      (this.size - 1) * this.size + (this.size - 1),
    ].forEach((corner) => (this.tiles[corner].biome = "lighthouse"));
  }

  _generateCapital() {
    //cannot be to close from the edge
    let min = 2;
    let max = this.size - 3;
    let index = randomInt(min, max) * this.size + randomInt(min, max);
    this.tiles[index].biome = "capital";
    this._potentialVillages[index] = false;
    this._getBorderTilesIndex(this.tiles[index], 2).forEach((i) => {
      this.tiles[i].territory = "outer";
      this._potentialVillages[i] = false;
      this.tiles[i].known = true;
    });
    this._getBorderTilesIndex(this.tiles[index], 1).forEach((i) => {
      this.tiles[i].territory = "inner";
      this._potentialVillages[i] = false;
      this.tiles[i].isCapitalCity = true;
    });
  }

  _generateBiome() {
    this.tiles.forEach((tile, i) => {
      let rand = Math.random(); // 0 forest field mountain 1
      if (rand < this.probs.forest.prob) tile.biome = "forest";
      else if (rand > 1 - this.probs.mountain.prob) {
        tile.biome = "mountain";
        this._potentialVillages[i] = false;
      }
    });
  }

  _generateVillage() {
    while (this._potentialVillages.indexOf(true) !== -1) {
      let index = getRandomIndex(this._potentialVillages, (isPotential) => isPotential);
      this.tiles[index].biome = "village";
      this._potentialVillages[index] = false;
      this._getBorderTilesIndex(this.tiles[index], 2).forEach((i) => {
        this.tiles[i].territory = "outer";
        this._potentialVillages[i] = false;
      });
      this._getBorderTilesIndex(this.tiles[index], 1).forEach((i) => {
        this.tiles[i].territory = "inner";
        this._potentialVillages[i] = false;
      });
    }
  }

  _generateResources() {
    for (let tile of this.tiles) {
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
    this._generateCapital();
    this._generateLighthouse();
    this._generateBiome();
    this._generateVillage();
    this._generateResources();
    console.timeEnd("Generation");
  }
}
