import { PreferredDouble } from "../types/models";

export interface RouteView {
  finish: number;
  route: string;
  note: string;
  usedPreferredRoute: boolean;
}

interface RouteEntry {
  defaultRoute: string;
  d16Route?: string;
  note: string;
}

const TABLE: Record<number, RouteEntry> = {
  41: { defaultRoute: "9, D16", d16Route: "9, D16", note: "Leaves D16 chain." },
  42: { defaultRoute: "10, D16", d16Route: "10, D16", note: "Simple setup to D16." },
  43: { defaultRoute: "11, D16", d16Route: "11, D16", note: "Clean route to D16." },
  44: { defaultRoute: "12, D16", d16Route: "12, D16", note: "Direct D16 finish." },
  45: { defaultRoute: "13, D16", d16Route: "13, D16", note: "Safe D16 line." },
  46: { defaultRoute: "14, D16", d16Route: "14, D16", note: "Stays in D16 chain." },
  47: { defaultRoute: "15, D16", d16Route: "15, D16", note: "Low-risk route." },
  48: { defaultRoute: "16, D16", d16Route: "16, D16", note: "Textbook D16 route." },
  49: { defaultRoute: "17, D16", d16Route: "17, D16", note: "Keeps preferred double." },
  50: { defaultRoute: "10, D20", d16Route: "18, D16", note: "Both routes avoid awkward leaves." },
  51: { defaultRoute: "19, D16", d16Route: "19, D16", note: "Preferred double route." },
  52: { defaultRoute: "20, D16", d16Route: "20, D16", note: "Straight to D16." },
  53: { defaultRoute: "13, D20", d16Route: "21, D16", note: "Choose stable first dart." },
  54: { defaultRoute: "14, D20", d16Route: "22, D16", note: "Balanced route options." },
  55: { defaultRoute: "15, D20", d16Route: "23, D16", note: "D16-friendly alternative exists." },
  56: { defaultRoute: "16, D20", d16Route: "24, D16", note: "Keeps setup simple." },
  57: { defaultRoute: "17, D20", d16Route: "25, D16", note: "Two practical lines." },
  58: { defaultRoute: "18, D20", d16Route: "26, D16", note: "Preferred double route available." },
  59: { defaultRoute: "19, D20", d16Route: "27, D16", note: "Plan first dart for control." },
  60: { defaultRoute: "20, D20", d16Route: "28, D16", note: "Classic checkout." },
  61: { defaultRoute: "25, D18", d16Route: "29, D16", note: "D16 path if preferred." },
  62: { defaultRoute: "10, D26", d16Route: "30, D16", note: "Route can be tuned to preferred double." },
  63: { defaultRoute: "13, D25", d16Route: "31, D16", note: "D16 chain route available." },
  64: { defaultRoute: "16, D24", d16Route: "32, D16", note: "Preferred double route is clear." },
  65: { defaultRoute: "25, D20", d16Route: "33, D16", note: "Avoids bogey leaves." },
  66: { defaultRoute: "10, D28", d16Route: "34, D16", note: "D16 option keeps rhythm." },
  67: { defaultRoute: "17, D25", d16Route: "35, D16", note: "Pick line that feels repeatable." },
  68: { defaultRoute: "20, D24", d16Route: "36, D16", note: "Preferred route available." },
  69: { defaultRoute: "19, D25", d16Route: "37, D16", note: "Stay composed on first dart." },
  70: { defaultRoute: "18, D26", d16Route: "38, D16", note: "D16-friendly path exists." },
  71: { defaultRoute: "13, D29", d16Route: "39, D16", note: "D16 chain route included." },
  72: { defaultRoute: "16, D28", d16Route: "40, D16", note: "Simple math to preferred double." },
  73: { defaultRoute: "17, D28", d16Route: "41, D16", note: "Route to preferred double available." },
  74: { defaultRoute: "14, D30", d16Route: "42, D16", note: "Two-dart control finish." },
  75: { defaultRoute: "15, D30", d16Route: "43, D16", note: "D16 option if desired." },
  76: { defaultRoute: "20, D28", d16Route: "44, D16", note: "Strong route shape." },
  77: { defaultRoute: "19, D29", d16Route: "45, D16", note: "Leave your comfort double." },
  78: { defaultRoute: "18, D30", d16Route: "46, D16", note: "Preferred double supported." },
  79: { defaultRoute: "19, D30", d16Route: "47, D16", note: "Route avoids panic darts." },
  80: { defaultRoute: "20, D30", d16Route: "48, D16", note: "Popular setup finish." },
  81: { defaultRoute: "19, D31", d16Route: "49, D16", note: "Stable two-dart route." },
  82: { defaultRoute: "14, D34", d16Route: "50, D16", note: "Preferred double alternative included." },
  83: { defaultRoute: "17, D33", d16Route: "51, D16", note: "Route can target D16 chain." },
  84: { defaultRoute: "20, D32", d16Route: "52, D16", note: "Very clean checkout path." },
  85: { defaultRoute: "15, D35", d16Route: "53, D16", note: "Avoids awkward late adjustments." },
  86: { defaultRoute: "18, D34", d16Route: "54, D16", note: "D16 path available." },
  87: { defaultRoute: "17, D35", d16Route: "55, D16", note: "Keep rhythm with chosen line." },
  88: { defaultRoute: "16, D36", d16Route: "56, D16", note: "Preferred chain route exists." },
  89: { defaultRoute: "19, D35", d16Route: "57, D16", note: "Use your strongest first dart." },
  90: { defaultRoute: "18, D36", d16Route: "58, D16", note: "High-confidence route options." },
  91: { defaultRoute: "17, D37", d16Route: "59, D16", note: "Avoids bogey transition." },
  92: { defaultRoute: "20, D36", d16Route: "60, D16", note: "Straightforward two-dart path." },
  93: { defaultRoute: "19, D37", d16Route: "61, D16", note: "Preferred double line available." },
  94: { defaultRoute: "18, D38", d16Route: "62, D16", note: "Route shaped for control." },
  95: { defaultRoute: "19, D38", d16Route: "63, D16", note: "Comfort-double alternative included." },
  96: { defaultRoute: "20, D38", d16Route: "64, D16", note: "Clean setup into D16 route." },
  97: { defaultRoute: "19, D39", d16Route: "65, D16", note: "Keeps route readable." },
  98: { defaultRoute: "18, D40", d16Route: "66, D16", note: "Balanced first dart options." },
  99: { defaultRoute: "19, D40", d16Route: "67, D16", note: "Route avoids rushed finishes." },
  100: { defaultRoute: "20, D40", d16Route: "68, D16", note: "Classic ton finish line." },
  101: { defaultRoute: "T17, D25", note: "Standard two-dart route." },
  104: { defaultRoute: "T18, D25", note: "High-value first dart route." },
  107: { defaultRoute: "T19, 10, D20", note: "Three-dart pressure finish." },
  110: { defaultRoute: "T20, 10, D20", note: "Common pro route." },
  112: { defaultRoute: "T20, 12, D20", note: "Classic percentage finish." },
  116: { defaultRoute: "T20, 16, D20", d16Route: "T20, D16, D16", note: "D16 route available." },
  120: { defaultRoute: "20, T20, D20", note: "Traditional 120 setup." },
  121: { defaultRoute: "T20, 11, D25", note: "Avoids tricky bogey leaves." },
  124: { defaultRoute: "T20, 14, D25", note: "Controlled scoring line." },
  126: { defaultRoute: "T19, 19, D25", note: "Popular route to the bull." },
  127: { defaultRoute: "T20, 17, D25", note: "High-pressure bull finish." },
  130: { defaultRoute: "T20, 20, D25", note: "Traditional bull route." },
  132: { defaultRoute: "T20, T16, D12", note: "Big two-treble line." },
  136: { defaultRoute: "T20, T20, D8", note: "Strong rhythm route." },
  140: { defaultRoute: "T20, T20, D10", note: "Classic ton-forty." },
  141: { defaultRoute: "T20, T19, D12", note: "High-value route." },
  150: { defaultRoute: "T20, T18, D18", note: "Aggressive but clean route." },
  160: { defaultRoute: "T20, T20, D20", note: "Big fish route." },
  161: { defaultRoute: "T20, T17, D25", note: "One of the top outshots." },
  164: { defaultRoute: "T20, T18, D25", note: "Avoids bogey transitions." },
  167: { defaultRoute: "T20, T19, D25", note: "Classic high checkout." },
  170: { defaultRoute: "T20, T20, D25", note: "Maximum checkout route." }
};

export function getRouteForFinish(
  finish: number,
  preferredDouble: PreferredDouble
): RouteView {
  const entry = TABLE[finish];
  if (!entry) {
    return {
      finish,
      route: "No saved route yet",
      note: "Play your highest-percentage setup and avoid bogey numbers.",
      usedPreferredRoute: false
    };
  }

  if (preferredDouble === "D16" && entry.d16Route) {
    return {
      finish,
      route: entry.d16Route,
      note: `Preferred route for D16. ${entry.note}`,
      usedPreferredRoute: true
    };
  }

  return {
    finish,
    route: entry.defaultRoute,
    note: entry.note,
    usedPreferredRoute: false
  };
}
