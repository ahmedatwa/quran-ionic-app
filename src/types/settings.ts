interface Styles {
  quranFontSize: number;
  translationFontSize: number;
  quranFontFamily: string;
  translationFontFamily: string;
  fontWeight: string;
  wordColor: string;
}

type FontFamilyGroup = string[];
type FontWeights = string[] | number[];

type ComputedQuranCSSReturn = Record<
  "fontFamily" | "fontSize" | "fontWeight" | "wordColor",
  string
>;

type ComputedTranslationCSSReturn = Record<
  "fontFamily" | "fontSize",
  string
>;

export type {
  Styles,
  FontFamilyGroup,
  FontWeights,
  ComputedQuranCSSReturn,
  ComputedTranslationCSSReturn,
};
