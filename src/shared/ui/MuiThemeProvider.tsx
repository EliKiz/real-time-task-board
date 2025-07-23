"use client";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";

const theme = createTheme(); // Можно кастомизировать тему

export const MuiThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <MUIThemeProvider theme={theme}>
    {children}
  </MUIThemeProvider>
); 