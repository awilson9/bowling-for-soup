import { isNil } from 'lodash-es';
import { isNonNil } from '@/util/emptiness';
import type { Frame } from './types';

export const bowlIsFirstOfFrame = (isLastFrame: boolean, previousFrame?: Frame) => {
  if (isLastFrame) {
    return false;
  }

  if (isNil(previousFrame)) {
    return true;
  }

  if (previousFrame.first.bonusResult === 'strike') {
    return true;
  }

  return isNonNil(previousFrame.second);
};
