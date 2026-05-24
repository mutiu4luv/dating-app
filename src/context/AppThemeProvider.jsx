import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, IconButton, Tooltip } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

const getInitialMode = () => {
  const stored = localStorage.getItem("themeMode");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () =>
        setMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#2d0052" },
          secondary: { main: "#D9A4F0" },
          background: {
            default: mode === "dark" ? "#0f1017" : "#ffffff",
            paper: mode === "dark" ? "#181a25" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#f8fafc" : "#181123",
            secondary: mode === "dark" ? "#cbd5e1" : "#5f5670",
          },
        },
        shape: { borderRadius: 8 },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const ThemeModeToggle = () => {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={toggleMode}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        sx={{
          position: "fixed",
          right: { xs: 14, sm: 18 },
          bottom: { xs: 150, sm: 28 },
          zIndex: 1500,
          width: 46,
          height: 46,
          bgcolor: isDark ? "#D9A4F0" : "#2d0052",
          color: isDark ? "#2d0052" : "#fff",
          border: "1px solid rgba(217,164,240,0.65)",
          boxShadow: "0 14px 38px rgba(45,0,82,0.26)",
          "&:hover": {
            bgcolor: isDark ? "#e7bef8" : "#4b087c",
          },
        }}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};
