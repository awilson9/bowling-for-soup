import { isNil, last } from 'lodash-es';
import type { z } from 'zod';
import type { Frame } from '../types';
import { bowlIsFirstOfFrame } from '../util';

const validateNormalBowlPinCount = (
  pinsFromThisBowl: number,
  pinsFromPreviousBowl: number,
  index: number,
  ctx: z.core.$RefinementCtx<string>
) => {
  if (pinsFromThisBowl + pinsFromPreviousBowl > 10) {
    ctx.addIssue({
      code: 'custom',
      message: "Invalid input, you can't knock down more than 10 pins in a normal frame",
      path: [index],
    });
    throw new Error();
  }

  if (pinsFromThisBowl + pinsFromPreviousBowl === 10) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Invalid input, this bowl knocked down the remaining pins but was not input as a spare"',
      path: [index],
    });
    throw new Error();
  }
};

export const handleNormal = (
  frames: Frame[],
  isLastFrame: boolean,
  pins: number,
  index: number,
  ctx: z.core.$RefinementCtx<string>
) => {
  const activeOrPreviousFrame = last(frames);
  const isFirstBowlOfFrame = bowlIsFirstOfFrame(isLastFrame, activeOrPreviousFrame);
  if (isFirstBowlOfFrame) {
    frames.push({
      first: {
        pins,
        bonusResult: 'none',
      },
    });
    return;
  }
  if (isNil(activeOrPreviousFrame)) {
    throw new Error('Unreachable');
  }

  if (!isLastFrame) {
    validateNormalBowlPinCount(pins, activeOrPreviousFrame.first.pins, index, ctx);

    activeOrPreviousFrame.second = {
      pins,
      bonusResult: 'none',
    };
    return;
  }

  // case for 2nd bowl of final frame
  if (isNil(activeOrPreviousFrame.second)) {
    // only validate pin numbers if the first bowl was not a strike
    if (activeOrPreviousFrame.first.bonusResult === 'none') {
      validateNormalBowlPinCount(pins, activeOrPreviousFrame.first.pins, index, ctx);
    }
    activeOrPreviousFrame.second = {
      pins,
      bonusResult: 'none',
    };
    return;
  }

  // case for 3rd bowl of final frame
  if (
    activeOrPreviousFrame.first.bonusResult === 'none' &&
    activeOrPreviousFrame.second.bonusResult === 'none'
  ) {
    ctx.addIssue({
      code: 'custom',
      message: "You don't a third bowl on the final frame without a prior spare or strike",
      path: [index],
    });
    throw new Error();
  }

  if (
    activeOrPreviousFrame.first.bonusResult === 'strike' &&
    activeOrPreviousFrame.second.bonusResult === 'none'
  ) {
    // we only need to validate pin counts if the first bowl was a strike and the second bowl was not
    // otherwise we're in a sequence where the second bowl was a strike or a spare, which means the 3rd bowl is isolated
    validateNormalBowlPinCount(pins, activeOrPreviousFrame.second.pins, index, ctx);
  }

  activeOrPreviousFrame.third = {
    pins,
    bonusResult: 'none',
  };
};
