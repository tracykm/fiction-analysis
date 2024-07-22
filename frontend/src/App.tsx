import { Box, Divider } from "@mui/material";
import { CharacterPieCharts } from "./CharacterPieCharts";
import { TimeGraphAndExcerpts } from "./TimeGraphAndExcerpts";

function App() {
  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 4 }}>
      <header>
        <h1>His Dark Materials</h1>
      </header>
      <Divider sx={{ mb: 4, mt: 2 }} />
      <CharacterPieCharts />
      <Divider sx={{ mb: 4, mt: 2 }} />
      <TimeGraphAndExcerpts />
    </Box>
  );
}

export default App;
