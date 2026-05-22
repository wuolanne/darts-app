import { PreferredDouble } from "../../types/models";

export type SegmentCode = string;

export type CheckoutStatus = "checked-out" | "bust" | "impossible" | "no-finish";

export interface ThrowStepInput {
  intended?: SegmentCode;
  actual: SegmentCode;
}

export interface EvaluatedThrowStep {
  intended?: SegmentCode;
  actual: SegmentCode;
  remainingBefore: number;
  remainingAfter: number;
  dartsLeftAfter: number;
  bust: boolean;
  stillFinishable: boolean;
}

export interface RankedRoute {
  path: SegmentCode[];
  quality: number;
  routeClass: "optimal" | "proAlternative" | "highQualityCustom" | "validCustom" | "awkwardCustom";
  explanation: string;
}

export interface CheckoutEvaluationResult {
  status: CheckoutStatus;
  isValidCheckout: boolean;
  routeQuality: number;
  xp: 0 | 1 | 2 | 3;
  routeClass?: RankedRoute["routeClass"];
  userRoute: SegmentCode[];
  optimalRoute: SegmentCode[];
  alternatives: SegmentCode[][];
  allValidRoutes: SegmentCode[][];
  steps: EvaluatedThrowStep[];
  explanation: string;
  improvement?: string;
}

export interface EvaluateCheckoutParams {
  startScore: number;
  dartsAvailable: number;
  throws: ThrowStepInput[];
  preferredDouble: PreferredDouble;
}

