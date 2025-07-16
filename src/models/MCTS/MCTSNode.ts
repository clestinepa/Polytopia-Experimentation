import { getRandomElement } from "../../utils.js";
import { Action } from "../Simulator/Action.js";
import { State } from "../Simulator/State.js";

export class MCTSNode {
  state: State;
  parent: MCTSNode | null;
  action: Action | null;
  children: MCTSNode[] = [];

  visits: number = 0;
  score: number = 0;

  /**
   * @param state the current game state at this node
   * @param  parent the parent node in the search tree, null by default
   * @param action the action that led to this node, null by default
   */
  constructor(state: State, parent: MCTSNode | null = null, action: Action | null = null) {
    this.state = state;
    this.parent = parent;
    this.action = action;
  }

  /**
   * @returns true if all possible actions have been expanded
   */
  isFullyExpanded() {
    return this.children.length === this.state.actionsPossible.length;
  }

  /**
   * Computes the Upper Confidence Bound for Trees (UCT) value for this node.
   * @param explorationFactor controls exploration vs exploitation, Math.sqrt(2) by default
   * @returns UCT score
   */
  getUCT(explorationFactor: number | undefined = Math.sqrt(2)) {
    if (this.visits === 0) return Infinity;
    if (!this.parent) return 0;
    return this.score / this.visits + explorationFactor * Math.sqrt(Math.log(this.parent.visits) / this.visits);
  }

  /**
   * Expands this node by creating a new child for one untried action.
   * @returns the newly created child node, or null if fully expanded
   */
  expand() {
    this.state.defineActionsPossible();
    const untried = this.state.actionsPossible.filter(
      (action) =>
        !this.children.some(
          (child) =>
            child.action?.type === action.type &&
            child.action?.tile?.row === action.tile?.row &&
            child.action?.tile?.col === action.tile?.col
        )
    );

    if (untried.length === 0) return null;

    const action = getRandomElement(untried);
    const clone = this.state.clone();
    const clonedAction = action.clone(clone);
    clonedAction.apply();

    const child = new MCTSNode(clone, this, action);
    this.children.push(child);
    return child;
  }
}
