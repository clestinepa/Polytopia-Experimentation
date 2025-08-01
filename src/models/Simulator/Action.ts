import { Building, Resource, TypeAction } from "../../types.js";
import { State } from "./State.js";
import { Tile } from "./Tile.js";

export class Action {
  static DATA = {
    "end turn": { cost: 0, production: 0 },
    "forest temple": { cost: 15, production: 1 },
    "mountain temple": { cost: 20, production: 1 },
    temple: { cost: 20, production: 1 },
    "lumber hut": { cost: 3, production: 1 },
    farm: { cost: 5, production: 2 },
    mine: { cost: 5, production: 2 },
    hunting: { cost: 2, production: 1 },
    harvest: { cost: 2, production: 1 },
    "clear forest": { cost: -1, production: 0 },
    "burn forest": { cost: 5, production: 0 },
    "grow forest": { cost: 5, production: 0 },
  };
  static MAX_COST = 20; //max cost of an action

  type: TypeAction;

  tile: Tile | undefined;
  state: State;
  prevResource: Resource | null = null;

  hasLevellingCity = false;

  constructor(state: State, tile: Tile | undefined, type: TypeAction) {
    this.type = type;
    this.tile = tile;
    this.state = state;
  }

  /**
   * Apply the action to its state.
   * Modify its tile, the city of its tile, populations, stars, starts_productions, points and turn depending of the type of the action.
   */
  apply() {
    if (this.type === "end turn") {
      this.state.turn++;
      this.state.stars += this.state.stars_production;
    } else if (this.tile && this.tile.city) {
      this.state.stars -= Action.DATA[this.type].cost;
      this.tile.city.applyAction(this);
      switch (this.type) {
        case "farm":
        case "mine":
        case "lumber hut":
          this.tile.building = this.type as Building;
          break;
        case "mountain temple":
        case "forest temple":
        case "temple":
          this.tile.building = this.type as Building;
          this.state.points += State.points_value.temple;
          break;
        case "harvest":
        case "hunting":
          this.prevResource = this.tile.resource;
          this.tile.resource = null;
          break;
        case "clear forest":
        case "burn forest":
        case "grow forest":
          this.prevResource = this.tile.resource;
          this.tile.resource = this.type === "burn forest" ? "crop" : null;
          if (this.type === "grow forest") this.tile.biome = "forest";
          else this.tile.biome = "field";
      }
    }
  }

  /**
   * Undo the action to its state.
   */
  undo() {
    if (this.type === "end turn") {
      this.state.turn--;
      this.state.stars -= this.state.stars_production;
    } else if (this.tile && this.tile.city) {
      this.state.stars += Action.DATA[this.type].cost;
      this.tile.city.undoAction(this);
      switch (this.type) {
        case "farm":
        case "mine":
        case "lumber hut":
          this.tile.building = null;
          //increase level of neighbors SpecialBuilding
          break;
        case "mountain temple":
        case "forest temple":
        case "temple":
          this.tile.building = null;
          this.state.points -= State.points_value.temple;
          break;
        case "harvest":
        case "hunting":
          this.tile.resource = this.prevResource;
          this.prevResource = null;
          break;
        case "clear forest":
        case "burn forest":
        case "grow forest":
          this.tile.resource = this.prevResource;
          this.prevResource = null;
          if (this.type === "grow forest") this.tile.biome = "field";
          else this.tile.biome = "forest";
      }
    }
  }

  /**
   * Clone the action and link it to a specific state (so its tile)
   * @param state the state linked to the cloned action
   * @returns the cloned action
   */
  clone(state: State) {
    const newAction = Object.create(Action.prototype) as Action;
    newAction.type = this.type;

    newAction.tile = this.tile
      ? state.map.tiles.find((t) => t.row === this.tile!.row && t.col === this.tile!.col)
      : undefined;
    newAction.state = state;
    newAction.prevResource = this.prevResource;

    newAction.hasLevellingCity = this.hasLevellingCity;

    return newAction;
  }
}
