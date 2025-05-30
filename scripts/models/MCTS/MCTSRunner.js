import { Action } from "../Simulator/Action.js";
import { State } from "../Simulator/State.js";
import { MCTSNode } from "./MCTSNode.js";

/**
 * Runs the Monte Carlo Tree Search algorithm starting from the root node.
 * @param {State} rootState the initial game state
 * @param {Boolean} verbose display log if true
 * @param {Number} iterations he number of MCTS iterations to perform, 100 by default
 * @returns the best action to take next node (highest average score)
 */
export function runMCTS(rootState, verbose, iterations = 1) {
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

  if (verbose) {
    console.log(`[RESULT] All children:`);
    root.children.forEach((child) => {
      const a = child.action;
      console.log(`- Action: ${a.type} | Visits: ${child.visits} | Average: ${child.averageScore}`);
    });
  }

  // Return the most visited child
  const bestChild = root.children.reduce((a, b) => (a.visits > b.visits ? a : b));
  if (verbose)
    console.log(`[BEST] ${bestChild.action.type} | Visits: ${bestChild.visits} | Average: ${bestChild.averageScore}`);

  return bestChild.action.clone(rootState);
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
    if (state.isTerminal) break;

    const action = state.chooseAction();
    action.apply();
  }

  return state.evaluateState();
}
