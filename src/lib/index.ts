export const secondsToRedableTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds % 3600);
  const minutes = Math.floor(totalSeconds % 60);
  const seconds = totalSeconds - minutes * 60;

  return `${hours}:${minutes}:${seconds}`;
};

export enum ClaimStatus {
  LOADING,
  CLAIMABLE,
  UNCLAIMABLE,
}
