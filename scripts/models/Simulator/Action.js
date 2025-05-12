import { CitySimulator } from "./CitySimulator.js";
import { MapSimulator } from "./MapSimulator.js";
import { TileSimulator } from "./TileSimulator.js";

export class Action {
  /** @type {TypeAction} */
  type;
  /** @type {Number} */
  production;
  /** @type {Number} */
  cost;

  /** @type {TileSimulator} */
  tile;
  /** @type {CitySimulator} */
  city;
  /** @type {MapSimulator} */
  map;

  /**
   * @param {TypeAction} type
   * @param {TileSimulator} tile
   * @param {MapSimulator} map
   */
  constructor(type, tile, map) {
    this.type = type;
    this.tile = tile;
    this.city = tile ? tile.city : undefined;
    this.map = map;
  }

  apply() {
    this.map.stars -= this.cost;
    this.map.actions.push(this);
    this.city.addPopulations(this.production, this.map);
  }
}

export class Build extends Action {
  /**
   * @param {Building} type
   * @param {TileSimulator} tile
   * @param {MapSimulator} map
   */
  constructor(type, tile, map) {
    super(type, tile, map);
  }

  apply() {
    super.apply();
    this.tile.building = this.type;
  }
}

export class BuildTemple extends Build {
  /**
   * @param {Temple} type
   * @param {TileSimulator} tile
   * @param {MapSimulator} map
   */
  constructor(type, tile, map) {
    super(type, tile, map);
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
   * @param {TileSimulator} tile
   * @param {MapSimulator} map
   */
  constructor(type, tile, map) {
    super(type, tile, map);
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
   * @param {TileSimulator} tile
   * @param {MapSimulator} map
   */
  constructor(type, tile, map) {
    super(type, tile, map);
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
   * @param {TileSimulator} tile
   * @param {MapSimulator} map
   */
  constructor(type, tile, map) {
    super(type, tile, map);
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
   * @param {MapSimulator} map
   */
  constructor(map) {
    super("end turn", undefined, map);
    this.production = 0;
    this.cost = 0;
  }

  apply() {
    this.map.endTurn();
  }
}
