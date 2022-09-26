export const range = (stop: number, start: number = 0) => {
return start < stop ? new Array(stop + 1 - start).fill(start).map((el, i) => el + i) : [0];
}
