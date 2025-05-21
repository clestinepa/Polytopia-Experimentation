import { State } from "../Simulator/State.js";
import { MCTSNode } from "./MCTSNode.js";

/**
 * Runs the Monte Carlo Tree Search algorithm starting from the root node.
 * @param {State} rootState the initial game state.
 * @param {Number} iterations he number of MCTS iterations to perform, 100 by default
 * @returns {MCTSNode} the best child node to take next (highest average score).
 */
export function runMCTS(rootState, iterations = 100) {
  const root = new MCTSNode(rootState.clone());

  for (let i = 0; i < iterations; i++) {
    let node = root;

    // 1. SELECTION: descend tree via best UCT
    while (node.children.length > 0 && node.isFullyExpanded()) {
      node = node.children.reduce((a, b) => (a.getUCT() > b.getUCT() ? a : b));
    }

    // 2. EXPANSION
    const expandedNode = node.expand() || node;

    // 3. SIMULATION
    const result = simulateRandomGame(expandedNode.state.clone());

    // 4. BACK PROPAGATION
    let current = expandedNode;
    while (current) {
      current.visits++;
      current.score += result;
      current = current.parent;
    }
  }

  // Return the most visited child
  const bestChild = root.children.reduce((a, b) => (a.visits > b.visits ? a : b));
  return bestChild.action;
}

/**
 * Simulates a random play from the given simulator state until no actions are left.
 * @param {State} state the state to run the simulation from
 * @param {Number} depth the number of simulate action, 10 by default
 * @returns {Number} the score resulting from the play
 */
function simulateRandomGame(state, depth = 10) {
  for (let i = 0; i < depth; i++) {
    state.defineActionsPossible();
    if (state.actionsPossible.length === 0) break;

    const action = state.chooseAction();
    action.apply();
  }

  return state.evaluateState();
}
