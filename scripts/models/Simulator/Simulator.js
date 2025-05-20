import { getRandomIndex } from "../../utils.js";
import { Map } from "./Map.js";
import { Action, EndTurn } from "./Action.js";
import { MapGenerator } from "../Generator/MapGenerator.js";

export class Simulator {
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
   */
  constructor(map) {
    this.map = new Map(map);
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
  _defineActionsPossible() {
    this.actionsPossible = [new EndTurn(this)];
    this.map.tiles.forEach((tile) => {
      if (!tile.city || tile.building) return;
      if (tile.biome === "mountain") {
        if (tile.resource === "metal") this._addActionPossible("mine", tile);
        this._addActionPossible("mountain temple", tile);
      } else if (tile.biome === "forest") {
        if (tile.resource === "animal") this._addActionPossible("hunting", tile);
        this._addActionPossible("forest temple", tile);
        this._addActionPossible("clear forest", tile);
        this._addActionPossible("burn forest", tile);
        this._addActionPossible("lumber hut", tile);
      } else if (tile.biome === "field") {
        if (tile.resource === "fruit") this._addActionPossible("harvest", tile);
        if (tile.resource === "crop") this._addActionPossible("farm", tile);
        this._addActionPossible("temple", tile);
        this._addActionPossible("grow forest", tile);
      }
    });
  }

  endTurn() {
    this.actions.push("end turn");
    this.turn++;
    this.map.stars += this.map.stars_production;
  }

  start() {
    this.turn = 0;
    this.map.populations = 0;
    this.map.stars = 5;
    this.map.stars_production = 2;
  }

  next() {
    this._defineActionsPossible();
    const nextAction = this.chooseAction();
    console.log(nextAction.type);
    nextAction.apply();
  }

  chooseAction() {
    return this.actionsPossible[getRandomIndex(this.actionsPossible)];
  }
}
