import { Map } from "./Map.js";
import { EndTurn, Action } from "./Action.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { runMCTS } from "../MCTS/MCTSRunner.js";
import { TypeAction } from "../../types.js";
import { TileSimulator } from "./TileSimulator.js";

export class State {
  map: Map;

  populations: number = 0;
  stars: number = 5;
  stars_production: number = 2;

  turn: number = 0;
  actionsPossible: Action[] = [];
  actions: Action[] = [];
  indexActions: number = -1;

  constructor(map: MapGenerator, isDisplayMap: boolean = false) {
    this.map = new Map(map, isDisplayMap);
  }

  _addActionPossible(type: TypeAction, tile: TileSimulator) {
    if (this.stars >= Action.DATA[type].cost) {
      const existingAction = this.actionsPossible.find((action) => action.type === type);
      if (existingAction) existingAction.addPossibleTile(tile);
      else {
        const ActionTypeClass = Action.DATA[type].class;
        const action = new ActionTypeClass(this, tile, type);
        this.actionsPossible.push(action);
      }
    }
  }
  defineActionsPossible() {
    this.actionsPossible = [new EndTurn(this)];
    this.map.tiles.forEach((tile) => {
      if (!tile.city || tile.building) return;
      if (tile.biome === "mountain") {
        if (tile.resource === "metal") this._addActionPossible("mine", tile);
        this._addActionPossible("mountain temple", tile);
      } else if (tile.biome === "forest") {
        if (tile.resource === "animal") this._addActionPossible("hunting", tile);
        this._addActionPossible("forest temple", tile);
        if (!tile.hasBeenTerraform) this._addActionPossible("clear forest", tile);
        if (!tile.hasBeenTerraform || tile.hasBeenGrown) this._addActionPossible("burn forest", tile);
        this._addActionPossible("lumber hut", tile);
      } else if (tile.biome === "field") {
        if (tile.resource === "fruit") this._addActionPossible("harvest", tile);
        if (tile.resource === "crop") this._addActionPossible("farm", tile);
        this._addActionPossible("temple", tile);
        if (!tile.hasBeenTerraform) this._addActionPossible("grow forest", tile);
      }
    });
  }

  next(verbose = false) {
    if (this.indexActions === this.actions.length - 1) {
      this.defineActionsPossible();
      const bestAction = runMCTS(this, verbose);
      if (!bestAction) return;
      this.actions.push(bestAction);
      console.log("MCTS choose:", bestAction.type);
    }
    this.indexActions++;
    this.actions[this.indexActions].apply();
  }

  prev() {
    this.actions[this.indexActions--].undo();
  }

  clone() {
    const newSimulator = Object.create(State.prototype) as State;
    newSimulator.populations = this.populations;
    newSimulator.stars = this.stars;
    newSimulator.stars_production = this.stars_production;
    newSimulator.map = this.map.clone();
    newSimulator.turn = this.turn;
    newSimulator.actionsPossible = this.actionsPossible.slice();
    newSimulator.actions = this.actions.slice();
    return newSimulator;
  }

  get score() {
    const tilePotentials = this.map.tiles.map((tile) => tile.potentialMax);
    const totalPotential = tilePotentials.reduce((a, b) => a + b, 0);
    return this.populations + totalPotential;
  }

  /**
   * @returns true if the game is in a terminal state
   */
  get isTerminal() {
    this.defineActionsPossible();
    return this.actionsPossible.length === 1 && this.stars >= Action.MAX_COST;
  }
}
