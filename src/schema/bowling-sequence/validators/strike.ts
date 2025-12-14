import { isNil, last } from 'lodash-es';
import type { z } from 'zod';
import type { Frame } from '../types';

export const handleStrike = (
  frames: Frame[],
  isLastFrame: boolean,
  index: number,
  ctx: z.core.$RefinementCtx<string>
) => {
  if (!isLastFrame) {
    const previousFrame = last(frames);
    if (previousFrame?.first.bonusResult === 'none' && isNil(previousFrame.second)) {
      ctx.addIssue({
        code: 'custom',
        message: "You can't throw a strike on the second throw of a frame",
        path: [index],
      });
      throw new Error();
    }

    frames.push({
      first: {
        pins: 10,
        bonusResult: 'strike',
      },
    });
    return;
  }

  const activeFrame = last(frames)!;
  if (isNil(activeFrame.second)) {
    activeFrame.second = {
      pins: 10,
      bonusResult: 'strike',
    };
    return;
  }

  if (isNil(activeFrame.third)) {
    if (isNil(activeFrame.second)) {
      throw new Error('Unexpected second bowl of frame null when processing third bowl');
    }

    // handles invalid final frame sequence like 11X
    if (activeFrame.first.bonusResult === 'none' && activeFrame.second.bonusResult === 'none') {
      ctx.addIssue({
        code: 'custom',
        message:
          "You're not allowed a third bowl of the final frame if you didn't previously bowl a strike or spare",
        path: [index],
      });
      throw new Error();
    }

    // handles invalid frame sequence like X1X
    if (activeFrame.first.bonusResult === 'strike' && activeFrame.second.bonusResult !== 'strike') {
      ctx.addIssue({
        code: 'custom',
        message:
          'If you bowl a strike on the first bowl of the final frame, you can only bowl a strike on the third bowl if the second bowl was also a strike',
        path: [index],
      });
      throw Error();
    }

    // handles invalid frame sequence like 15X
    if (activeFrame.first.bonusResult === 'none' && activeFrame.second.bonusResult !== 'spare') {
      ctx.addIssue({
        code: 'custom',
        message:
          "You can't bowl a third time in the final frame unless a strike or spare has been bowled already",
        path: [index],
      });
      throw Error();
    }

    // Allowed sequences that include a third bowl strike on the final frame:
    // XXX
    // <number>/X

    activeFrame.third = {
      pins: 10,
      bonusResult: 'strike',
    };
  }
};
