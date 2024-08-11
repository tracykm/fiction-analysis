import { Box, Divider, Skeleton, Tab, Tabs, Typography } from "@mui/material";
import { CharacterPieCharts } from "./CharacterPieCharts";
import { TimeGraphAndExcerpts } from "./TimeGraphAndExcerpts";
import { ErrorBoundary } from "./ErrorBoundry";
import { useEffect, useState } from "react";
import { isEmpty, startCase } from "lodash-es";
import { TopCharacters } from "./TopCharacters";
import { RelationshipsOverTime } from "./RelationshipsOverTime";
import { DataContextProvider, useDataContext } from "./DataContext";
import { FirstAndLastRefs } from "./FirstAndLastRefs";

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

function BookTabs({
  setSelectedBook,
  selectedBook,
  books,
}: {
  setSelectedBook: (book: number) => void;
  selectedBook: number;
  books: { id: number; title: string }[];
}) {
  return (
    <Tabs
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#333",
        width: "100%",
      }}
      variant={books.length > 3 ? "scrollable" : "standard"}
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
  const urlParams = new URLSearchParams(window.location.search);
  const urlBook = urlParams.get("book") || "0";
  const series = urlParams.get("series") || "his_dark_materials";
  const [selectedBook, _setSelectedBook] = useState(Number(urlBook));
  const setSelectedBook = (book: number) => {
    window.history.replaceState(
      null,
      "",
      `?book=${book === 0 ? "" : book.toString()}&series=${series}`
    );
    _setSelectedBook(book);
    document.title = series;
  };
  useEffect(() => {
    document.title = `${startCase(series)} Data Analysis`;
  }, [series]);

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 1 }}>
      <header>
        <Typography variant="h1" sx={{ fontSize: 34 }}>
          {startCase(series)}
        </Typography>
      </header>

      <DataContextProvider selectedBook={selectedBook} series={series}>
        <MainContent setSelectedBook={setSelectedBook} />
      </DataContextProvider>
    </Box>
  );
}

function MainContent({
  setSelectedBook,
}: {
  setSelectedBook: (book: number) => void;
}) {
  const fullContext = useDataContext();

  const loading = !Object.keys(fullContext).length;

  const selectedBook = fullContext.selectedBook || 0;
  const books = fullContext.books || [{ id: 1, title: "Loading..." }];

  const forceRemountKey = fullContext.manualConfig?.sharedCharacters
    ? "shared"
    : fullContext.selectedBook;

  const hasRelationshipTimelines = !isEmpty(fullContext.relationshipTimelines);

  return (
    <ErrorBoundary>
      <BookTabs {...{ setSelectedBook, selectedBook, books }} />

      {(hasRelationshipTimelines || loading) && (
        <Section title="Relationships Over Time">
          <ErrorBoundary>
            {loading ? (
              <Skeleton variant="rectangular" height={362} />
            ) : (
              <RelationshipsOverTime />
            )}
          </ErrorBoundary>
        </Section>
      )}

      <Section title="Top Relationships">
        <ErrorBoundary>
          {loading ? (
            <Skeleton variant="rectangular" height={460} />
          ) : (
            <TopCharacters key={forceRemountKey} />
          )}
        </ErrorBoundary>
      </Section>

      <Section title="Character Categories">
        <ErrorBoundary>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <CharacterPieCharts />
          )}
        </ErrorBoundary>
      </Section>

      <Section title="First and Last References">
        <ErrorBoundary>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <FirstAndLastRefs />
          )}
        </ErrorBoundary>
      </Section>

      <Section title="Character References Over Time">
        <ErrorBoundary>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <TimeGraphAndExcerpts />
          )}
        </ErrorBoundary>
      </Section>
    </ErrorBoundary>
  );
}

export default App;
