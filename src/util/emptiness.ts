import { isNil } from 'lodash-es';

export const isNonNil = <T>(x: T): x is Exclude<T, null | undefined> => !isNil(x);
