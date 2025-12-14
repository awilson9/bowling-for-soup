import type z from 'zod';
import type { BowlingSequenceInputSchema } from './schema';

export type BonusResult = 'spare' | 'strike' | 'none';
export type FrameScore = {
  pins: number;
  bonusResult: BonusResult;
};

export type Frame = { first: FrameScore; second?: FrameScore; third?: FrameScore };

export type BowlingSequenceInput = z.infer<typeof BowlingSequenceInputSchema>;
