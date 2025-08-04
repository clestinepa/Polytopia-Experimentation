import { getRandomElement } from "../../utils.js";
import { State } from "../Simulator/State.js";
import { MCTSNode } from "./MCTSNode.js";

/**
 * Runs the Monte Carlo Tree Search (MCTS) algorithm starting from the given root game state.
 *
 * MCTS builds a search tree by performing a number of simulations (iterations),
 * balancing exploration and exploitation using the Upper Confidence Bound (UCT) formula.
 * The algorithm follows four key steps:
 * 1. Selection – Traverse the tree using UCT to select a promising node.
 * 2. Expansion – Add a child node by performing one unexplored action.
 * 3. Simulation – Simulate a random game from the new node to estimate its value.
 * 4. Backpropagation – Propagate the simulation result up the tree.
 *
 * @param rootState - The initial game state to start the search from. Cloned to avoid mutation.
 * @param iterations - The number of MCTS iterations (simulations) to perform.
 * @param verbose - Optional. If true, prints debug information after the search. Default is false.
 * @returns The action associated with the most visited child of the root node (best average outcome), or undefined if no action is found.
 */
export function runMCTS(rootState: State, iterations: number, verbose: boolean | undefined = false) {
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
 * Simulates a random play from the given simulator state until a terminal state is reached.
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
