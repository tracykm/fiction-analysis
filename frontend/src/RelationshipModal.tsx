import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemButton,
  Typography,
} from "@mui/material";
import { sort } from "d3";
import { groupBy, uniq } from "lodash-es";
import { getPercent, LETTERS_PER_PAGE, RelationshipRefs } from "./utils";
import { useDataContext } from "./DataContext";
import { useEffect, useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

export function RelationshipModal({
  relationship,
  ...rest
}: {
  onClose: () => void;
  title: string;
  relationship: RelationshipRefs;
  selectedChapter?: number;
}) {
  const flattenedSentences = relationship.flatMap((pair) => pair);

  return <RefsModal {...rest} refs={flattenedSentences} />;
}

const getChapterId = (chapter: number) => `chapter-${chapter}`;

function useScrollToChapter({ chapter }: { chapter?: number }) {
  useEffect(() => {
    if (!chapter) return;
    const scrollToChapter = () => {
      let chp = chapter;
      let chapterEl = document.getElementById(getChapterId(chapter));
      while (!chapterEl && chp > 0) {
        chp--;
        chapterEl = document.getElementById(getChapterId(chp));
      }
      if (chapterEl) {
        chapterEl.scrollIntoView();
      }
    };

    const timeoutId = setTimeout(scrollToChapter, 0);

    return () => clearTimeout(timeoutId);
  }, [chapter]);
}

export function RefsModal({
  onClose,
  title,
  refs,
  selectedChapter,
}: {
  onClose: () => void;
  title: string;
  refs: number[];
  selectedChapter?: number;
}) {
  useScrollToChapter({ chapter: selectedChapter });
  const { chapters, indexedSentences, books } = useDataContext();
  const totalLength = refs.reduce(
    (sum, idx) => sum + (indexedSentences[idx]?.sentence.length || 0) + 1,
    0
  );

  const totalBookLength = chapters[chapters.length - 1].letterIndex;

  const sortedSentences = sort(uniq(refs));

  const groupedByBookThenChapter = Object.entries(
    groupBy(
      Object.entries(
        groupBy(sortedSentences, (s) => indexedSentences[s].chapterFlat)
      ),
      (d) => chapters.find((c) => String(c.chapterFlat) === d[0])?.book
    )
  );

  return (
    <Dialog open onClose={onClose} maxWidth="md">
      <DialogTitle sx={{ display: "flex", gap: 1 }}>
        <div>The Story of {title} </div>
        <div style={{ flexGrow: 1 }} />
        <div style={{ opacity: 0.5, fontWeight: "lighter" }}>
          {getPercent(totalLength / totalBookLength)}% of total text
        </div>
        <Button sx={{ minWidth: 10 }} onClick={onClose}>
          X
        </Button>
      </DialogTitle>
      <DialogContent sx={{ position: "relative", p: 0 }}>
        {groupedByBookThenChapter.map(([bookIdx, chaptersText]) => (
          <BookText
            key={bookIdx}
            bookIdx={bookIdx}
            chaptersText={chaptersText}
            books={books}
          />
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

const collapseSx = {
  position: "sticky",
  top: 0,
  my: 1,
  backgroundColor: "#444",
  border: "1px solid #555",
  zIndex: 10,
  display: "flex",
  justifyContent: "space-between",
  ":hover": {
    backgroundColor: "#444",
  },
} as const;

function BookText({
  bookIdx,
  chaptersText,
  books,
}: {
  bookIdx: string;
  chaptersText: [string, number[]][];
  books: any[];
}) {
  const book = books[Number(bookIdx) - 1];
  const [open, setOpen] = useState(true);
  return (
    <div key={bookIdx}>
      <ListItemButton
        sx={{
          ...collapseSx,
          textTransform: "uppercase",
          zIndex: 11,
        }}
        onClick={() => setOpen(!open)}
      >
        <div>
          {book?.title}{" "}
          <span style={{ opacity: 0.5 }}> Book {Number(bookIdx)}</span>
        </div>
        <Box>{open ? <ExpandLess /> : <ExpandMore />}</Box>
      </ListItemButton>
      <Collapse in={open}>
        {chaptersText.map(([chapterIdx, sentences]) => {
          return (
            <ChapterText
              key={chapterIdx}
              chapterIdx={chapterIdx}
              sentences={sentences}
              book={book}
            />
          );
        })}
      </Collapse>
    </div>
  );
}

function ChapterText({
  chapterIdx,
  sentences,
  book,
}: {
  chapterIdx: string;
  sentences: number[];
  book?: { startLetterIndex: number };
}) {
  const { chapters, indexedSentences } = useDataContext();
  const chapter = chapters.find((c) => c.chapterFlat === Number(chapterIdx));
  const [open, setOpen] = useState(true);
  const noChapterName = String(chapter?.chapter) === chapter?.title;
  return (
    <div>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{ ...collapseSx, top: 48 }}
      >
        <div>
          <Box
            id={getChapterId(chapter?.chapterFlat)}
            sx={{ pt: 5.5, mt: -5.5 }}
          />
          <span style={{ opacity: 0.5 }}>
            {noChapterName ? "" : `  Chapter ${chapter?.chapter} `}
          </span>
          {noChapterName ? ` Chapter ${chapter?.chapter} ` : chapter?.title}
        </div>
        <Box>{open ? <ExpandLess /> : <ExpandMore />}</Box>
      </ListItemButton>
      <Collapse in={open}>
        {sentences.map((sentenceIdx, i) => {
          const sentenceText = indexedSentences[sentenceIdx].sentence;
          const lastSentenceIdx = sentences[i - 1];
          const gapLen = sentenceIdx - lastSentenceIdx;
          const longGap = gapLen > 500;
          const page = book
            ? Math.floor(
                (sentenceIdx - book.startLetterIndex) / LETTERS_PER_PAGE
              )
            : "";
          return (
            <Box sx={{ my: 2, px: 2 }}>
              {gapLen && gapLen !== sentenceText.length ? (
                <>
                  <Typography sx={{ mt: longGap ? 3 : 0, opacity: 0.3 }}>
                    ...
                  </Typography>
                  {longGap && (
                    <Typography sx={{ mb: 3, opacity: 0.3 }}>
                      p. {page}
                    </Typography>
                  )}
                </>
              ) : (
                ""
              )}
              <Typography key={sentenceIdx} variant="body1">
                {sentenceText}
              </Typography>
            </Box>
          );
        })}
      </Collapse>
    </div>
  );
}
