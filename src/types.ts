export type Size = 11 | 14 | 16 | 18 | 20 | 30;

export type Biome = "field" | "forest" | "mountain" | "capital" | "village" | "lighthouse";
export type Resource = "crop" | "metal" | "fruit" | "animal";
export type Territory = "inner" | "outer" | "none";

export type Building = Exploitation | Temple;
export type Temple = "mountain temple" | "forest temple" | "temple";
export type Exploitation = "farm" | "mine" | "lumber hut";
// export type SpecialBuilding = "forge" | "windmill" | "sawmill";
export type Foraging = "harvest" | "hunting";
export type Terraforming = "clear forest" | "burn forest" | "grow forest";
export type TypeAction = Building | Foraging | Terraforming | "end turn";

export type IAChoices = "random" | "MCTS" | "beam search";
