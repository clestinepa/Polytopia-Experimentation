import { CityExploiter } from "./CityExploiter.js";
import { MapExploiter } from "./MapExploiter.js";
import { TileExploiter } from "./TileExploiter.js";

export class Action {
  /** @type {TypeAction} */
  type;
  /** @type {Number} */
  production;
  /** @type {Number} */
  cost;

  /** @type {TileExploiter} */
  tile;
  /** @type {CityExploiter} */
  city;
  /** @type {MapExploiter} */
  map;

  /**
   * @param {TypeAction} type
   * @param {TileExploiter} tile
   * @param {CityExploiter} city
   * @param {MapExploiter} map
   */
  constructor(type, tile, city, map) {
    this.type = type;
    this.tile = tile;
    this.city = city;
    this.map = map;
  }

  apply() {
    this.map.stars -= this.cost;
    this.map.actions.push(this);
    this.city.addPopulations(this.production, this.map);
    this.map.populations += this.production;
    this.map.stars_production = this.map.calculateStarsProduction();
  }
}

export class Build extends Action {
  /**
   * @param {Building} type
   * @param {TileExploiter} tile
   * @param {CityExploiter} city
   * @param {MapExploiter} map
   */
  constructor(type, tile, city, map) {
    super(type, tile, city, map);
  }

  apply() {
    super.apply();
    this.tile.building = this.type;
  }
}

export class BuildTemple extends Build {
  /**
   * @param {Temple} type
   * @param {TileExploiter} tile
   * @param {CityExploiter} city
   * @param {MapExploiter} map
   */
  constructor(type, tile, city, map) {
    super(type, tile, city, map);
    this.production = 1;
    this.cost = type === "forest temple" ? 15 : 20;
  }

  apply() {
    super.apply();
  }
}

export class BuildExploitation extends Build {
  /**
   * @param {Exploitation} type
   * @param {TileExploiter} tile
   * @param {CityExploiter} city
   * @param {MapExploiter} map
   */
  constructor(type, tile, city, map) {
    super(type, tile, city, map);
    this.production = type === "lumber hut" ? 1 : 2;
    this.cost = type === "lumber hut" ? 3 : 5;
  }

  apply() {
    super.apply();
    //increase level of neighbors SpecialBuilding
  }
}

export class Forage extends Action {
  /**
   * @param {Foraging} type
   * @param {TileExploiter} tile
   * @param {CityExploiter} city
   * @param {MapExploiter} map
   */
  constructor(type, tile, city, map) {
    super(type, tile, city, map);
    this.production = 1;
    this.cost = 2;
  }

  apply() {
    super.apply();
    this.tile.resource = null;
  }
}

export class Terraform extends Action {
  /**
   * @param {Terraforming} type
   * @param {TileExploiter} tile
   * @param {CityExploiter} city
   * @param {MapExploiter} map
   */
  constructor(type, tile, city, map) {
    super(type, tile, city, map);
    this.production = 0;
    this.cost = type === "clear forest" ? -1 : 5;
  }

  apply() {
    super.apply();
    this.tile.resource = null;
    if (this.type === "grow forest") this.tile.biome = "forest";
    else this.tile.biome = "field";

    if (this.type === "burn forest") this.tile.resource = "crop";
    else this.tile.resource = null;
  }
}

export class EndTurn extends Action {
  /**
   * @param {MapExploiter} map
   */
  constructor(map) {
    super("end turn", undefined, undefined, map);
    this.production = 0;
    this.cost = 0;
  }

  apply() {
    this.map.endTurn();
  }
}
