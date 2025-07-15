import { State } from "./State.js";
import { TileSimulator } from "./TileSimulator.js";

export class City {
  city_id: number | null;
  level: number = 1;

  populations: number = 0;
  total_populations: number = 0;
  stars_production: number;

  tiles: TileSimulator[];

  constructor(tile: TileSimulator, id: number) {
    this.tiles = [tile];
    this.city_id = id;
    this.linkCityToTile(tile);
    this.stars_production = this.city_id === 0 ? 2 : 1;
  }

  linkCityToTile(tile: TileSimulator) {
    tile.city = this;
    tile.city_id = this.city_id;
  }

  addTile(tile: TileSimulator) {
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

  addPopulations(state: State, value: number) {
    this.incrementPopulations(state, value);
    if (this.populations >= this.level + 1) {
      this.level++;
      state.points += State.points_value.levelUp(this.level);
      this.incrementStarProduction(state, 1);
      if (this.level === 2) this.incrementStarProduction(state, 1);
      else if (this.level === 3) state.stars += 5;
      else if (this.level === 4) this.incrementPopulations(state, 3);
      else if (this.level >= 5) this.incrementStarProduction(state, 1);
      this.populations -= this.level;
      return true;
    }
    return false;
  }
  removePopulations(state: State, value: number) {
    this.incrementPopulations(state, value * -1);
    if (this.populations < 0) {
      state.points -= State.points_value.levelUp(this.level);
      this.level--;
      this.incrementStarProduction(state, -1);
      if (this.level === 1) this.incrementStarProduction(state, -1);
      else if (this.level === 2) state.stars -= 5;
      else if (this.level === 3) this.incrementPopulations(state, -3);
      else if (this.level >= 4) this.incrementStarProduction(state, -1);
      this.populations += this.level + 1;
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
