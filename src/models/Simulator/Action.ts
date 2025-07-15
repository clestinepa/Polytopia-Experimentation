import { Building, Exploitation, Foraging, Resource, Temple, Terraforming, TypeAction } from "../../types.js";
import { getRandomElement } from "../../utils.js";
import { State } from "./State.js";
import { TileSimulator } from "./TileSimulator.js";

export type ActionClass = BuildTemple | BuildExploitation | Forage | Terraform | EndTurn;
export type ActionData = {
  [key in TypeAction]: {
    cost: number;
    production: number;
    class: key extends Temple
      ? typeof BuildTemple
      : key extends Terraforming
      ? typeof Terraform
      : key extends Exploitation
      ? typeof BuildExploitation
      : key extends Foraging
      ? typeof Forage
      : typeof EndTurn;
  };
};

export class Action {
  static DATA: ActionData;
  static MAX_COST = 20; //max cost of an action

  type: TypeAction;

  tile: TileSimulator | undefined;
  tilesPossible: TileSimulator[];
  state: State;

  constructor(state: State, tile: TileSimulator | undefined, type: TypeAction) {
    this.type = type;
    if (tile) this.tilesPossible = [tile];
    else this.tilesPossible = [];
    this.state = state;
  }

  apply() {
    if (!this.tile) {
      this.tile = getRandomElement(this.tilesPossible);
      if (this.tile.city) {
        this.state.stars -= Action.DATA[this.type].cost;
        return this.tile.city.addPopulations(this.state, Action.DATA[this.type].production);
      }
    }
    return false;
  }

  undo() {
    if (this.tile && this.tile.city) {
      this.state.stars += Action.DATA[this.type].cost;
      this.tile.city.removePopulations(this.state, Action.DATA[this.type].production);
    }
  }

  addPossibleTile(tile: TileSimulator) {
    this.tilesPossible.push(tile);
  }

  clone(state: State) {
    const ActionClass = Action.DATA[this.type].class;
    const newAction = Object.create(ActionClass.prototype) as InstanceType<typeof ActionClass>;
    newAction.type = this.type;

    newAction.tile = this.tile ? state.map.getTile(this.tile.row, this.tile.col) : undefined;
    newAction.tilesPossible = this.tilesPossible.map((tile) => state.map.getTile(tile.row, tile.col));
    newAction.state = state;

    return newAction;
  }

  get futureScore() {
    const clone = this.state.clone();
    const testAction = this.clone(clone);
    testAction.apply();
    return clone.score;
  }
}

export class Build extends Action {
  constructor(state: State, tile: TileSimulator, type: TypeAction) {
    super(state, tile, type);
  }

  apply() {
    const cityLevelling = super.apply();
    if (this.tile) {
      this.tile.building = this.type as Building;
    }
    return cityLevelling;
  }

  undo() {
    super.undo();
    if (this.tile) {
      this.tile.building = null;
    }
  }
}

export class BuildTemple extends Build {
  constructor(state: State, tile: TileSimulator, type: TypeAction) {
    super(state, tile, type);
  }

  apply() {
    return super.apply();
  }

  undo() {
    super.undo();
  }
}

export class BuildExploitation extends Build {
  constructor(state: State, tile: TileSimulator, type: TypeAction) {
    super(state, tile, type);
  }

  apply() {
    return super.apply();
    //increase level of neighbors SpecialBuilding
  }
  undo() {
    super.undo();
  }
}

export class Forage extends Action {
  prevResource: Resource | null = null;

  constructor(state: State, tile: TileSimulator, type: TypeAction) {
    super(state, tile, type);
  }

  apply() {
    const cityLevelling = super.apply();
    if (this.tile) {
      this.prevResource = this.tile.resource;
      this.tile.resource = null;
    }
    return cityLevelling;
  }
  undo() {
    super.undo();
    if (this.tile) {
      this.tile.resource = this.prevResource;
      this.prevResource = null;
    }
  }

  clone(state: State) {
    const newAction = super.clone(state) as Forage;
    newAction.prevResource = this.prevResource;
    return newAction;
  }
}

export class Terraform extends Action {
  prevResource: Resource | null = null;

  constructor(state: State, tile: TileSimulator, type: TypeAction) {
    super(state, tile, type);
  }

  apply() {
    const cityLevelling = super.apply();
    if (this.tile) {
      this.prevResource = this.tile.resource;
      this.tile.resource = this.type === "burn forest" ? "crop" : null;
      if (this.type === "grow forest") {
        this.tile.biome = "forest";
        this.tile.hasBeenGrown = true;
      } else this.tile.biome = "field";
      this.tile.hasBeenTerraform++;
    }
    return cityLevelling;
  }
  undo() {
    super.undo();
    if (this.tile) {
      this.tile.resource = this.prevResource;
      this.prevResource = null;
      if (this.type === "grow forest") {
        this.tile.biome = "field";
        this.tile.hasBeenGrown = false;
      } else this.tile.biome = "forest";
      this.tile.hasBeenTerraform--;
    }
  }

  clone(state: State) {
    const newAction = super.clone(state) as Terraform;
    newAction.prevResource = this.prevResource;
    return newAction;
  }
}

export class EndTurn extends Action {
  constructor(state: State) {
    super(state, undefined, "end turn");
  }

  apply() {
    this.state.turn++;
    this.state.stars += this.state.stars_production;
    return false;
  }
  undo() {
    this.state.turn--;
    this.state.stars -= this.state.stars_production;
  }

  clone(state: State) {
    return new EndTurn(state);
  }
}

Action.DATA = {
  "end turn": { cost: 0, production: 0, class: EndTurn },
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
