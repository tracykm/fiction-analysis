import App from "./App";
import "./index.css";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { createRoot } from "react-dom/client";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#25CED1",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <ThemeProvider theme={darkTheme}>
    <App />
  </ThemeProvider>
);
