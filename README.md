# 10 pin bowling calculation

## Overview

Provides a cli (implemented with
[commander](https://github.com/tj/commander.js)) and web server (implemented
with [fastify]()) to produces the total score for the game given a sequence of
rolls for one line of American Ten-Pin Bowling.

### Details

#### Project setup

The dependencies of this project depend on version 20+ of node (specified in
[`.nvmrc`](.nvmrc)). It is recommended that you use `nvm` to manage the
installed version of node
([installation instructions here](https://github.com/nvm-sh/nvm)).

Once `nvm` is installed, you can simply run the following to ensure the correct
version of node is used. Otherwise, you must manage your node install yourself
and the project will not work on versions 19 and under.

```
nvm install
nvm use
```

This project also uses `pnpm` as it's package manager
([installation instructions here](https://pnpm.io/installation)). Using a
different package manager may result in unexpected behavior.

Ensure dependencies are installed with

```
pnpm install
```

### CLI

#### Setup

Ensure repository setup instructions re: `nvm` and `pnpm` have been followed,
then run the following to build the cli project and link to your shell.

```
pnpm cli:setup
```

#### Usage

```
Usage: bowling-calc [options] <sequence>

Given a sequence of rolls for one line of American Ten-Pin Bowling, produces the
total score for the game

Arguments:
  sequence    The sequence of scores in a bowling game, marking X for a strike, /
              for a spare, - for no pins, otherwise [1-9] indicating the number of
              pins knocked down

Options:
  --json      Outputs the score as a json object with the score key set as
              "score".
              If this option is not passed, then score is printed to stdout.
  --debug     If specified, detailed information will be logged to your console
              during execution
  -h, --help  display help for command
```

Note: `commander` interprets a string that starts with 2 gutter balls `--` as a
command line option. To test the cli with a sequence that starts with 2 gutter
balls, simply execute like so instead:

```
bowlingcalc -- --<restofsequence>
```

### HTTP service

#### Setup

As with the cli, ensure repository setup instructions re: `nvm` and `pnpm` have
been followed. Then, run the following to build and run the server in production
mode

```
pnpm server:run
```

Additionally, you can run the server in dev mode, which will hot reload the
server changes when you make modifications to any of the source code.

```
pnpm server:dev
```

API spec:

```
POST /calculate
Content-Type: json
Data: { "sequence": "9-9-9-9-9-9-9-9-9-9-"}

Content-Type: json
Data: { "score": "90"}
```

### 10 pin bowling rules reference

- Each game, or “line” of bowling, includes **ten turns**, or “frames” for the
  bowler.
- In **each frame**, the bowler gets up to **two tries** to knock down all the
  pins.
- If in two tries, he fails to knock them all down, **the score for that frame
  is the total number of pins knocked down** in his two tries.
- If in two tries he knocks them all down, this is called a **“spare”** and his
  score for the frame **is ten plus the number of pins knocked down on his next
  throw** (in his next turn).
- If on his first try in the frame he knocks down all the pins, this is called a
  **“strike”**. His turn is over, and his score for the frame **is ten plus the
  simple total of the pins knocked down in his next two rolls**.
- **If he gets a spare or strike in the last (tenth) frame, the bowler gets to
  throw one or two more bonus balls, respectively**. These bonus throws are
  taken as part of the same turn. If the bonus throws knock down all the pins,
  the process does not repeat: the bonus throws are only used to calculate the
  score of the final frame.
- The game score is the total of all frame scores.

The input is a scorecard from a finished bowling game, where “X” stands for a
strike, “-” for no pins bowled, and “/” means a spare. Otherwise figures 1-9
indicate how many pins were knocked down in that throw.
