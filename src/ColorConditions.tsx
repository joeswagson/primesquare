// Each entry maps a predicate (index: number) => boolean to a CSS color string.
// Evaluated in order — first match wins. Falls back to `defaultColor`.

export interface ColorCondition {
  label: string;
  match: (index: number) => boolean;
  color: string;
}

var primes:number[] = [];
var differences:number[] = [];
export function applyTables(ndiff:number[], nprimes:number[]) {
    differences = ndiff ?? differences;
    primes = nprimes ?? primes;
};

export const colorConditions: ColorCondition[] = [
  {
    label: 'Perfect squares',
    match: (index) => Number.isInteger(Math.sqrt(index + 1)),
    color: 'rgba(255, 106, 0, 1)',
  },
  {
    label: 'Perfect cubes',
    match: (index) => Number.isInteger(Math.cbrt(index + 1)),
    color: 'rgba(0, 180, 255, 1)',
  },
  {
    label: 'Twin primes',
    match: (index) => differences[index] === 2,
    color: '#FF5252', // Bright red-orange
  },
  {
    label: 'Cousin primes',
    match: (index) => differences[index] === 4,
    color: '#8D54A1', // Purple for cousin primes
  },
  {
    label: 'n-3 Palindrome',
    match: (index) => index,
    color: 'rgba(158, 158, 158, 1)', // Gray
  }
];

export const defaultColor = '';
export function resolveColor(index: number): string {
  const match = colorConditions.find((c) => c.match(index));
  return match ? match.color : defaultColor;
}