import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemButton,
  Typography,
} from "@mui/material";
import { sort } from "d3";
import { groupBy, uniq } from "lodash-es";
import {
  getPercent,
  LETTERS_PER_PAGE,
  RelationshipRefs,
  SetState,
} from "./utils";
import { useDataContext } from "./DataContext";
import React, { useEffect, useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Close from "@mui/icons-material/Close";
import { ErrorBoundary } from "./ErrorBoundry";

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
  const [chaptersClosed, setChaptersClosed] = useState({});
  const [sentenceRefs, setSentenceRefs] = useState(refs);
  const sortedRefs = sort(uniq(sentenceRefs));
  useScrollToChapter({ chapter: selectedChapter });
  const { chapters, indexedSentences, books } = useDataContext();
  const totalLength = refs.reduce(
    (sum, idx) => sum + (indexedSentences[idx]?.sentence.length || 0) + 1,
    0
  );

  const totalBookLength = chapters[chapters.length - 1].letterIndex;

  const groupedByBookThenChapter = Object.entries(
    groupBy(
      Object.entries(
        groupBy(sortedRefs, (s) => indexedSentences[s].chapterFlat)
      ),
      (d) => chapters.find((c) => String(c.chapterFlat) === d[0])?.book
    )
  );

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      sx={{ ".MuiDialog-paperScrollPaper": { maxWidth: 800 } }}
    >
      <DialogTitle sx={{ display: "flex", gap: 1, px: 2 }}>
        <div>The Story of {title} </div>
        <div style={{ flexGrow: 1 }} />
        <div style={{ opacity: 0.5, fontWeight: "lighter" }}>
          {getPercent(totalLength / totalBookLength)}% of total text
        </div>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ position: "relative", p: 0 }}>
        <ErrorBoundary>
          {groupedByBookThenChapter.map(([bookIdx, chaptersText]) => (
            <BookText
              key={bookIdx}
              bookIdx={bookIdx}
              chaptersText={chaptersText}
              books={books}
              setChaptersClosed={setChaptersClosed}
              chaptersClosed={chaptersClosed}
              setSentenceRefs={setSentenceRefs}
              sentenceRefs={sortedRefs}
            />
          ))}
        </ErrorBoundary>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={() =>
            setChaptersClosed(
              chapters.reduce(
                (acc, ch) => ({
                  ...acc,
                  [ch.chapterFlat]: !Object.values(chaptersClosed)[0],
                }),
                {}
              )
            )
          }
        >
          Collapse Chapters
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const collapseSx = {
  position: "sticky",
  top: 0,
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
  setChaptersClosed,
  chaptersClosed,
  setSentenceRefs,
  sentenceRefs,
}: {
  bookIdx: string;
  chaptersText: [string, number[]][];
  books: any[];
  chaptersClosed: Record<string, boolean>;
  setChaptersClosed: SetState<Record<string, boolean>>;
  setSentenceRefs: SetState<number[]>;
  sentenceRefs: number[];
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
              setChaptersClosed={setChaptersClosed}
              chaptersClosed={chaptersClosed}
              setSentenceRefs={setSentenceRefs}
              sentenceRefs={sentenceRefs}
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
  chaptersClosed,
  setChaptersClosed,
  setSentenceRefs,
  sentenceRefs,
}: {
  chapterIdx: string;
  sentences: number[];
  book?: { startLetterIndex: number };
  chaptersClosed: Record<string, boolean>;
  setChaptersClosed: SetState<Record<string, boolean>>;
  setSentenceRefs: SetState<number[]>;
  sentenceRefs: number[];
}) {
  const { chapters, indexedSentences, manualConfig } = useDataContext();
  const chapter = chapters.find((c) => c.chapterFlat === Number(chapterIdx))!;
  const noChapterName = String(chapter?.chapter) === chapter?.title;
  const open = !chaptersClosed[chapter?.chapterFlat];

  return (
    <div>
      <ListItemButton
        onClick={() =>
          setChaptersClosed((cs) => ({
            ...cs,
            [chapter?.chapterFlat]: !cs[chapter?.chapterFlat],
          }))
        }
        sx={{ ...collapseSx, top: 46 }}
      >
        <div>
          <Box
            id={getChapterId(chapter?.chapterFlat)}
            sx={{ pt: 7, mt: -7, zIndex: -1, position: "relative" }}
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
          let sentenceText = indexedSentences[sentenceIdx].sentence;
          if (sentenceText.includes("~~~ ")) return null;
          sentenceText = sentenceText.replace(/_(.*?)_/g, "<em>$1</em>");
          const refIdx = sentenceRefs.findIndex((d) => d === sentenceIdx) || 0;
          const nextSentenceIdx = sentenceRefs[refIdx + 1];

          const gapLen = nextSentenceIdx - sentenceIdx;
          const longGap = gapLen > 500;

          const page = book
            ? Math.floor(
                (sentenceIdx - book.startLetterIndex) / LETTERS_PER_PAGE
              )
            : "";

          let gapNode = null as React.ReactNode;
          if (
            gapLen &&
            gapLen !== indexedSentences[nextSentenceIdx]?.sentence.length
          ) {
            const longGapNode = longGap && (
              <Typography sx={{ mb: 3, opacity: 0.3 }}>p. {page}</Typography>
            );
            gapNode = (
              <div style={{ position: "relative", zIndex: 1 }}>
                {manualConfig.publicDomain ? (
                  <Button
                    color="inherit"
                    sx={{ minWidth: 10 }}
                    onClick={() => {
                      setSentenceRefs((refs) => {
                        const allKeys = Object.keys(indexedSentences);
                        const overallIndex = allKeys.findIndex(
                          (d) => d === String(sentenceIdx)
                        );
                        const newRefs = [
                          Number(allKeys[overallIndex + 1]),
                          Number(allKeys[overallIndex + 2]),
                          Number(allKeys[overallIndex + 3]),
                          Number(allKeys[overallIndex + 4]),
                          Number(allKeys[overallIndex + 5]),
                        ];

                        return [...refs, ...newRefs];
                      });
                    }}
                  >
                    ...
                  </Button>
                ) : (
                  <Typography sx={{ mt: 0, opacity: 0.3 }}>...</Typography>
                )}
                {longGapNode}
              </div>
            );
          }
          let topGapNode = null;
          if (i === 0 && chapter.letterIndex !== sentenceIdx) {
            topGapNode = (
              <div style={{ position: "relative", zIndex: 1 }}>
                {manualConfig.publicDomain ? (
                  <Button
                    color="inherit"
                    sx={{ minWidth: 10 }}
                    onClick={() => {
                      setSentenceRefs((refs) => {
                        const allKeys = Object.keys(indexedSentences);
                        const overallIndex = allKeys.findIndex(
                          (d) => d === String(sentenceIdx)
                        );
                        const newRefs = [Number(allKeys[overallIndex - 1])];

                        return [...refs, ...newRefs];
                      });
                    }}
                  >
                    ...
                  </Button>
                ) : (
                  <Typography sx={{ mt: 0, opacity: 0.3 }}>...</Typography>
                )}
              </div>
            );
          }
          return (
            <Box sx={{ my: 2, px: 2, color: "#ccc" }}>
              {topGapNode}
              <Typography key={sentenceIdx} variant="body1">
                <div dangerouslySetInnerHTML={{ __html: sentenceText }} />
              </Typography>
              {gapNode}
            </Box>
          );
        })}
      </Collapse>
    </div>
  );
}
