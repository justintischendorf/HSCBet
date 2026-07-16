export abstract class TipEvaluationService {
  static isWinnerCorrect({
    tipHost,
    tipGuest,
    hostPoints,
    guestPoints,
  }: {
    tipHost: number;
    tipGuest: number;
    hostPoints: number;
    guestPoints: number;
  }): boolean {
    return (
      Math.sign(hostPoints - guestPoints) === Math.sign(tipHost - tipGuest)
    );
  }

  static isExactResult({
    tipHost,
    tipGuest,
    hostPoints,
    guestPoints,
  }: {
    tipHost: number;
    tipGuest: number;
    hostPoints: number;
    guestPoints: number;
  }): boolean {
    return tipHost === hostPoints && tipGuest === guestPoints;
  }
}
