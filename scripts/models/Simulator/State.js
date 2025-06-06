import { Map } from "./Map.js";
import { Action, EndTurn } from "./Action.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { runMCTS } from "../MCTS/MCTSRunner.js";

export class State {
  /** @type {Map} */
  map;

  /** @type {Number} */
  populations;
  /** @type {Number} */
  stars;
  /** @type {Number} */
  stars_production;

  /** @type {Number} */
  turn;
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

  _addActionPossible(type, tile) {
    if (this.stars >= Action.DATA[type].cost) {
      const existingAction = this.actionsPossible.find((action) => action.type === type);
      if (existingAction) existingAction.addPossibleTile(tile);
      else {
        const ActionClass = Action.DATA[type].class;
        const action = new ActionClass(type, tile, this);
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
    this.populations = 0;
    this.stars = 5;
    this.stars_production = 2;
  }

  next(verbose = true) {
    this.defineActionsPossible();
    const bestAction = runMCTS(this, verbose);
    // console.log("MCTS choose:", bestAction.type);
    bestAction.apply();
  }

  prev() {
    const lastAction = this.actions[this.actions.length - 1];
    // console.log("Undo:", lastAction.type);
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
      console.log(score);
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    console.log(bestAction);
    return bestAction;
  }

  clone() {
    /** @type {State} */
    const newSimulator = Object.create(State.prototype);
    newSimulator.populations = this.populations;
    newSimulator.stars = this.stars;
    newSimulator.stars_production = this.stars_production;
    newSimulator.map = this.map.clone();
    newSimulator.turn = this.turn;
    newSimulator.actionsPossible = this.actionsPossible.slice();
    newSimulator.actions = this.actions.slice();
    return newSimulator;
  }

  evaluateState() {
    const nextGreedyAction = this.actionsPossible.reduce((a, b) =>
      Action.DATA[a.type].production >= Action.DATA[b.type].production ? a : b
    );
    console.log(this.actionsPossible, nextGreedyAction, Action.DATA[nextGreedyAction.type].production)
    return this.populations + nextGreedyAction.production;
  }

  /**
   * @returns {Boolean} true if the game is in a terminal state
   */
  get isTerminal() {
    this.defineActionsPossible();
    return this.actionsPossible.length === 1 && this.stars >= Action.MAX_COST;
  }
}
