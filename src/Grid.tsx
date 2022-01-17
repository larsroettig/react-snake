import * as React from "react";
import { useMachine } from "@xstate/react";

import { useKeyPress } from "./useKeyPress";
import { useInterval } from "./useInterval";
import { StateMachine } from "xstate";
import { GameContext } from "./game";

export interface IGridProps {
  rowCount: number;
  cellCount: number;
  gameMachine: StateMachine<GameContext, any, any, any>;
}

export function Grid({
  rowCount = 10,
  cellCount = 10,
  gameMachine,
}: IGridProps) {
  const [gameContext, send] = useMachine(gameMachine, { devTools: true });
  const [grid, setGrid] = React.useState<number[][]>([]);
  const [tickTime, setTickTime] = React.useState(400);

  const handleKeyPress = useKeyPress([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
  ]);

  useInterval(() => {
    if (gameContext.matches("running")) {
      send("TICK");
    }
  }, tickTime);

  React.useEffect(() => {
    const tmpGrid = [];
    for (let index = 0; index < rowCount; index++) {
      const cells = [];
      for (let index = 0; index < cellCount; index++) {
        cells.push(index);
      }

      tmpGrid.push(cells);
    }

    setGrid(tmpGrid);
  }, []);

  React.useEffect(() => {
    if (handleKeyPress !== false) {
      send("KEYDOWN", { handleKeyPress });
    }
  }, [handleKeyPress]);

  const getCellContent = (x: number, y: number) => {
    const isSnake = gameContext.context.snake.some(
      (cell: { x: number; y: number }) => cell.x === x && cell.y === y
    );

    const isHead =
      gameContext.context.snake[0].x === x &&
      gameContext.context.snake[0].y === y;

    if (isSnake) {
      if (isHead) {
        const snakeClass = `snake-head snake-head-${gameContext.context.snakeDirection}`;
        return (
          <span className="snake">
            <div className={snakeClass} />
          </span>
        );
      }

      return (
        <span className="snake">
          <div className="snake-body" />
        </span>
      );
    }

    if (gameContext.context.food.x === x && gameContext.context.food.y === y) {
      return <span className="food">🍎</span>;
    }
    return "";
  };

  return grid ? (
    <div className="game">
      <div className="Controls">
        <h1>Score {gameContext.context.score}</h1>
        <span className="speedControl">
          <label>
            <b>Speed:</b> (🐇/🐢)
          </label>
          <input
            type="range"
            min="100"
            max="1000"
            value={tickTime}
            onChange={(e) => setTickTime(Number(e.target.value))}
          />
        </span>
      </div>
      {gameContext.matches("idle") && (
        <div className="overlay">Press a Arrow(↔️↕️) key to start</div>
      )}

      {gameContext.matches("gameOver") && (
        <div className="overlay">Press a Arrow(↔️↕️) key to restart</div>
      )}

      <div className="grid">
        {grid.map((row, rowIndex) => {
          return (
            <div className="row" key={rowIndex}>
              {row.map((cell, cellIndex) => {
                let classNameCell = "";

                if (rowIndex % 2) {
                  classNameCell = cellIndex % 2 ? "cell odd" : "cell even";
                } else {
                  classNameCell = cellIndex % 2 ? "cell even" : "cell odd";
                }
                return (
                  <div className={classNameCell} key={cellIndex}>
                    {getCellContent(rowIndex, cellIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div>Loading</div>
  );
}
