import { PreferredDouble } from "../types/models";
import { getLegacyRouteView } from "../data/checkoutRoutes";

export interface RouteView {
  finish: number;
  route: string;
  note: string;
  usedPreferredRoute: boolean;
}

export function getRouteForFinish(
  finish: number,
  preferredDouble: PreferredDouble
): RouteView {
  return getLegacyRouteView(finish, preferredDouble);
}
