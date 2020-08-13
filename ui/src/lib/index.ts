export const secondsToReadableTime = (totalSeconds: number) => {
    let hours = Math.floor(totalSeconds / 3600).toString();
    let minutes = Math.floor((totalSeconds % 3600) / 60).toString();
    let seconds = (totalSeconds % 60).toString();
    hours = hours.length === 1 ? "0" + hours : hours;
    minutes = minutes.length === 1 ? "0" + minutes : minutes;
    seconds = seconds.length === 1 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
};

export enum ClaimStatus {
    LOADING,
    CLAIMABLE,
    UNCLAIMABLE,
}
