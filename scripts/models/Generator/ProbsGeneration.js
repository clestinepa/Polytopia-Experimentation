import { Map } from "../Simulator/Map.js";

export class ProbsGeneration {
  static #modifiers = {
    "Ai-mo": {
      mountain: 1.5,
      crop: 0.1,
    },
  };
  mountain = {
    prob: 0.14,
    inner: {
      metal: 0.79,
    },
    outer: {
      metal: 0.21,
    },
  };
  forest = {
    prob: 0.38,
    inner: {
      animal: 0.5,
    },
    outer: {
      animal: 0.16,
    },
  };
  field = {
    prob: 0.48,
    inner: {
      fruit: 0.375,
      crop: 0.375,
      none: 0.25,
    },
    outer: {
      fruit: 0.125,
      crop: 0.125,
      none: 0.75,
    },
  };

  constructor() {
    const mods = ProbsGeneration.#modifiers[Map.tribe] || {};

    // 1. Apply mountain modifier and adjust others proportionally
    if (mods.mountain) {
      this.mountain.prob = this.mountain.prob * mods.mountain;
      const remaining = 1 - this.mountain.prob;
      const nonMountainSum = this.forest.prob + this.field.prob;
      this.forest.prob = (this.forest.prob / nonMountainSum) * remaining;
      this.field.prob = (this.field.prob / nonMountainSum) * remaining;
    }

    // 2. Apply forest modifier and adjust field only
    if (mods.forest) {
      this.forest.prob = this.forest.prob * mods.forest;
      const remaining = 1 - this.mountain.prob - this.forest.prob;
      this.field.prob = remaining;
    }

    // 1. Apply fruit modifier and adjust others proportionally
    if (mods.fruit) {
      ["inner", "outer"].forEach((localization) => {
        this.field[localization].fruit = this.field[localization].fruit * mods.fruit;
        const remaining = 1 - this.field[localization].fruit;
        const nonFruitSum = this.field[localization].crop + base.field[localization].none;
        this.field[localization].crop = (this.field[localization].crop / nonFruitSum) * remaining;
        this.field[localization].none = (this.field[localization].none / nonFruitSum) * remaining;
      });
    }

    // 2. Apply forest modifier and adjust none only
    if (mods.crop) {
      ["inner", "outer"].forEach((localization) => {
        this.field[localization].crop = this.field[localization].crop * mods.crop;
        const remaining = 1 - this.field[localization].fruit - this.field[localization].crop;
        this.field[localization].none = remaining;
      });
    }
  }
}
