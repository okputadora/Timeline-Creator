// function getSpan(zoomLevel: number,): [number, number] {
//   if (zoomLevel >= 1 && zoomLevel <= x) return [10000, 1000];
//   if (zoomLevel >= x + 1 && zoomLevel <= 2 * x) return [5000, 500];
//   if (zoomLevel >= 2 * x + 1 && zoomLevel <= 3 * x) return [2500, 250];
//   if (zoomLevel >= 3 * x + 1 && zoomLevel <= 4 * x) return [1000, 100];
//   if (zoomLevel >= 4 * x + 1 && zoomLevel <= 5 * x) return [500, 50];
//   if (zoomLevel >= 5 * x + 1 && zoomLevel <= 6 * x) return [250, 25];
//   if (zoomLevel >= 6 * x + 1 && zoomLevel <= 7 * x) return [100, 10];
//   if (zoomLevel >= 7 * x + 1 && zoomLevel <= 8 * x) return [50, 5];
//   if (zoomLevel >= 8 * x + 1 && zoomLevel <= 9 * x) return [20, 2];
//   if (zoomLevel >= 9 * x + 1) return [10, 1];
//   // if (zoomLevel >= 7 && zoomLevel <= 9) return [1000, 100];
//   return [10000, 1000]; // fallback for other values
// }
const x = 5; // local levels per zoom block
export function getSpan(zoomLevel: number): [number, number] {
  const baseSpan = 10000;
  const baseIncrement = 1000;
  const block = Math.floor((zoomLevel - 1) / x); // which block of x levels
  const span = baseSpan / Math.pow(2, block);
  const increment = baseIncrement / Math.pow(2, block);
  return [span, increment];
}