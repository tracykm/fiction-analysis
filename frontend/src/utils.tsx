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

type DataInfo = {
  chapterFlat: number;
  value: number;
  // days: number;
};
