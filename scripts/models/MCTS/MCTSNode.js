import { getRandomElement } from "../../utils.js";
import { Action } from "../Simulator/Action.js";
import { State } from "../Simulator/State.js";

export class MCTSNode {
  /** @type {State} */
  state;
  /** @type {MCTSNode | null} */
  parent;
  /** @type {Action | null} */
  action;
  /** @type {MCTSNode[]} */
  children = [];
  /** @type {Number} */
  visits = 0;
  /** @type {Number} */
  score = 0;

  /**
   * @param {State} state the current game state at this node
   * @param {MCTSNode | null} parent the parent node in the search tree, null by default
   * @param {Action | null} action the action that led to this node, null by default
   */
  constructor(state, parent = null, action = null) {
    this.state = state;
    this.parent = parent;
    this.action = action;
  }

  //   /**
  //    * @returns {Number} the average evaluation score of this node
  //    */
  //   get averageScore() {
  //     return this.visits === 0 ? 0 : this.totalScore / this.visits;
  //   }

  /**
   * @returns {Boolean} true if all possible actions have been expanded
   */
  isFullyExpanded() {
    return this.children.length === this.state.actionsPossible.length;
  }

  //   /**
  //    * @returns {Boolean} true if the game is in a terminal state
  //    */
  //   isTerminal() {
  //     return this.state.turn >= 30;
  //   }

  /**
   * Computes the Upper Confidence Bound for Trees (UCT) value for this node.
   * @param {Number | undefined} explorationFactor controls exploration vs exploitation, Math.sqrt(2) by default
   * @returns {Number} UCT score
   */
  getUCT(explorationFactor = Math.sqrt(2)) {
    if (this.visits === 0) return Infinity;
    return this.score / this.visits + explorationFactor * Math.sqrt(Math.log(this.parent.visits) / this.visits);
  }

  /**
   * Expands this node by creating a new child for one untried action.
   * @returns {MCTSNode | null} the newly created child node, or null if fully expanded
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
