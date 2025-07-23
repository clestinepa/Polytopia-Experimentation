import { Action } from "../Simulator/Action";
import { State } from "../Simulator/State";

type Path = { state: State; actions: Action[] };

export function runBeamSearch(
  initialState: State,
  depth: number,
  beamWidth: number,
  verbose: boolean
): Action | undefined {
  if (verbose) {
    console.log("🚀 Starting Beam Search");
    console.log(`🔍 Depth: ${depth}, Beam Width: ${beamWidth}`);
  }
  let frontier: Path[] = [{ state: initialState.clone(), actions: [] }];

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
    return best.actions[0].clone(initialState);
  } else {
    if (verbose) console.log("⚠️ Beam Search failed to find a valid sequence.");
    return undefined;
  }
}
