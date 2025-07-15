import { ActionClass } from "./Action";
import { City } from "./City";
import { State } from "./State";
import { TileSimulator } from "./TileSimulator";

type ActionHistoric = {
  action: ActionClass;
  msg?: {
    primary: string;
    secondary?: string;
  };
};

export class Historic {
  static messages = {
    start: "🎉 Beginning of the game",
    "end turn": "✨ End turn",
    "forest temple": "🛕🌳 Build a forest temple",
    "mountain temple": "🛕🗻 Build a mountain temple",
    temple: "🛕 Build a temple",
    "lumber hut": "🛖 Build a lumber hut",
    farm: "🌱 Build a farm",
    mine: "⛏️ Build a mine",
    hunting: "🦙 Hunting",
    harvest: "🌶️ Harvest",
    "clear forest": "🪓 Clear forest",
    "burn forest": "🔥 Burn forest",
    "grow forest": "🌳 Grow forest",
    city_level: (city: City) => {
      let reward = "Park";
      if (city?.level == 2) reward = "Workshop";
      if (city?.level == 3) reward = "Resources";
      if (city?.level == 4) reward = "Population Growth";
      return `🏘️ City ${city?.city_id} level ${city?.level} with ${reward}`;
    },
    on: (tile: TileSimulator) => ` on (${tile.row}, ${tile.col})`,
  };

  actions: ActionHistoric[] = [];
  index: number = -1;

  constructor() {}

  newAction(action: ActionClass) {
    this.actions.push({ action });
  }

  createMsg(action: ActionHistoric, cityLevelling: Boolean) {
    if (!action.msg) {
      let primary = Historic.messages[action.action.type];
      if (action.action.type !== "end turn" && action.action.tile) primary += Historic.messages.on(action.action.tile);
      action.msg = { primary };
      if (cityLevelling && action.action.tile && action.action.tile.city)
        action.msg.secondary = Historic.messages.city_level(action.action.tile.city);
    }
  }

  apply() {
    this.index++;
    console.log(this.actions[this.index].action);
    const cityLevelling = this.actions[this.index].action.apply();
    this.createMsg(this.actions[this.index], cityLevelling);
  }
  undo() {
    this.actions[this.index].action.undo();
    this.index--;
  }

  get isCurrentLast() {
    return this.index === this.actions.length - 1;
  }

  clone(state: State) {
    const newHistoric = Object.create(Historic.prototype) as Historic;
    newHistoric.actions = this.actions.map((action) => {
      return { action: action.action.clone(state), msg: action.msg };
    });
    newHistoric.index = this.index;
    return newHistoric;
  }
}
