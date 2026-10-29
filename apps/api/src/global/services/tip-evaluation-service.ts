const EXACT_DIFFERENCE_POINTS = 2;
const SHARED_EXACT_DIFFERENCE_POINTS = 1;
const CLOSEST_POINTS = 1;
const SHARED_CLOSEST_POINTS = 0.5;

type ScoredTip = {
  id: string;
  tipHost: number;
  tipGuest: number;
};

export abstract class TipEvaluationService {
  // scores all tips of one finished game against each other:
  // - exact goal difference: 2 points, 1 point each if several players hit it
  // - nobody hit the difference: the player(s) whose difference is closest get
  //   1 point, 0.5 points each if several players share the closest distance
  // returns the points per tip id, tips without points are mapped to 0
  static scoreGameTips({
    hostPoints,
    guestPoints,
    tips,
  }: {
    hostPoints: number;
    guestPoints: number;
    tips: ScoredTip[];
  }): Map<string, number> {
    const resultDifference = hostPoints - guestPoints;
    const distances = tips.map((tip) => ({
      id: tip.id,
      distance: Math.abs(tip.tipHost - tip.tipGuest - resultDifference),
    }));

    const scores = new Map(tips.map((tip) => [tip.id, 0]));
    if (distances.length === 0) return scores;

    const closestDistance = Math.min(...distances.map((d) => d.distance));
    const winners = distances.filter((d) => d.distance === closestDistance);
    const isShared = winners.length > 1;

    const points =
      closestDistance === 0
        ? isShared
          ? SHARED_EXACT_DIFFERENCE_POINTS
          : EXACT_DIFFERENCE_POINTS
        : isShared
          ? SHARED_CLOSEST_POINTS
          : CLOSEST_POINTS;

    for (const winner of winners) {
      scores.set(winner.id, points);
    }

    return scores;
  }
}
