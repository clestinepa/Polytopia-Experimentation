import { Action } from "./Action.js";
import { State } from "./State.js";
import { Tile } from "./Tile.js";

export class City {
  city_id: number | null;
  level: number = 1;

  populations: number = 0;
  total_populations: number = 0;
  stars_production: number;

  tiles: Tile[];

  constructor(tile: Tile, id: number) {
    this.tiles = [tile];
    this.city_id = id;
    this.linkCityToTile(tile);
    this.stars_production = this.city_id === 0 ? 2 : 1;
  }

  linkCityToTile(tile: Tile) {
    tile.city = this;
    tile.city_id = this.city_id;
  }

  addTile(tile: Tile) {
    this.tiles.push(tile);
    this.linkCityToTile(tile);
  }

  incrementPopulations(state: State, value: number) {
    this.populations += value;
    this.total_populations += value;
    state.populations += value;
    state.points += value * State.points_value.population;
  }

  incrementStarProduction(state: State, value: number) {
    this.stars_production += value;
    state.stars_production += value;
  }

  levelling(state: State, isUpgrading = true) {
    const s = isUpgrading ? 1 : -1;
    if (isUpgrading) this.level++;
    state.points += State.points_value.levelUp(this.level) * s;
    this.incrementStarProduction(state, 1 * s);
    if (this.level === 2) this.incrementStarProduction(state, 1 * s);
    else if (this.level === 3) state.stars += 5 * s;
    else if (this.level === 4) this.incrementPopulations(state, 3 * s);
    else if (this.level >= 5) this.incrementStarProduction(state, 1 * s);
    this.populations -= this.level * s;
    if (!isUpgrading) this.level--;
  }

  applyAction(action: Action) {
    this.incrementPopulations(action.state, Action.DATA[action.type].production);
    if (this.populations >= this.level + 1) {
      this.levelling(action.state);
      action.hasLevellingCity = true;
    }
  }
  undoAction(action: Action) {
    this.incrementPopulations(action.state, Action.DATA[action.type].production * -1);
    if (this.populations < 0) {
      this.levelling(action.state, false);
      action.hasLevellingCity = false;
    }
  }

  /** Clone without tiles */
  clone() {
    const newCity = Object.create(City.prototype) as City;
    newCity.city_id = this.city_id;
    newCity.level = this.level;
    newCity.populations = this.populations;
    newCity.total_populations = this.total_populations;
    newCity.stars_production = this.stars_production;
    newCity.tiles = [];
    return newCity;
  }
}
