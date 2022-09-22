export const range = (stop: number, start: number = 0) => {
return start < stop ? new Array(stop - start).fill(start).map((el, i) => el + i) : [];
}
