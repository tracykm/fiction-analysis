import charactersData from "./data/his_dark_materials/characters.json";
import chaptersData from "./data/his_dark_materials/chapters.json";
import dates from "./data/his_dark_materials/dates.json";
import { groupBy, keyBy } from "lodash-es";

export const characters: Record<
  string,
  {
    refs: {
      [chapter: string]: {
        letterIndex: number;
        sentence: string;
        chapterFlat: number;
      }[];
    };
    count: number;
    category?: string[];
  }
> = charactersData;

export type ChapterRow = {
  chapter: number;
  book: number;
  letterIndex: number;
  chapterFlat: number;
  characterRefCount: number;
  length: number;
};

export const chapters: ChapterRow[] = chaptersData;

export const COLORS = ["#25CED1", "#FF8A5B", "#EA526F", "#FCEADE"];

let daysSum = 0;
const dayDates = dates.map((d) => {
  daysSum += d.days;

  return { chapter: d.chapter, days: daysSum };
});

const CHAPTER_LENGTH = {
  1: 23,
  2: 15,
  3: 38,
};

export const BOOK_START_LETTER_INDEX = {
  1: 0,
  2: chapters[CHAPTER_LENGTH[1]].letterIndex,
  3: chapters[CHAPTER_LENGTH[1] + CHAPTER_LENGTH[2]].letterIndex,
};

type DataInfo = {
  chapterFlat: number;
  value: number;
  // days: number;
};
/** rough approximation, so many different prints out there people don't depend on it being accurate,
 * gives ballpark idea of how far along in chapter */
export const LETTERS_PER_PAGE = 1500;
