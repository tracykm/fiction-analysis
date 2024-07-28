import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { sort } from "d3";
import { uniq } from "lodash-es";
import { getPercent, LETTERS_PER_PAGE, RelationshipRefs } from "./utils";
import { useDataContext } from "./DataContext";

export function RelationshipModal({
  relationship,
  ...rest
}: {
  onClose: () => void;
  title: string;
  relationship: RelationshipRefs;
}) {
  const flattenedSentences = relationship.flatMap((pair) => pair);

  return <RefsModal {...rest} refs={flattenedSentences} />;
}

export function RefsModal({
  onClose,
  title,
  refs,
}: {
  onClose: () => void;
  title: string;
  refs: number[];
}) {
  const { chapters, indexedSentences, books, manualConfig } = useDataContext();
  const totalLength = refs.reduce(
    (sum, idx) => sum + (indexedSentences[idx]?.sentence.length || 0) + 1,
    0
  );

  const totalBookLength = chapters[chapters.length - 1].letterIndex;

  const sortedSentences = sort(uniq(refs));
  return (
    <Dialog open onClose={onClose} maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <div>The Story of {title} </div>
        <div style={{ opacity: 0.5 }}>
          {getPercent(totalLength / totalBookLength)}% of total text
        </div>
      </DialogTitle>
      <DialogContent sx={{ position: "relative" }}>
        {sortedSentences.map((sentenceId, i) => {
          const lastSentenceIdx = sortedSentences[i - 1];
          const sentenceText = indexedSentences[sentenceId]?.sentence;
          const gapLen = sentenceId - lastSentenceIdx;
          const lastChapterIdx = chapters.findIndex(
            (c) => c.letterIndex > lastSentenceIdx
          );
          const lastChapter = chapters[lastChapterIdx - 1];
          const chapterIdx = chapters.findIndex(
            (c) => c.letterIndex > sentenceId
          );
          const chapter = chapters[chapterIdx - 1];
          const longGap = gapLen > 500;

          const book = books[chapter?.book - 1];
          const page = book
            ? Math.floor(
                (sentenceId - book.startLetterIndex) / LETTERS_PER_PAGE
              )
            : "";

          return (
            <div key={sentenceId}>
              {manualConfig.sharedCharacters &&
                lastChapter?.book !== chapter?.book && (
                  <Typography sx={{ fontSize: "1.2em", mt: 1, mb: -3 }}>
                    Book {chapter?.book}
                  </Typography>
                )}
              {lastChapter?.chapterFlat !== chapter?.chapterFlat ? (
                <Typography sx={{ fontSize: "1.2em", my: 4 }}>
                  Chapter {chapter?.chapter}{" "}
                  {String(chapter?.chapter) === chapter?.title
                    ? ""
                    : chapter?.title}
                </Typography>
              ) : gapLen && gapLen !== sentenceText.length ? (
                <>
                  <Typography sx={{ mt: longGap ? 3 : 0, opacity: 0.3 }}>
                    ...
                  </Typography>
                  {longGap && (
                    <Typography sx={{ mb: 3, opacity: 0.3 }}>
                      p.{page}
                    </Typography>
                  )}
                </>
              ) : (
                ""
              )}

              <Typography sx={{ opacity: 0.75, mt: 0.75, mb: -0.25 }}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: sentenceText.replace(/_(.*?)_/g, "<i>$1</i>"),
                  }}
                />
              </Typography>
            </div>
          );
        })}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
