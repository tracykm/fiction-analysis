import charactersJson from "./data/his_dark_materials/characters.json";
import chaptersJson from "./data/his_dark_materials/chapters.json";
import bookJson from "./data/his_dark_materials/books.json";
import dates from "./data/his_dark_materials/dates.json";

export type ChapterRow = (typeof chaptersJson)[0];
export type CharactersRow = Omit<typeof charactersJson.Lyra, "refs"> & {
  refs: { [chapter: string]: RefsRow[] };
};
export type CharactersData = { [characterName: string]: CharactersRow };

export type RefsRow = (typeof charactersJson.Lyra)["refs"]["1"][0];

export const charactersFullData: Record<
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
> = charactersJson;

export const chaptersFullData: ChapterRow[] = chaptersJson;

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
  2: chaptersFullData[CHAPTER_LENGTH[1]].letterIndex,
  3: chaptersFullData[CHAPTER_LENGTH[1] + CHAPTER_LENGTH[2]].letterIndex,
};

export const books = bookJson;

type DataInfo = {
  chapterFlat: number;
  value: number;
  // days: number;
};
/** rough approximation, so many different prints out there people don't depend on it being accurate,
 * gives ballpark idea of how far along in chapter */
export const LETTERS_PER_PAGE = 1500;

export const flatChapterToBook = chaptersFullData.reduce((acc, d) => {
  acc[d.chapterFlat] = d.book;
  return acc;
}, {} as Record<string, number>);
