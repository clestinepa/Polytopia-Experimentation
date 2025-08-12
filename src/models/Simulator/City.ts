import { Action } from "./Action.js";
import { State } from "./State.js";
import { Tile } from "./Tile.js";

export class City {
  isCapital: boolean;
  name: string;
  level: number = 1;

  populations: number = 0;
  total_populations: number = 0;
  stars_production: number;

  tiles: Tile[];

  constructor(tile: Tile, name: string, isCapital = false) {
    this.isCapital = isCapital;
    this.name = name;
    this.tiles = [tile];
    this._linkCityToTile(tile);
    this.stars_production = isCapital ? 2 : 1;
  }

  _linkCityToTile(tile: Tile) {
    tile.city = this;
    tile.city_name = this.name;
  }

  _incrementPopulations(state: State, value: number) {
    this.populations += value;
    this.total_populations += value;
    state.populations += value;
    state.points += value * State.points_value.population;
  }

  _incrementStarProduction(state: State, value: number) {
    this.stars_production += value;
    state.stars_production += value;
  }

  _levelling(state: State, isUpgrading = true) {
    const s = isUpgrading ? 1 : -1;
    if (isUpgrading) this.level++;
    state.points += State.points_value.levelUp(this.level) * s;
    this._incrementStarProduction(state, 1 * s);
    if (this.level === 2) this._incrementStarProduction(state, 1 * s);
    else if (this.level === 3) state.stars += 5 * s;
    else if (this.level === 4) this._incrementPopulations(state, 3 * s);
    else if (this.level >= 5) {
      this._incrementStarProduction(state, 1 * s);
      state.points += State.points_value.park * s;
    }
    this.populations -= this.level * s;
    if (!isUpgrading) this.level--;
  }

  /**
   * Apply modification to the city (and so the state) : population, starts_production, level.
   * Level 2  => Workshop
   * Level 3  => Resources
   * Level 4  => Population Growth
   * Level 5+ => Park
   * @param action action to apply
   */
  applyAction(action: Action) {
    this._incrementPopulations(action.state, Action.DATA[action.type].production);
    if (this.populations >= this.level + 1) {
      this._levelling(action.state);
      action.hasLevellingCity = true;
    }
  }
  /**
   * Undo modification to the city (and so the state) : population, starts_production, level.
   * @param action action to undo
   */
  undoAction(action: Action) {
    this._incrementPopulations(action.state, Action.DATA[action.type].production * -1);
    if (action.hasLevellingCity) {
      this._levelling(action.state, false);
      action.hasLevellingCity = false;
    }
  }

  /**
   * Link a tile to the city and link this city to the tile
   * @param tile to add to the city
   */
  addTile(tile: Tile) {
    this.tiles.push(tile);
    this._linkCityToTile(tile);
  }

  /**
   * Clone the city with tiles empty
   * @returns the cloned city
   */
  clone() {
    const newCity = Object.create(City.prototype) as City;
    newCity.isCapital = this.isCapital;
    newCity.name = this.name;
    newCity.level = this.level;
    newCity.populations = this.populations;
    newCity.total_populations = this.total_populations;
    newCity.stars_production = this.stars_production;
    newCity.tiles = [];
    return newCity;
  }
}
