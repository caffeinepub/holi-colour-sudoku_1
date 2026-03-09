export interface ColourDef {
  id: number; // 1–6
  name: string;
  hex: string;
  cbLabel: string; // colour-blind short label
  /** OKLCH L C H for inline use */
  oklch: string;
  /** contrasting text colour for label on this bg */
  textColour: string;
}

export const COLOURS: ColourDef[] = [
  {
    id: 1,
    name: "Red",
    hex: "#E53E3E",
    cbLabel: "R",
    oklch: "0.53 0.24 27",
    textColour: "#fff",
  },
  {
    id: 2,
    name: "Orange",
    hex: "#ED8936",
    cbLabel: "O",
    oklch: "0.68 0.19 50",
    textColour: "#fff",
  },
  {
    id: 3,
    name: "Yellow",
    hex: "#ECC94B",
    cbLabel: "Y",
    oklch: "0.83 0.17 88",
    textColour: "#333",
  },
  {
    id: 4,
    name: "Green",
    hex: "#48BB78",
    cbLabel: "G",
    oklch: "0.68 0.18 145",
    textColour: "#fff",
  },
  {
    id: 5,
    name: "Teal",
    hex: "#38B2AC",
    cbLabel: "T",
    oklch: "0.65 0.14 193",
    textColour: "#fff",
  },
  {
    id: 6,
    name: "Blue",
    hex: "#4299E1",
    cbLabel: "B",
    oklch: "0.62 0.17 235",
    textColour: "#fff",
  },
];

export function getColour(id: number): ColourDef | undefined {
  return COLOURS.find((c) => c.id === id);
}

export function colourHex(id: number): string {
  return getColour(id)?.hex ?? "transparent";
}
