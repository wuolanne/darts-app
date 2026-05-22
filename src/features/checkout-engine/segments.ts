import { isValidDartTarget, normalizeDartTarget, scoreOfTarget } from "../../utils/checkoutLibrary";
import { SegmentCode } from "./types";

export type Hit = {
  code: SegmentCode;
  value: number;
  isFinish: boolean;
};

function buildHits(): Hit[] {
  const hits: Hit[] = [];
  for (let value = 1; value <= 20; value += 1) {
    hits.push({ code: `S${value}`, value, isFinish: false });
  }
  hits.push({ code: "25", value: 25, isFinish: false });
  for (let value = 1; value <= 20; value += 1) {
    hits.push({ code: `D${value}`, value: value * 2, isFinish: true });
  }
  hits.push({ code: "Bull", value: 50, isFinish: true });
  for (let value = 1; value <= 20; value += 1) {
    hits.push({ code: `T${value}`, value: value * 3, isFinish: false });
  }
  return hits;
}

export const ALL_HITS = buildHits();

export function normalizeSegment(target: string): SegmentCode {
  return normalizeDartTarget(target);
}

export function getHit(target: string): Hit | null {
  const normalized = normalizeSegment(target);
  if (!isValidDartTarget(normalized)) return null;
  const value = scoreOfTarget(normalized);
  if (value === null) return null;
  return {
    code: normalized,
    value,
    isFinish: normalized === "Bull" || normalized.startsWith("D")
  };
}

export function isFinishingSegment(target: string): boolean {
  const hit = getHit(target);
  return hit?.isFinish ?? false;
}

