import { Simulator } from "./Simulator.js";
import { TileSimulator } from "./TileSimulator.js";

export class Action {
  static DATA = {};

  /** @type {TypeAction} */
  type;

  /** @type {TileSimulator} */
  tile;
  /** @type {Simulator} */
  simulator;

  /**
   * @param {TypeAction} type
   * @param {TileSimulator} tile
   * @param {Simulator} simulator
   */
  constructor(type, tile, simulator) {
    this.type = type;
    this.tile = tile;
    this.simulator = simulator;
  }

  apply() {
    this.simulator.map.stars -= Action.DATA[this.type].cost;
    this.simulator.actions.push(this);
    this.tile.city.addPopulations(Action.DATA[this.type].production, this.simulator.map);
  }
}

export class Build extends Action {
  /**
   * @param {Building} type
   * @param {TileSimulator} tile
   * @param {Simulator} simulator
   */
  constructor(type, tile, simulator) {
    super(type, tile, simulator);
  }

  apply() {
    super.apply();
    this.tile.building = this.type;
  }
}

export class BuildTemple extends Build {
  /**
   * @param {Temple} type
   * @param {TileSimulator} tile
   * @param {Simulator} simulator
   */
  constructor(type, tile, simulator) {
    super(type, tile, simulator);
  }

  apply() {
    super.apply();
  }
}

export class BuildExploitation extends Build {
  /**
   * @param {Exploitation} type
   * @param {TileSimulator} tile
   * @param {Simulator} simulator
   */
  constructor(type, tile, simulator) {
    super(type, tile, simulator);
  }

  apply() {
    super.apply();
    //increase level of neighbors SpecialBuilding
  }
}

export class Forage extends Action {
  /**
   * @param {Foraging} type
   * @param {TileSimulator} tile
   * @param {Simulator} simulator
   */
  constructor(type, tile, simulator) {
    super(type, tile, simulator);
  }

  apply() {
    super.apply();
    this.tile.resource = null;
  }
}

export class Terraform extends Action {
  /**
   * @param {Terraforming} type
   * @param {TileSimulator} tile
   * @param {Simulator} simulator
   */
  constructor(type, tile, simulator) {
    super(type, tile, simulator);
  }

  apply() {
    super.apply();
    this.tile.resource = null;
    if (this.type === "grow forest") this.tile.biome = "forest";
    else this.tile.biome = "field";

    if (this.type === "burn forest") this.tile.resource = "crop";
    else this.tile.resource = null;
  }
}

export class EndTurn extends Action {
  /**
   * @param {Simulator} simulator
   */
  constructor(simulator) {
    super("end turn", undefined, simulator);
  }

  apply() {
    this.simulator.endTurn();
  }
}

Action.DATA = {
  "forest temple": { cost: 15, production: 1, class: BuildTemple },
  "mountain temple": { cost: 20, production: 1, class: BuildTemple },
  temple: { cost: 20, production: 1, class: BuildTemple },
  "lumber hut": { cost: 3, production: 1, class: BuildExploitation },
  farm: { cost: 5, production: 2, class: BuildExploitation },
  mine: { cost: 5, production: 2, class: BuildExploitation },
  hunting: { cost: 2, production: 1, class: Forage },
  harvest: { cost: 2, production: 1, class: Forage },
  "clear forest": { cost: -1, production: 0, class: Terraform },
  "burn forest": { cost: 5, production: 0, class: Terraform },
  "grow forest": { cost: 5, production: 0, class: Terraform },
};
