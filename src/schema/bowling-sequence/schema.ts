import { isNil, last } from 'lodash-es';
import { z } from 'zod';
import { isNonNil } from '@/util/emptiness';
import type { Frame } from './types';
import { handleNormal } from './validators/normal';
import { handleSpare } from './validators/spare';
import { handleStrike } from './validators/strike';

export const SequenceCharacter = z
  .enum(['X', '-', '/'], { message: 'Expected X, -, /, or a digit 1-9' })
  .or(z.coerce.number().min(1).max(9).int({ message: 'Number must be between 1-9' }));

export const BowlingSequenceInputSchema = z
  .string()
  .superRefine((s, ctx) => {
    [...s].forEach((char, index) => {
      const result = SequenceCharacter.safeParse(char);
      if (!result.success) {
        result.error.issues.forEach((i) =>
          ctx.addIssue({
            code: 'custom',
            message: i.message,
            path: [index],
          })
        );
      }
    });
  })
  .transform((s, ctx) => {
    const frames: Frame[] = [];
    try {
      const inputs = [...s].map((char, index) => {
        const result = SequenceCharacter.safeParse(char);
        if (!result.success) {
          result.error.issues.forEach((i) =>
            ctx.addIssue({
              code: 'custom',
              message: i.message,
              path: [index],
            })
          );
          throw new Error();
        }
        return result.data;
      });

      inputs.forEach((val, index) => {
        const isLastFrame = frames.length === 10;

        if (isLastFrame) {
          const lastFrame = last(frames)!;
          if (isNonNil(lastFrame.third)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Too many bowls in sequence',
              path: [index],
            });
            throw Error();
          }
        }

        if (val === 'X') {
          return handleStrike(frames, isLastFrame, index, ctx);
        }

        if (val === '/') {
          return handleSpare(frames, isLastFrame, index, ctx);
        }

        return handleNormal(frames, isLastFrame, val === '-' ? 0 : val, index, ctx);
      });
    } catch (_e) {
      return z.NEVER;
    }

    const lastFrame = last(frames);
    if (lastFrame?.first.bonusResult === 'strike' && isNil(lastFrame.second)) {
      ctx.addIssue({
        code: 'custom',
        message: "You bowled a strike in the last frame but didn't throw a bonus bowl",
      });
      return z.NEVER;
    }
    if (lastFrame?.second?.bonusResult === 'strike' && isNil(lastFrame.third)) {
      ctx.addIssue({
        code: 'custom',
        message: "You bowled a strike in the last frame but didn't throw a bonus bowl",
      });
    }

    if (frames.length !== 10) {
      ctx.addIssue({
        code: 'custom',
        message: `Not enough frames were returned from you input sequence. Received: ${frames.length}`,
      });
      return z.NEVER;
    }

    // additional validation on final frame is required to ensure all bonus rolls were taken if applicable
    // (whether the rolls were allowed to be taken or that the bowl was a legitimate score is handled inside the specific score type validators)
    const finalFrame = last(frames)!;
    if (isNil(finalFrame.second)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The final frame is missing its second bowl',
      });
      return z.NEVER;
    }
    const shouldHaveThirdBowl = (() => {
      if (finalFrame.first.bonusResult === 'strike') {
        return true;
      }
      if (finalFrame.second.bonusResult === 'strike') {
        return true;
      }
      if (finalFrame.second.bonusResult === 'spare') {
        return true;
      }
      return false;
    })();

    if (shouldHaveThirdBowl && isNil(finalFrame.third)) {
      ctx.addIssue({
        code: 'custom',
        message: 'The final frame is missing its third bowl',
      });
      return z.NEVER;
    }

    return { frames, totalBowls: s.length };
  });
