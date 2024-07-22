import charactersData from "./data/characters.json";
import dates from "./data/dates.json";
import { groupBy, keyBy } from "lodash-es";

export const characters: Record<
  string,
  {
    char_count: { char_count: number; sentence: string; chapter: number }[];
    count: number;
    category?: string[];
  }
> = charactersData;

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

function toFlatChapter(fullChapter: number) {
  const [book, chapter] = String(fullChapter).split(".");
  if (book === "2") return Number(chapter) + CHAPTER_LENGTH["1"];
  if (book === "3")
    return Number(chapter) + CHAPTER_LENGTH["1"] + CHAPTER_LENGTH["2"];
  return Number(chapter);
}

function chunkDataByChapter(data: typeof characters.Lyra) {
  const newData = Object.values(groupBy(data.char_count, "chapter")).map(
    (d: { chapter: number }[]) => {
      // const chapter = getPercent(d.char_count);
      const chapter = d[0].chapter;
      let days = 0;
      dayDates.forEach((dd) => {
        if (dd.chapter >= chapter) {
          days = dd.days;
        }
      });
      return {
        chapter,
        chapterFlat: toFlatChapter(chapter),
        value: d.length,
        days,
      };
    }
  );
  const keyedNewData = keyBy(newData, "chapterFlat");
  return Array.from({
    length: CHAPTER_LENGTH["1"] + CHAPTER_LENGTH["2"] + CHAPTER_LENGTH["3"],
  }).map((_, i) => {
    return {
      value: 0,
      chapterFlat: i,
      ...keyedNewData[i],
    } as DataInfo;
  });
}

type DataInfo = {
  chapter: number;
  chapterFlat: number;
  value: number;
  days: number;
};

export const processedCharacters = Object.keys(characters).reduce(
  (acc, name) => {
    acc[name] = chunkDataByChapter(characters[name]);
    return acc;
  },
  {} as Record<string, ReturnType<typeof chunkDataByChapter>>
);
