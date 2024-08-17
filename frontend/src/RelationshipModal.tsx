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
import React, { useCallback, useEffect, useRef, useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Close from "@mui/icons-material/Close";
import { ErrorBoundary } from "./ErrorBoundry";
import { VariableSizeList as List } from "react-window";

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

  const listRef = useRef();

  const getItemSize = useCallback(
    (index) => {
      // Calculate the height of each item dynamically
      const [bookIdx, chaptersText] = groupedByBookThenChapter[index];
      const len = chaptersText.flatMap((d) => d[1]).length || 1;
      // You can adjust the height calculation logic as needed
      return 300 * len; // Example fixed height, replace with dynamic calculation if needed
    },
    [groupedByBookThenChapter]
  );

  const Row = ({ index, style }) => {
    const [bookIdx, chaptersText] = groupedByBookThenChapter[index];
    return (
      <div style={style}>
        <BookText
          key={bookIdx}
          bookIdx={bookIdx}
          chaptersText={chaptersText}
          books={books}
          setChaptersClosed={setChaptersClosed}
          chaptersClosed={chaptersClosed}
          setSentenceRefs={setSentenceRefs}
          sentenceRefs={sortedRefs}
          originalRefs={refs}
        />
      </div>
    );
  };

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
          {refs.length > 1000 ? (
            <List
              ref={listRef}
              height={600} // You can adjust this height or make it dynamic
              itemCount={groupedByBookThenChapter.length}
              itemSize={getItemSize}
              width={"100%"}
            >
              {Row}
            </List>
          ) : (
            groupedByBookThenChapter.map(([bookIdx, chaptersText]) => (
              <BookText
                key={bookIdx}
                bookIdx={bookIdx}
                chaptersText={chaptersText}
                books={books}
                setChaptersClosed={setChaptersClosed}
                chaptersClosed={chaptersClosed}
                setSentenceRefs={setSentenceRefs}
                sentenceRefs={sortedRefs}
                originalRefs={refs}
              />
            ))
          )}
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
  originalRefs,
  setBookOpened,
  bookOpened,
}: {
  bookIdx: string;
  chaptersText: [string, number[]][];
  books: any[];
  chaptersClosed: Record<string, boolean>;
  setChaptersClosed: SetState<Record<string, boolean>>;
  setSentenceRefs: SetState<number[]>;
  sentenceRefs: number[];
  originalRefs: number[];
  setBookOpened: SetState<string>;
  bookOpened: string;
}) {
  const book = books[Number(bookIdx) - 1];
  return (
    <div key={bookIdx}>
      <ListItemButton
        sx={{
          ...collapseSx,
          textTransform: "uppercase",
          zIndex: 11,
        }}
        onClick={() => setBookOpened((i) => (i === bookIdx ? "" : bookIdx))}
      >
        <div>
          {book?.title}{" "}
          <span style={{ opacity: 0.5 }}> Book {Number(bookIdx)}</span>
        </div>
        <Box>{bookOpened ? <ExpandLess /> : <ExpandMore />}</Box>
      </ListItemButton>
      <Collapse in={true}>
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
              originalRefs={originalRefs}
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
  originalRefs,
}: {
  chapterIdx: string;
  sentences: number[];
  book?: { startLetterIndex: number };
  chaptersClosed: Record<string, boolean>;
  setChaptersClosed: SetState<Record<string, boolean>>;
  setSentenceRefs: SetState<number[]>;
  sentenceRefs: number[];
  originalRefs: number[];
}) {
  const { chapters, indexedSentences, manualConfig } = useDataContext();
  const chapter = chapters.find((c) => c.chapterFlat === Number(chapterIdx))!;
  const noChapterName = String(chapter?.chapter) === chapter?.title;
  const open = !chaptersClosed[chapter?.chapterFlat];

  return (
    <div>
      <ListItemButton
        onClick={() => {
          setChaptersClosed((cs) => ({
            ...cs,
            [chapter?.chapterFlat]: !cs[chapter?.chapterFlat],
          }));
          const chapterEl = document.getElementById(
            getChapterId(chapter.chapterFlat)
          );
          if (chapterEl) {
            setTimeout(() => {
              const rect = chapterEl.getBoundingClientRect();
              const isVisible =
                rect.top >= 120 && // Adjusted top padding
                rect.left >= 0 &&
                rect.bottom <=
                  (window.innerHeight ||
                    document.documentElement.clientHeight) &&
                rect.right <=
                  (window.innerWidth || document.documentElement.clientWidth);
              if (!isVisible) {
                chapterEl.scrollIntoView({
                  block: "start",
                  behavior: "smooth",
                });
              }
            }, 400);
          }
        }}
        sx={{ ...collapseSx, top: 46, justifyContent: "flex-start" }}
      >
        <Box>
          {open ? (
            <ExpandMore sx={{ mt: 0.5 }} />
          ) : (
            <KeyboardArrowRightIcon sx={{ mt: 0.5 }} />
          )}
        </Box>
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
      </ListItemButton>
      <Collapse in={open}>
        {sentences.map((sentenceIdx, i) => {
          let sentenceText = indexedSentences[sentenceIdx].sentence;
          if (sentenceText.includes("~~~ ")) return null;
          sentenceText =
            manualConfig.replaceTextFn?.(sentenceText) || sentenceText;
          const refIdx = sentenceRefs.findIndex((d) => d === sentenceIdx) || 0;
          const nextSentenceIdx = sentenceRefs[refIdx + 1];

          const gapLen = nextSentenceIdx - sentenceIdx;
          const longGap = gapLen > 500;
          const originalRef = originalRefs.includes(sentenceIdx);

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
            <Box sx={{ my: 2, px: 2, color: originalRef ? "#ccc" : "#999" }}>
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
