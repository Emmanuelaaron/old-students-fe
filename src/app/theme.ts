import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    gold: Palette["primary"];
  }
  interface PaletteOptions {
    gold?: PaletteOptions["primary"];
  }
}

const navy = "#1b2d5e";
const gold = "#c8991a";

export const theme = createTheme({
  palette: {
    primary: {
      main: navy,
      contrastText: "#ffffff",
    },
    secondary: {
      main: gold,
      contrastText: "#ffffff",
    },
    gold: {
      main: gold,
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
    text: {
      primary: navy,
      secondary: "#5a6a8a",
    },
  },
  typography: {
    fontFamily: "'Lato', 'Helvetica', 'Arial', sans-serif",
    h1: { fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700 },
    h2: { fontFamily: "'Cinzel', Georgia, serif", fontWeight: 700 },
    h3: { fontFamily: "'Cinzel', Georgia, serif", fontWeight: 600 },
    h4: { fontFamily: "'Cinzel', Georgia, serif", fontWeight: 600 },
    h5: { fontFamily: "'Cinzel', Georgia, serif", fontWeight: 600 },
    h6: { fontFamily: "'Cinzel', Georgia, serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: "none" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});
