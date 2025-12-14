export const strongFromEntries = <T extends string | number | symbol, K>(
  object: (readonly [T, K])[] | [T, K][]
): Record<T, K> => {
  return Object.fromEntries(object) as Record<T, K>;
};

export function arrayOfSize<T>(size: number, fillWith: T): T[];
export function arrayOfSize(size: number): null[];
export function arrayOfSize<T>(size: number, fillWith?: T): T[] | null[] {
  if (fillWith !== undefined) {
    return Array<T>(size).fill(fillWith);
  }
  return Array<null>(size).fill(null);
}
