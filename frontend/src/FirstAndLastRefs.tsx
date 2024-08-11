import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Button,
  TextField,
} from "@mui/material";
import { useDataContext } from "./DataContext";
import { ChapterRow, CharactersRow } from "./utils";
import Close from "@mui/icons-material/Close";
import { useState } from "react";

function ChapterParens({ chapter }: { chapter: ChapterRow }) {
  return (
    <div style={{ opacity: 0.5 }}>
      -B.{chapter?.book} Ch.{chapter?.chapter} {chapter?.title}
    </div>
  );
}

function FirstAndLast({ character }: { character: CharactersRow }) {
  const { fullChapters, indexedSentences } = useDataContext();
  const first = indexedSentences[character.refs[0]];
  const last = indexedSentences[character.refs[character.refs.length - 1]];
  if (!first || !last) {
    return null;
  }
  return (
    <Stack key={character.name} spacing={1}>
      <div>
        {character.name}{" "}
        <span style={{ opacity: 0.5 }}>{character.count} References</span>{" "}
      </div>
      <div style={{ opacity: 0.7 }}>
        {first.sentence}{" "}
        <ChapterParens chapter={fullChapters[first.chapterFlat - 1]} />
      </div>
      <div style={{ opacity: 0.7 }}>
        {last.sentence}{" "}
        <ChapterParens chapter={fullChapters[last?.chapterFlat - 1]} />{" "}
      </div>
    </Stack>
  );
}

export function FirstAndLastRefs() {
  const { characters } = useDataContext();
  const charactersSorted = Object.values(characters).sort(
    (a, b) => b.count - a.count
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  let displayChars = charactersSorted.filter(
    (d) =>
      d.name.toLowerCase().includes(search) ||
      d.category.some((c) => c.toLowerCase().startsWith(search))
  );
  displayChars = open ? displayChars : displayChars.slice(0, 5);
  return (
    <Stack spacing={2}>
      <TextField
        placeholder="Search by name or category"
        onChange={(e) => {
          const val = e.target.value;
          setSearch(val.toLowerCase());
        }}
        fullWidth
      />
      {displayChars.map((character) => (
        <FirstAndLast key={character.name} character={character} />
      ))}
      <Button onClick={() => setOpen(!open)}>Show All</Button>
    </Stack>
  );
}
