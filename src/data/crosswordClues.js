import { SETS_EN } from "./clueSetsEn";
import { SETS_MS } from "./clueSetsMs";

export const CLUE_SETS = { ...SETS_EN, ...SETS_MS };
export const clueText = (k) => CLUE_SETS[k].entries.map(([w, c]) => w + ": " + c).join("\n");
