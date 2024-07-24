import { Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import { CharacterPieCharts } from "./CharacterPieCharts";
import { TimeGraphAndExcerpts } from "./TimeGraphAndExcerpts";
import { ErrorBoundary } from "./ErrorBoundry";
import {
  books,
  chaptersFullData,
  charactersFullData,
  flatChapterToBook,
} from "./utils";
import { useState } from "react";
import { mapValues, pickBy } from "lodash-es";

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <>
      <Divider sx={{ mt: 4, mb: 1 }} />
      <Typography
        sx={{ textTransform: "uppercase", fontWeight: "light", mb: 4 }}
        component="h3"
      >
        {title}
      </Typography>
      {children}
    </>
  );
}

function BookTabs({ selectedBook, setSelectedBook }) {
  return (
    <Tabs
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        background: "#333",
        width: "100%",
      }}
      onChange={(e, opt) => {
        setSelectedBook(opt);
      }}
      value={selectedBook}
    >
      <Tab key={0} label="All Books" />
      {books.map((book) => (
        <Tab key={book.id} label={book.title} />
      ))}
    </Tabs>
  );
}

function App() {
  const [selectedBook, setSelectedBook] = useState(0);
  let characters = charactersFullData;
  if (selectedBook != 0) {
    characters = pickBy(charactersFullData, (d) =>
      Object.keys(d.refs).some((ch) => flatChapterToBook[ch] === selectedBook)
    );
    characters = mapValues(characters, (d) => {
      const refs = pickBy(
        d.refs,
        (v, k) => flatChapterToBook[k] === selectedBook
      );
      return {
        ...d,
        refs,
        count: Object.values(refs).reduce((acc, d) => acc + d.length, 0),
      };
    });
  }
  const chapters = selectedBook
    ? chaptersFullData.filter((d) => d.book === selectedBook)
    : chaptersFullData;

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 1 }}>
      <header>
        <Typography variant="h1" sx={{ fontSize: 34 }}>
          His Dark Materials
        </Typography>
      </header>
      <BookTabs {...{ selectedBook, setSelectedBook }} />

      <Section title="Character Categories">
        <ErrorBoundary>
          <CharacterPieCharts characters={characters} chapters={chapters} />
        </ErrorBoundary>
      </Section>

      <Section title="Character References Over Time">
        <ErrorBoundary>
          <TimeGraphAndExcerpts characters={characters} chapters={chapters} />
        </ErrorBoundary>
      </Section>
    </Box>
  );
}

export default App;
