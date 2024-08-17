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
import { groupBy, throttle, uniq } from "lodash-es";
import {
  getPercent,
  LETTERS_PER_PAGE,
  RelationshipRefs,
  SetState,
} from "./utils";
import { useDataContext } from "./DataContext";
import React, { useCallback, useEffect, useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
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

function scrollToChapter(chapter: number) {
  let chp = chapter;
  let chapterEl = document.getElementById(getChapterId(chapter));
  while (!chapterEl && chp > 0) {
    chp--;
    chapterEl = document.getElementById(getChapterId(chp));
  }
  if (isElementVisible(chapterEl)) return;
  const container = document.getElementById("refs-modal");
  if (chapterEl && container) {
    const offset = 250;
    const elementPosition =
      chapterEl.getBoundingClientRect().top +
      container.getBoundingClientRect().top;
    const offsetPosition = elementPosition - offset;
    container.scrollTo({
      top: offsetPosition,
    });
  }
}

function useScrollToChapter({ chapter }: { chapter?: number }) {
  useEffect(() => {
    if (!chapter) return;

    const timeoutId = setTimeout(() => scrollToChapter(chapter), 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [chapter]);
}

function padOutChapters(chapters: number[], allChapters: number[]) {
  if (!chapters.length) {
    return [Number(allChapters[0]), Number(allChapters[1])];
  }
  const idx = allChapters.findIndex((d) => Number(d) === Number(chapters[0]));
  return [
    Number(allChapters[idx - 2]),
    Number(allChapters[idx - 1]),
    ...chapters,
    Number(allChapters[idx + 1]),
    Number(allChapters[idx + 2]),
  ];
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

  const groupByChapter = groupBy(
    sortedRefs,
    (s) => indexedSentences[s].chapterFlat
  );

  const groupedByBookThenChapter = Object.entries(
    groupBy(
      Object.entries(groupByChapter),
      (d) => chapters.find((c) => String(c.chapterFlat) === d[0])?.book
    )
  );
  let defaultChaptersToShow = selectedChapter ? [selectedChapter] : [];

  const usedChapters = Object.keys(groupByChapter).map(Number);

  const [chaptersToShow, setChaptersToShow] = useState(
    padOutChapters(defaultChaptersToShow, usedChapters)
  );

  const updateChaptersToShow = useCallback(() => {
    if (chapters.length === 1) return;
    const visibleChapters = chapters
      .map((c) => c.chapterFlat)
      .filter((chapterFlat) => {
        const elem = document.getElementById(getChapterId(chapterFlat));
        if (!elem) return;
        if (isElementVisible(elem)) {
          return true;
        }
      });
    setChaptersToShow(padOutChapters(visibleChapters, usedChapters));
  }, [chapters]);

  const handleScroll = useCallback(throttle(updateChaptersToShow, 200), [
    chapters,
  ]);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      sx={{ ".MuiDialog-paperScrollPaper": { maxWidth: 800 } }}
    >
      <DialogTitle sx={{ display: "flex", gap: 1, px: 2 }}>
        <div>The Story of {title}</div>
        <div style={{ flexGrow: 1 }} />
        <div style={{ opacity: 0.5, fontWeight: "lighter" }}>
          {getPercent(totalLength / totalBookLength)}% of total text
        </div>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ position: "relative", p: 0 }}
        onScroll={handleScroll}
        id="refs-modal"
      >
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
              originalRefs={refs}
              chaptersToShow={chaptersToShow}
              updateChaptersToShow={updateChaptersToShow}
            />
          ))}
        </ErrorBoundary>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
function isElementVisible(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight
  );
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
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
  chaptersToShow,
  updateChaptersToShow,
}: {
  bookIdx: string;
  chaptersText: [string, number[]][];
  books: any[];
  chaptersClosed: Record<string, boolean>;
  setChaptersClosed: SetState<Record<string, boolean>>;
  setSentenceRefs: SetState<number[]>;
  sentenceRefs: number[];
  originalRefs: number[];
  chaptersToShow: number[];
  updateChaptersToShow: () => void;
}) {
  const book = books[Number(bookIdx) - 1];
  const open = true;

  return (
    <div key={bookIdx}>
      <ListItemButton
        sx={{
          ...collapseSx,
          textTransform: "uppercase",
          zIndex: 11,
          height: 47,
        }}
        id={`book-${bookIdx}`}
      >
        <div>
          {book?.title}{" "}
          <span style={{ opacity: 0.5 }}> Book {Number(bookIdx)}</span>
        </div>
        {/* <Box>{open ? <ExpandLess /> : <ExpandMore />}</Box> */}
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
              originalRefs={originalRefs}
              displayPlaceholder={!chaptersToShow.includes(Number(chapterIdx))}
            />
          );
        })}
      </Collapse>
    </div>
  );
}

function ChapterTitle({
  open,
  chapter,
  onClick,
}: {
  open: boolean;
  chapter: any;
  onClick?: () => void;
}) {
  const noChapterName = String(chapter?.chapter) === chapter?.title;

  return (
    <ListItemButton
      onClick={onClick}
      sx={{ ...collapseSx, top: 46, justifyContent: "flex-start" }}
    >
      {/* <Box>
        {open ? (
          <ExpandMore sx={{ mt: 0.5 }} />
        ) : (
          <KeyboardArrowRightIcon sx={{ mt: 0.5 }} />
        )}
      </Box> */}
      <div>
        <Box
          id={getChapterId(chapter?.chapterFlat)}
          sx={{ zIndex: -1, position: "relative" }}
        />
        <span style={{ opacity: 0.5 }}>
          {noChapterName ? "" : `  Chapter ${chapter?.chapter} `}
        </span>
        {noChapterName ? ` Chapter ${chapter?.chapter} ` : chapter?.title}
      </div>
    </ListItemButton>
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
  displayPlaceholder,
}: {
  chapterIdx: string;
  sentences: number[];
  book?: { startLetterIndex: number };
  chaptersClosed: Record<string, boolean>;
  setChaptersClosed: SetState<Record<string, boolean>>;
  setSentenceRefs: SetState<number[]>;
  sentenceRefs: number[];
  originalRefs: number[];
  displayPlaceholder?: boolean;
}) {
  const { chapters, indexedSentences, manualConfig } = useDataContext();
  const chapter = chapters.find((c) => c.chapterFlat === Number(chapterIdx))!;
  const open = true;

  if (displayPlaceholder) {
    return (
      <div>
        <ChapterTitle chapter={chapter} open={open} />
        {open && <div style={{ height: sentences.length * 100 }} />}
      </div>
    );
  }

  return (
    <div>
      <ChapterTitle chapter={chapter} open={open} />

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
            <Box
              key={sentenceIdx}
              sx={{ my: 2, px: 2, color: originalRef ? "#ccc" : "#999" }}
            >
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
