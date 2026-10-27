import { wordSearch } from "./wordSearchPuzzle";
import { sudoku } from "./sudokuPuzzle";
import { maze } from "./mazePuzzle";
import { scrambleP } from "./scramblePuzzle";
import { cryptogram } from "./cryptogramPuzzle";
import { mathSquare } from "./mathSquarePuzzle";

export const PUZZLES = { wordsearch: wordSearch, sudoku, maze, scramble: scrambleP, cryptogram, mathsquare: mathSquare };
