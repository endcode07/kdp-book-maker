import { wordSearch } from "./wordSearchPuzzle";
import { sudoku } from "./sudokuPuzzle";
import { maze } from "./mazePuzzle";
import { scrambleP } from "./scramblePuzzle";
import { cryptogram } from "./cryptogramPuzzle";

export const PUZZLES = { wordsearch: wordSearch, sudoku, maze, scramble: scrambleP, cryptogram };
