interface Styles {
  quranFrontSize: number | string;
  translationsFontSize?: number | string;
  quranFontFamily: string;
  translationsFontFamily?: string;
  fontWeight: number | string;
}

type FontFamilyGroup = string[]
type FontWeights = string[] | number[]

export type { Styles, FontFamilyGroup, FontWeights };
