import { isNil, last } from 'lodash-es';
import type { z } from 'zod';
import type { Frame } from '../types';
import { bowlIsFirstOfFrame } from '../util';

export const handleSpare = (
  frames: Frame[],
  isLastFrame: boolean,
  index: number,
  ctx: z.core.$RefinementCtx<string>
) => {
  const activeOrPreviousFrame = last(frames);
  const isFirstBowlOfFrame = bowlIsFirstOfFrame(isLastFrame, activeOrPreviousFrame);
  if (isFirstBowlOfFrame || isNil(activeOrPreviousFrame)) {
    ctx.addIssue({
      code: 'custom',
      message: "You can't score a spare in the first bowl of a frame",
      path: [index],
    });
    throw new Error();
  }
  if (!isLastFrame) {
    activeOrPreviousFrame.second = {
      pins: 10 - activeOrPreviousFrame.first.pins,
      bonusResult: 'spare',
    };
    return;
  }

  // 3rd bowl of final frame
  // valid sequences for this frame: 9/X, 1/5, X1/
  // invalid sequences for this frame: XX/, X//,

  if (isNil(activeOrPreviousFrame.second)) {
    if (activeOrPreviousFrame.first.bonusResult === 'strike') {
      ctx.addIssue({
        code: 'custom',
        message:
          "You can't score a spare on the second bowl of the final frame if the first bowl was a strike",
        path: [index],
      });
      throw new Error();
    }

    activeOrPreviousFrame.second = {
      pins: 10 - activeOrPreviousFrame.first.pins,
      bonusResult: 'spare',
    };
    return;
  }

  // if the second roll of the final frame is a spare or a strike, then this bowl can't be scored as a spare (it's a strike because there were 10 pins and all of them were hit down)
  if (activeOrPreviousFrame.second.bonusResult !== 'none') {
    ctx.addIssue({
      code: 'custom',
      message:
        "You can't bowl a spare on your last frame bonus role if 2nd bowl was a spare or strike",
      path: [index],
    });
    throw new Error();
  }

  // With all the above logic, the only way to score a spare on the 3rd bowl of the last frame is if the first bowl of the frame was a strike
  // i.e. X1/ is valid. 1// is not. 15/ is not.
  if (activeOrPreviousFrame.first.bonusResult !== 'strike') {
    ctx.addIssue({
      code: 'custom',
      message:
        "You can't bowl a spare on your last frame bonus role if the first frame was not a strike",
      path: [index],
    });
    throw new Error();
  }

  activeOrPreviousFrame.third = {
    pins: 10 - activeOrPreviousFrame.second.pins,
    bonusResult: 'spare',
  };
};
