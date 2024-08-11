import charactersJson from "./data/his_dark_materials/characters.json";
import chaptersJson from "./data/his_dark_materials/chapters.json";
import indexedSentences from "./data/his_dark_materials/indexedSentences.json";

export type ChapterRow = (typeof chaptersJson)[0];
export type CharactersRow = Omit<(typeof charactersJson)["Hester"], "refs"> & {
  refs: number[];
  shortName?: string;
  books?: number[];
};
export type CharactersData = { [characterName: string]: CharactersRow };

export type RelationshipRefs = number[][];
export type RelationshipData = {
  [fromCharacter: string]: {
    [toCharacter: string]: RelationshipRefs;
  };
};
export type RelationshipTimelineData = {
  [fromCharacter: string]: {
    [toCharacter: string]: {
      relationship: string;
      positivity: { chapterFlat: number; value: number; comment?: string }[];
    };
  };
};
export type IndexedSentencesData = {
  [letterIdx: string]: (typeof indexedSentences)["451"];
};

export type BookData = {
  id: number;
  title: string;
  chapters: number;
  startLetterIndex: number;
};

export type FullContextProps = {
  characters: CharactersData;
  relationships: RelationshipData;
  chapters: ChapterRow[];
  indexedSentences: IndexedSentencesData;
  selectedBook: number;
  relationshipTimelines: RelationshipTimelineData;
  books: BookData[];
  manualConfig: {
    defaultSelectedCharacter: string;
    sharedCharacters: boolean;
    publicDomain: boolean;
    replaceTextFn?: (text: string) => string;
    characterCategories: {
      name: string;
      options: { id: string; label: string }[];
    }[];
    relationships?: {
      timelineOptions: {
        label: string;
        relationships: { from: string; to: string; name: string }[];
      }[];
    };
  };
};

export const COLORS = [
  "#25CED1",
  "#FF8A5B",
  "#EA526F",
  "#FCEADE",
  "#198e90",
  "#ff530f",
];

/** rough approximation, so many different prints out there people don't depend on it being accurate,
 * gives ballpark idea of how far along in chapter */
export const LETTERS_PER_PAGE = 1500;

export function getPercent(num = 0) {
  if (num > 0.01) return Math.round(num * 100);
  return Math.round(num * 10000) / 100;
}

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
