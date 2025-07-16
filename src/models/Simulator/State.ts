import { Map } from "./Map.js";
import { Action } from "./Action.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { runMCTS } from "../MCTS/MCTSRunner.js";
import { TypeAction } from "../../types.js";
import { Tile } from "./Tile.js";
import { Historic } from "./Historic.js";

export class State {
  static max_turn = 30;
  static points_value = {
    known: 5,
    city: 100,
    city_territory: 20,
    population: 5,
    levelUp: (level: number) => 50 - level * 5,
    temple: 100,
  };

  map: Map;

  populations: number = 0;
  stars: number = 5;
  stars_production: number = 2;
  points: number;

  turn: number = 0;
  actionsPossible: Action[] = [];
  historic: Historic = new Historic();

  constructor(map: MapGenerator, isDisplayMap: boolean = false) {
    this.map = new Map(map, isDisplayMap);
    this.points =
      this.map.tiles.filter((tile) => tile.known).length * State.points_value.known +
      this.map.tiles.filter((tile) => tile.city_id !== null).length * State.points_value.city_territory +
      State.points_value.city;
  }

  _addActionIfEnoughStars(type: TypeAction, tile: Tile) {
    if (this.stars >= Action.DATA[type].cost) this.actionsPossible.push(new Action(this, tile, type));
  }
  defineActionsPossible() {
    this.actionsPossible = [new Action(this, undefined, "end turn")];
    this.map.tiles.forEach((tile) => {
      if (!tile.city || tile.building) return;
      if (tile.biome === "mountain") {
        if (tile.resource === "metal") this._addActionIfEnoughStars("mine", tile);
        this._addActionIfEnoughStars("mountain temple", tile);
      } else if (tile.biome === "forest") {
        if (tile.resource === "animal") this._addActionIfEnoughStars("hunting", tile);
        this._addActionIfEnoughStars("forest temple", tile);
        if (!tile.hasBeenTerraform) this._addActionIfEnoughStars("clear forest", tile);
        if (!tile.hasBeenTerraform || tile.hasBeenGrown) this._addActionIfEnoughStars("burn forest", tile);
        this._addActionIfEnoughStars("lumber hut", tile);
      } else if (tile.biome === "field") {
        if (tile.resource === "fruit") this._addActionIfEnoughStars("harvest", tile);
        if (tile.resource === "crop") this._addActionIfEnoughStars("farm", tile);
        this._addActionIfEnoughStars("temple", tile);
        if (!tile.hasBeenTerraform) this._addActionIfEnoughStars("grow forest", tile);
      }
    });
  }

  next(verbose = true) {
    if (this.historic.isCurrentLast) {
      this.defineActionsPossible();
      const bestAction = runMCTS(this, verbose);
      if (!bestAction) return;
      this.historic.newAction(bestAction);
    }
    this.historic.next();
  }

  prev() {
    this.historic.prev();
  }

  clone() {
    const newSimulator = Object.create(State.prototype) as State;
    newSimulator.populations = this.populations;
    newSimulator.stars = this.stars;
    newSimulator.stars_production = this.stars_production;
    newSimulator.map = this.map.clone();
    newSimulator.turn = this.turn;
    newSimulator.actionsPossible = this.actionsPossible.map((action) => action.clone(newSimulator));
    newSimulator.historic = this.historic.clone(newSimulator);
    return newSimulator;
  }

  get score() {
    return this.points + this.populations;
  }

  /**
   * @returns true if the game is in a terminal state
   */
  get isTerminal() {
    this.defineActionsPossible();
    return (this.actionsPossible.length === 1 && this.stars >= Action.MAX_COST) || this.turn >= State.max_turn;
  }
}
