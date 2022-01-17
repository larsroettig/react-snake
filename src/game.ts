import { createMachine, assign, EventObject } from "xstate";

interface GameItem {
  x: number;
  y: number;
}

export interface GameContext {
  score: number;
  boardSize: number;
  snakeDirection: number;
  snake: GameItem[];
  food: GameItem;
}

type GameEvent = { type: "KEYDOWN" } | { type: "TICK" } | { type: "ERROR" };

enum SnakeDirection {
  UP = 90,
  RIGHT = 180,
  DOWN = 270,
  LEFT = 360,
}

interface SnakePosition {
  x: number;
  y: number;
}

const calcSnakeDirection = (head: SnakePosition, body: SnakePosition) => {
  if (head.x !== body.x) {
    return head.x > body.x ? SnakeDirection.RIGHT : SnakeDirection.LEFT;
  }
  return head.y > body.y ? SnakeDirection.DOWN : SnakeDirection.UP;
};

const rollDice = (min: number, max: number) => {
  return min - 1 + Math.ceil(Math.random() * (max - min + 1));
};

const isValidMove = (context: GameContext) => {
  if (context.snakeDirection === SnakeDirection.RIGHT) {
    if (context.snake[0].x >= 9) {
      return false;
    }
  }

  if (context.snakeDirection === SnakeDirection.LEFT) {
    if (context.snake[0].x <= 0) {
      return false;
    }
  }

  if (context.snakeDirection === SnakeDirection.UP) {
    if (context.snake[0].y <= 0) {
      return false;
    }
  }

  if (context.snakeDirection === SnakeDirection.DOWN) {
    if (context.snake[0].y >= 9) {
      return false;
    }
  }

  return true;
};

export const gameMachine = createMachine<GameContext>(
  {
    id: "game",
    initial: "idle",
    context: {
      snakeDirection: SnakeDirection.RIGHT,
      score: 0,
      boardSize: 10,
      snake: [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
      ],
      food: { x: -1, y: -1 },
    },
    states: {
      idle: {
        on: {
          TICK: {},
          KEYDOWN: {
            actions: ["dropNewFood"],
            target: "running",
          },
        },
      },
      running: {
        on: {
          KEYDOWN: [
            {
              actions: ["changeSnakeDirection"],
              cond: "isValidDirection",
            },
          ],
          TICK: [
            {
              cond: "isEaten",
              actions: ["foodEat", "dropNewFood", "moveSnake"],
            },
            {
              actions: ["moveSnake"],
              cond: "isValidMove",
            },
            {
              target: ["gameOver"],
            },
          ],
        },
      },
      gameOver: {
        on: {
          TICK: {},
          KEYDOWN: {
            actions: ["restGame", "dropNewFood"],
            target: "running",
          },
        },
      },
    },
  },
  {
    actions: {
      restGame: (ctx: GameContext, ...rest) => {
        return {
          score: 0,
          snake: [
            { x: 2, y: 0 },
            { x: 1, y: 0 },
          ],
          SnakeDirection: SnakeDirection.RIGHT,
        };
      },
      changeSnakeDirection: assign({
        snakeDirection: (ctx: GameContext, event) => {
          // @ts-ignore: props don't exist
          const keyCode: string = event.handleKeyPress ?? "";

          switch (keyCode) {
            case "ArrowUp":
              ctx.snakeDirection = SnakeDirection.UP;
              break;
            case "ArrowLeft":
              ctx.snakeDirection = SnakeDirection.LEFT;
              break;
            case "ArrowDown":
              ctx.snakeDirection = SnakeDirection.DOWN;
              break;
            case "ArrowRight":
              ctx.snakeDirection = SnakeDirection.RIGHT;
              break;
          }

          return ctx.snakeDirection;
        },
      }),
      moveSnake: assign({
        snake: (ctx: GameContext, event) => {
          // remove tail item and add new head item
          ctx.snake.pop();

          const { y, x } = ctx.snake[0];

          if (ctx.snakeDirection === SnakeDirection.RIGHT) {
            ctx.snake.unshift({ x: x + 1, y });
          }

          if (ctx.snakeDirection === SnakeDirection.LEFT) {
            ctx.snake.unshift({ x: x - 1, y });
          }

          if (ctx.snakeDirection === SnakeDirection.UP) {
            ctx.snake.unshift({ x: x, y: y - 1 });
          }

          if (ctx.snakeDirection === SnakeDirection.DOWN) {
            ctx.snake.unshift({ x: x, y: y + 1 });
          }

          return ctx.snake;
        },
      }),
      foodEat: assign({
        score: (ctx: GameContext, event) => {
          return ctx.score + 1;
        },
        snake: (ctx: GameContext, event) => {
          ctx.snake.unshift({ x: ctx.food.x, y: ctx.food.y });
          return ctx.snake;
        },
      }),
      dropNewFood: assign({
        food: (ctx: GameContext, event) => {
          return { x: rollDice(1, 9), y: rollDice(1, 9) };
        },
      }),
    },
    guards: {
      isValidDirection: (context, event: EventObject) => {
        // @ts-ignore: props don't exist
        const keyCode: string = event.handleKeyPress ?? "";
        const snakeHead = context.snake[0];
        const snakeBody = context.snake[1];
        const snakeDirection = calcSnakeDirection(snakeHead, snakeBody);

        if (keyCode === "ArrowUp" && snakeDirection === SnakeDirection.DOWN) {
          return false;
        }
        if (keyCode === "ArrowDown" && snakeDirection === SnakeDirection.UP) {
          return false;
        }
        if (
          keyCode === "ArrowLeft" &&
          snakeDirection === SnakeDirection.RIGHT
        ) {
          return false;
        }
        if (
          keyCode === "ArrowRight" &&
          snakeDirection === SnakeDirection.LEFT
        ) {
          return false;
        }
        return true;
      },
      isValidMove: (context, event: EventObject) => isValidMove(context),
      isEaten: (context, event: EventObject) => {
        if (!isValidMove(context)) {
          return false;
        }

        const { y, x } = context.snake[0];

        if (x === context.food.x && y === context.food.y) {
          return true;
        }
        return false;
      },
    },
  }
);
