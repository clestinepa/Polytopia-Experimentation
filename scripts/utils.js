/**
 *
 * @param {Number} min
 * @param {Number} max
 * @returns random int between min and max
 */
export function randomInt(min, max) {
  let rand = min + Math.random() * (max - min);
  return Math.floor(rand);
}
