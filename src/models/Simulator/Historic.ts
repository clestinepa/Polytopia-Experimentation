import { Action } from "./Action";
import { City } from "./City";
import { State } from "./State";
import { Tile } from "./Tile";

type ActionHistoric = {
  action: Action;
  msg?: {
    primary: string;
    secondary?: string;
  };
};

export class Historic {
  static messages = {
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
      if (city?.level >= 5) reward = "Park";
      return `🏘️ City ${city?.city_id} level ${city?.level} with ${reward}`;
    },
    on: (tile: Tile) => ` on (${tile.row}, ${tile.col})`,
  };

  actions: ActionHistoric[] = [];
  index: number = -1;

  constructor() {}

  _createMsg(a: ActionHistoric) {
    if (!a.msg) {
      let primary = Historic.messages[a.action.type];
      if (a.action.type !== "end turn" && a.action.tile) primary += Historic.messages.on(a.action.tile);
      a.msg = { primary };
      if (a.action.hasLevellingCity && a.action.tile && a.action.tile.city)
        a.msg.secondary = Historic.messages.city_level(a.action.tile.city);
    }
  }

  next() {
    this.index++;
    this.actions[this.index].action.apply();
    this._createMsg(this.actions[this.index]);
  }
  prev() {
    this.actions[this.index].action.undo();
    this.index--;
  }
  goTo(index: number) {
    while (this.index !== index) {
      if (index < this.index) this.prev();
      else if (index > this.index) this.next();
    }
  }

  get isCurrentLast() {
    return this.index === this.actions.length - 1;
  }

  newAction(action: Action) {
    this.actions.push({ action });
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
