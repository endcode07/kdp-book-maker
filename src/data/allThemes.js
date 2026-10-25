import { THEMES } from "./themes";
import { THEMES_EN } from "./themesEn";
import { THEMES_MORE } from "./themesMore";

export const ALL_THEMES = {
  ...THEMES_EN,
  ...THEMES_MORE,
  ...Object.fromEntries(
    Object.entries(THEMES).map(([k, t]) => [`ms_${k}`, { ...t, label: `${t.label} (Malay)`, lang: "ms" }])
  ),
};
