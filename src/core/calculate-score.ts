import { isEmpty } from 'lodash-es';
import type { BowlingSequenceInput } from '@/schema/bowling-sequence/types';
import { arrayOfSize } from '@/util/array';
import { isNonNil } from '@/util/emptiness';
import type { Logger } from '@/util/log';

type BonusModifier = {
  frame: number;
  bonuses: number[];
  result: 'strike' | 'spare';
  status: 'in-progress' | 'closed';
};

const applyBonusesToClosedFrame = (scoresByFrame: number[], closedFrameBonus: BonusModifier) => {
  scoresByFrame[closedFrameBonus.frame] += closedFrameBonus.bonuses.reduce((p, c) => p + c, 0);
};

// tracks bonus modifiers to previously unclosed frames to ensure we don't apply the bonus until the recquisite bowls have happened
const handleInProgressBonusModifiers = (
  bonusModifiers: BonusModifier[],
  scoresByFrame: number[],
  thisBowlScore: number,
  logger?: Logger
) => {
  logger?.info('Checking for any in progress bonus modifiers...');
  bonusModifiers.forEach((modifier) => {
    if (modifier.status === 'closed') {
      return;
    }
    logger?.info('Found in progress bonus modifier...', modifier);
    if (modifier.result === 'strike') {
      if (isEmpty(modifier.bonuses)) {
        modifier.bonuses = [thisBowlScore];
        logger?.info('Updating in progress strike modifier...', modifier);
      } else {
        modifier.bonuses = [...modifier.bonuses, thisBowlScore];
        modifier.status = 'closed';
        applyBonusesToClosedFrame(scoresByFrame, modifier);
        logger?.info('Applied modifier score to prior frame strike and closed...', {
          modifier,
          scoresByFrame,
        });
      }
    }

    // spares are only modified by a single bowl, so we "close" the frame immediately
    if (modifier.result === 'spare') {
      modifier.bonuses = [thisBowlScore];
      modifier.status = 'closed';
      applyBonusesToClosedFrame(scoresByFrame, modifier);
      logger?.info('Applied modifier score to prior frame spare and closed...', {
        modifier,
        scoresByFrame,
      });
    }
  });
};

export const calculateScore = ({ frames }: BowlingSequenceInput, logger?: Logger) => {
  const bonusModifiers: BonusModifier[] = [];
  const scoresByFrame = arrayOfSize(frames.length, 0);
  logger?.info('Calculating score for input frames', { frames });

  frames.forEach((frame, frameIndex) => {
    const isLastFrame = frameIndex === frames.length - 1;
    const bowlsInThisFrame = [frame.first, frame.second, frame.third].filter(isNonNil);

    logger?.info('Processing frame...', { frameIndex, frame, isLastFrame, bowlsInThisFrame });
    bowlsInThisFrame.forEach((bowl) => {
      // apply the number of pins to this frames score
      logger?.info('Adding score from this frame', { frameIndex, score: bowl.pins });
      scoresByFrame[frameIndex] += bowl.pins;
      // apply the number of pins to any previous unclosed frames
      handleInProgressBonusModifiers(bonusModifiers, scoresByFrame, bowl.pins, logger);

      // bonuses are only applied to frames and not individual bowls
      // meaning the last frame can't have any bonuses because there are no remaining frames that could close it
      if (!isLastFrame) {
        if (bowl.bonusResult !== 'none') {
          bonusModifiers.push({
            frame: frameIndex,
            bonuses: [],
            result: bowl.bonusResult,
            status: 'in-progress',
          });
          logger?.info(
            'Processed a score with a bonus result, updating modifiers...',
            bonusModifiers
          );
        }
      }
    });
  });
  logger?.info('Completed score processing', {
    frames,
    scoresByFrame,
    bonusModifiers,
  });
  return scoresByFrame.reduce((p, c) => p + c, 0);
};
