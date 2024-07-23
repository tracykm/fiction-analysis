import { Box, Divider, Typography } from "@mui/material";
import { CharacterPieCharts } from "./CharacterPieCharts";
import { TimeGraphAndExcerpts } from "./TimeGraphAndExcerpts";
import { ErrorBoundary } from "./ErrorBoundry";

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

function App() {
  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 4 }}>
      <header>
        <h1>His Dark Materials</h1>
      </header>

      <Section title="Character Categories">
        <ErrorBoundary>
          <CharacterPieCharts />
        </ErrorBoundary>
      </Section>

      <Section title="Character References Over Time">
        <ErrorBoundary>
          <TimeGraphAndExcerpts />
        </ErrorBoundary>
      </Section>
    </Box>
  );
}

export default App;
