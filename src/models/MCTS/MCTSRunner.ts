import { getRandomElement } from "../../utils.js";
import { State } from "../Simulator/State.js";
import { MCTSNode } from "./MCTSNode.js";

/**
 * Runs the Monte Carlo Tree Search algorithm starting from the root node.
 * @param rootState the initial game state
 * @param verbose display log if true
 * @param iterations he number of MCTS iterations to perform, 100 by default
 * @returns the best action to take next node (highest average score)
 */
export function runMCTS(rootState: State, verbose: boolean, iterations: number | undefined = 100) {
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
    let current: MCTSNode | null = expandedNode;
    while (current) {
      current.visits++;
      current.score += result;
      current = current.parent;
    }
  }

  const bestChild = root.children.reduce((a, b) => (a.visits > b.visits ? a : b));
  if (!bestChild.action) return;

  if (verbose) {
    console.log("");
    console.log(`[RESULT] All children:`);
    root.children.forEach((child) => {
      if (!child.action) return;
      console.log(`- Action: ${child.action.type} | Visits: ${child.visits}`);
    });
    console.log(`[BEST] ${bestChild.action.type} | Visits: ${bestChild.visits}`);
  }

  return bestChild.action.clone(rootState);
}

/**
 * Simulates a random play from the given simulator state until no actions are left.
 * @param state the state to run the simulation from
 * @returns the score resulting from the play
 */
function simulateRandomGame(state: State) {
  while (!state.isTerminal) {
    const action = getRandomElement(state.actionsPossible);
    action.apply();
  }

  return state.score;
}
