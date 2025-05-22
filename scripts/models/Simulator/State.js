import { Map } from "./Map.js";
import { Action, EndTurn } from "./Action.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { runMCTS } from "../MCTS/MCTSRunner.js";

export class State {
  /** @type {Map} */
  map;

  /** @type {Number} */
  #turn;
  /** @type {Action[]} */
  actionsPossible = [];
  /** @type {Action[]} */
  actions = [];

  /**
   * @param {MapGenerator} map
   * @param {Boolean} isDisplayMap
   */
  constructor(map, isDisplayMap = false) {
    this.map = new Map(map, isDisplayMap);
  }

  get turn() {
    return this.#turn;
  }

  set turn(value) {
    this.#turn = value;
    document.getElementById("turn").innerHTML = this.#turn;
  }

  _addActionPossible(type, tile) {
    if (this.map.stars >= Action.DATA[type].cost) {
      const ActionClass = Action.DATA[type].class;
      const action = new ActionClass(type, tile, this);
      this.actionsPossible.push(action);
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
        if (tile.terraform.length === 0) this._addActionPossible("clear forest", tile);
        if (tile.terraform.length === 0 || (tile.terraform.length === 1 && tile.terraform[0] === "grow forest"))
          this._addActionPossible("burn forest", tile);
        this._addActionPossible("lumber hut", tile);
      } else if (tile.biome === "field") {
        if (tile.resource === "fruit") this._addActionPossible("harvest", tile);
        if (tile.resource === "crop") this._addActionPossible("farm", tile);
        this._addActionPossible("temple", tile);
        if (tile.terraform.length === 0) this._addActionPossible("grow forest", tile);
      }
    });
  }

  start() {
    this.turn = 0;
    this.map.populations = 0;
    this.map.stars = 5;
    this.map.stars_production = 2;
  }

  next() {
    this.defineActionsPossible();
    const bestAction = runMCTS(this, 100);
    console.log("MCTS chose:", bestAction.type);
    bestAction.clone(this).apply();
  }

  prev() {
    const lastAction = this.actions[this.actions.length - 1];
    console.log("Undo:", lastAction.type);
    lastAction.undo();
  }

  chooseAction() {
    this.defineActionsPossible();
    let bestScore = -Infinity;
    let bestAction = null;

    for (const action of this.actionsPossible) {
      const clone = this.clone();
      const testAction = action.clone(clone);
      testAction.apply();
      const score = clone.evaluateState();
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    return bestAction;
  }

  clone() {
    const newSimulator = new State(new MapGenerator()); //random param, it will be overwrite
    newSimulator.map = this.map.clone();
    newSimulator.turn = this.turn;
    newSimulator.actionsPossible = this.actionsPossible.slice();
    newSimulator.actions = this.actions.slice();
    return newSimulator;
  }

  evaluateState() {
    return this.map.populations * 10 - this.turn * 3;
  }
}
