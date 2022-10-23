import { Box, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import characters from "./data/characters.json";

function App() {
  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 4 }}>
      <header>
        <h1>His Dark Materials</h1>
      </header>
      <Stack spacing={2} direction="row">
        {Object.keys(characters).map((c) => (
          <div>
            <div>{c}</div>
            {characters[c].count}
            {characters[c].char_count.map((l) => (
              <Tooltip title={l.sentence} placement="right">
                <div>{Math.round((l.char_count / 635682) * 100)}%</div>
              </Tooltip>
            ))}
            {}
          </div>
        ))}
      </Stack>
    </Box>
  );
}

export default App;
