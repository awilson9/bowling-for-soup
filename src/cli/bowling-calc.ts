import chalk from 'chalk';
import { program } from 'commander';
import z from 'zod';
import { calculateScore } from '@/core/calculate-score';
import { BowlingSequenceInputSchema } from '@/schema/bowling-sequence/schema';
import type { Logger } from '@/util/log';

const DebugLogger: Logger = {
  info: (message, details) => console.log(chalk.blue(message, JSON.stringify(details))),
  warn: (message, details) => console.log(chalk.yellow(message, JSON.stringify(details))),
  error: (message, error, details) =>
    console.log(chalk.red(message, error, JSON.stringify(details))),
};

program
  .argument(
    '<sequence>',
    'The sequence of scores in a bowling game, marking X for a strike, / for a spare, - for no pins, otherwise [1-9] indicating the number of pins knocked down'
  )
  .option(
    '--json',
    'Outputs the score as a json object with the score key set as "score". \nIf this option is not passed, then score is printed to stdout.'
  )
  .option(
    '--debug',
    'If specified, detailed information will be logged to your console during execution'
  )
  .description(
    'Given a sequence of rolls for one line of American Ten-Pin Bowling, produces the total score for the game'
  )
  .action((sequence, { json, debug }: { json?: boolean; debug?: boolean }) => {
    const parseResult = BowlingSequenceInputSchema.safeParse(sequence);
    if (!parseResult.success) {
      const error = z.prettifyError(parseResult.error);
      console.error(json ? JSON.stringify({ error }, null, 2) : chalk.red(error));
      process.exit(1);
    }

    const score = calculateScore(parseResult.data, debug ? DebugLogger : undefined);
    console.log(json ? JSON.stringify({ score }, null, 2) : chalk.green(score));
  });

program.parse();
