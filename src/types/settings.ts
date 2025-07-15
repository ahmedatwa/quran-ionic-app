interface Styles {
  fontSize: number | string;
  fontFamily: string;
  fontWeight: string;
  wordColor: string
}

type FontFamilyGroup = string[];
type FontWeights = string[] | number[];

export type { Styles, FontFamilyGroup, FontWeights };
