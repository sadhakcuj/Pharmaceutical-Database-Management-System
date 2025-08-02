import { lighten } from "polished";
import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

type Theme = typeof theme;

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
body {
  margin: unset;
  padding: unset;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

* {
  color: ${({ theme }) => theme.colors.text};
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #80808017;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.tertiary};
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => lighten(0.2, theme.colors.tertiary)};
  }

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.colors.tertiary} white !important;
}

a {
  text-decoration: none;
}

#root {
  overflow-x: hidden;
}

`;
