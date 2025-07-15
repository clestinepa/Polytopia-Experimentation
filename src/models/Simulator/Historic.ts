import { ActionClass } from "./Action";
import { City } from "./City";
import { State } from "./State";
import { TileSimulator } from "./TileSimulator";

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
    city_level: (city: City | null | undefined) => {
      let reward = "Park";
      if (city?.level == 2) reward = "Workshop";
      if (city?.level == 3) reward = "Resources";
      if (city?.level == 4) reward = "Population Growth";
      return `🏘️ City ${city?.city_id} level ${city?.level} with ${reward}`;
    },
    on: (tile: TileSimulator) => ` on (${tile.row}, ${tile.col})`,
  };

  messages: { action: string; city_levelling: string | undefined }[] = [];
  actions: ActionClass[] = [];
  index: number = -1;

  constructor() {}

  newAction(action: ActionClass) {
    let msg = Historic.messages[action.type];
    if (action.type !== "end turn" && action.tile) msg += Historic.messages.on(action.tile);
    this.messages.push({
      action: msg,
      city_levelling: undefined,
    });
    this.actions.push(action);
  }

  apply() {
    this.index++;
    const cityLevelling = this.actions[this.index].apply();
    if (cityLevelling && !this.messages[this.index].city_levelling)
      this.messages[this.index].city_levelling = Historic.messages.city_level(this.actions[this.index].tile?.city);
  }
  undo() {
    this.actions[this.index].undo();
    this.index--;
  }

  get isCurrentLast() {
    return this.index === this.actions.length - 1;
  }

  clone(state: State) {
    const newHistoric = Object.create(Historic.prototype) as Historic;
    newHistoric.messages = this.messages.slice();
    newHistoric.actions = this.actions.map((action) => action.clone(state));
    newHistoric.index = this.index;
    return newHistoric;
  }
}
