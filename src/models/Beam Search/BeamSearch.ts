import { Action } from "../Simulator/Action";
import { State } from "../Simulator/State";

type Path = { state: State; actions: Action[] };

/**
 * Executes the Beam Search algorithm to determine the best initial action
 * from a given root game state, by exploring the action space up to a certain depth.
 *
 * Beam Search is a heuristic search algorithm that explores a graph by expanding
 * only the top-N most promising paths at each level (beam width), rather than
 * performing a full breadth-first search. This makes it more memory-efficient
 * and suitable for large or complex state spaces.
 *
 * @param rootState - The initial game state to start the search from. This state is cloned to avoid mutation.
 * @param depth - The maximum number of layers (turns) to explore in the search tree.
 * @param beamWidth - The number of top-scoring paths to keep at each depth level.
 * @param verbose - Optional. If true, logs detailed information about the search process. Default is false.
 * @returns The first action of the highest-scoring action sequence found, or undefined if no valid path exists.
 */

export function runBeamSearch(
  rootState: State,
  depth: number,
  beamWidth: number,
  verbose: boolean = false
): Action | undefined {
  if (verbose) {
    console.log("🚀 Starting Beam Search");
    console.log(`🔍 Depth: ${depth}, Beam Width: ${beamWidth}`);
  }
  let frontier: Path[] = [{ state: rootState.clone(), actions: [] }];

  for (let d = 0; d < depth; d++) {
    if (verbose) console.log(`\n🧭 Exploring Depth ${d + 1}...`);
    let candidates: Path[] = [];

    for (const [pathIndex, { state, actions }] of frontier.entries()) {
      if (verbose)
        console.log(
          `  ➡️ State #${pathIndex} | Pop: ${state.populations} | Stars: ${state.stars} | Turn: ${state.turn}`
        );
      state.defineActionsPossible();
      if (verbose) console.log(`    🛠️ Actions available: ${state.actionsPossible.map((a) => a.type).join(", ")}`);

      for (const i in state.actionsPossible) {
        const nextState = state.clone();

        const nextAction = nextState.actionsPossible[i];
        nextAction.apply();

        if (verbose)
          console.log(
            `      🔄 Action ${i}: ${nextAction.type} -> Score: ${nextState.score} | Pop: ${nextState.populations} | Stars: ${nextState.stars} | Turn: ${nextState.turn}`
          );

        candidates.push({
          state: nextState,
          actions: [...actions, nextAction],
        });
      }
    }

    if (candidates.length === 0) {
      if (verbose) console.log("❌ No more candidates to explore. Ending search early.");
      break;
    }

    candidates.sort((a, b) => b.state.score - a.state.score);
    frontier = candidates.slice(0, beamWidth);
    if (verbose) {
      console.log(`✅ Best candidates kept (Top ${beamWidth}):`);
      for (let i = 0; i < frontier.length; i++) {
        const f = frontier[i];
        console.log(`    #${i + 1} | Score: ${f.state.score} | Actions: ${f.actions.map((a) => a.type).join(" → ")}`);
      }
    }
  }

  const best = frontier.length > 0 ? frontier[0] : null;

  if (best) {
    if (verbose) {
      console.log(`\n🏁 Best sequence found with score: ${best.state.score}`);
      console.log(`   Sequence of actions: ${best.actions.map((a) => a.type).join(" → ")}`);
    }
    return best.actions[0].clone(rootState);
  } else {
    if (verbose) console.log("⚠️ Beam Search failed to find a valid sequence.");
    return undefined;
  }
}
