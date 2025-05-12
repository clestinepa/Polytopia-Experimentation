import { getRandomIndex } from "../../utils.js";
import { Map } from "../Map.js";
import { MapGenerator } from "../Generator/MapGenerator.js";
import { Action, BuildExploitation, BuildTemple, EndTurn, Forage, Terraform } from "./Action.js";
import { CitySimulator } from "./CitySimulator.js";
import { TileSimulator } from "./TileSimulator.js";

export class MapSimulator extends Map {
  /** @type {Number} */
  #turn;
  /** @type {Number} */
  #populations;
  /** @type {Number} */
  #stars;
  /** @type {Number} */
  #stars_production;

  /** @type {CitySimulator[]} */
  cities = [];
  /** @type {Action[]} */
  actionsPossible = [];
  /** @type {Action[]} */
  actions = [];

  /**
   * @param {MapGenerator} map
   */
  constructor(map) {
    super(map.size);
    this.tiles = Array.from({ length: this.size ** 2 }, (_, i) => {
      const tile = new TileSimulator(map.tiles[i]);
      if (map.tiles[i].isCapitalCity) {
        if (this.cities.length === 0) this.cities.push(new CitySimulator(tile, 1));
        else this.cities[0].addTile(tile);
      }
      return tile;
    });
  }

  get turn() {
    return this.#turn;
  }
  get populations() {
    return this.#populations;
  }
  get stars() {
    return this.#stars;
  }
  get stars_production() {
    return this.#stars_production;
  }

  set turn(value) {
    this.#turn = value;
    document.getElementById("turn").innerHTML = this.#turn;
  }
  set populations(value) {
    this.#populations = value;
    document.getElementById("populations").innerHTML = this.#populations;
  }
  set stars(value) {
    this.#stars = value;
    document.getElementById("stars").innerHTML = this.#stars;
  }
  set stars_production(value) {
    this.#stars_production = value;
    document.getElementById("stars_production").innerHTML = this.#stars_production;
  }

  start() {
    this.turn = 0;
    this.populations = 0;
    this.stars = 5;
    this.stars_production = 2;
  }

  endTurn() {
    this.actions.push("end turn");
    this.turn++;
    this.stars += this.stars_production;
  }

  next() {
    this.actionsPossible = [new EndTurn(this)];
    this.tiles.forEach((tile) => this._defineActionsPossible(tile, tile.city));
    const nextAction = this.actionsPossible[getRandomIndex(this.actionsPossible)];
    console.log(nextAction.type);
    nextAction.apply();
  }

  _addActionPossible(action) {
    if (this.stars > action.cost) this.actionsPossible.push(action);
  }
  _defineActionsPossible(tile) {
    if (tile.city) {
      if (!tile.building) {
        if (tile.biome === "mountain") {
          if (tile.resource === "metal") this._addActionPossible(new BuildExploitation("mine", tile, this));
          this._addActionPossible(new BuildTemple("mountain temple", tile, this));
        }
        if (tile.biome === "forest") {
          if (tile.resource === "animal") this._addActionPossible(new Forage("hunting", tile, this));
          this._addActionPossible(new BuildTemple("forest temple", tile, this));
          this._addActionPossible(new Terraform("clear forest", tile, this));
          this._addActionPossible(new Terraform("burn forest", tile, this));
          this._addActionPossible(new BuildExploitation("lumber hut", tile, this));
        }
        if (tile.biome === "field") {
          if (tile.resource === "fruit") this._addActionPossible(new Forage("harvest", tile, this));
          if (tile.resource === "crop") this._addActionPossible(new BuildExploitation("farm", tile, this));
          this._addActionPossible(new BuildTemple("temple", tile, this));
          this._addActionPossible(new Terraform("grow forest", tile, this));
        }
      }
    }
  }
}
