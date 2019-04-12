import React, { useReducer } from "react";
import "./minefield.css";

window.oncontextmenu = function() {
  return false;
};

function init(props) {
  let cells = getCells(props.width, props.height);
  return {
    bombRatio: props.ratio,
    cells,
    hasBombs: false
  };
}
function reducer(state, action) {
  let cells;
  switch (action.type) {
    case "setup":
      let bombs = getBombSpots(
        state.cells[0].length,
        state.cells.length,
        state.bombRatio,
        action.cell
      );
      cells = setupCells(state.cells, bombs);
      cells = openCell(cells, action.cell.x, action.cell.y);
      return {
        cells,
        bombRatio: state.bombRatio,
        hasBombs: true
      };
    case "open":
      cells = openCell(state.cells, action.cell.x, action.cell.y);
      return {
        cells,
        bombRatio: state.bombRatio,
        hasBombs: state.hasBombs
      };
    case "mark":
      if (state.cells[action.cell.x][action.cell.y].status === "") {
        state.cells[action.cell.x][action.cell.y].status = "mark";
      }
      return {
        cells: state.cells,
        bombRatio: state.bombRatio,
        hasBombs: state.hasBombs
      };
    case "unmark":
      if (state.cells[action.cell.x][action.cell.y].status === "mark") {
        state.cells[action.cell.x][action.cell.y].status = "";
      }
      return {
        cells: state.cells,
        bombRatio: state.bombRatio,
        hasBombs: state.hasBombs
      };
    default:
      throw new Error();
  }
}
function openCell(cells, x, y) {
  if (cells[x][y].status === "") {
    cells[x][y].status = "open";
    if (cells[x][y].content === "") {
      let adjacents = getAdjacents(x, y, cells.length, cells[x].length);
      for (let i = 0; i < adjacents.length; i++) {
        cells = openCell(cells, adjacents[i].x, adjacents[i].y);
      }
    }
  }
  return cells;
}
export default function Minefield(props) {
  let minefieldStyle = {
    display: "grid",
    width: "1000px",
    height: "500px",
    gridTemplateColumns: "repeat(" + props.width + ", 1fr)",
    gridTemplateRows: "repeat(" + props.height + ", 1fr)",
    gridGap: "4px"
  };
  let [state, dispatch] = useReducer(reducer, props, init);
  let cellElements = getCellElements(state, dispatch);
  return <div style={minefieldStyle}>{cellElements}</div>;
}

function getBombSpots(width, height, ratio, cell) {
  let spots = [],
    numBombs = width * height * ratio;
  for (let i = 0; i < numBombs; i++) {
    let x = Math.floor(Math.random() * height),
      y = Math.floor(Math.random() * width);
    while (cell.x === x && cell.y === y) {
      x = Math.floor(Math.random() * height);
      y = Math.floor(Math.random() * width);
    }
    spots[i] = {
      x,
      y
    };
  }
  return spots;
}

function getCells(width, height) {
  let cells = [];
  for (let x = 0; x < height; x++) {
    cells[x] = [];
    for (let y = 0; y < width; y++) {
      cells[x][y] = {
        isBomb: false,
        content: "",
        status: ""
      };
    }
  }
  return cells;
}

function setupCells(cells, bombs) {
  for (let i = 0; i < bombs.length; i++) {
    cells[bombs[i].x][bombs[i].y].isBomb = true;
  }
  for (let x = 0; x < cells.length; x++) {
    for (let y = 0; y < cells[x].length; y++) {
      if (!cells[x][y].isBomb) {
        let adjacents = getAdjacents(x, y, cells.length, cells[x].length);
        let number = 0;
        for (let i = 0; i < adjacents.length; i++) {
          if (cells[adjacents[i].x][adjacents[i].y].isBomb) {
            number++;
          }
        }
        if (number > 0) {
          cells[x][y].content = `${number}`;
        }
      } else {
        cells[x][y].content = "X";
      }
    }
  }
  return cells;
}
function getCellElements(state, dispatch) {
  let elements = [];
  for (let x = 0; x < state.cells.length; x++) {
    for (let y = 0; y < state.cells[x].length; y++) {
      let key = x * state.cells[x].length + y;
      let handleLeftClick;
      if (state.hasBombs) {
        handleLeftClick = () => dispatch({ type: "open", cell: { x, y } });
      } else {
        handleLeftClick = () => dispatch({ type: "setup", cell: { x, y } });
      }
      let handleRightClick,
        content = "";
      switch (state.cells[x][y].status) {
        case "open":
          handleRightClick = () => {};
          content = state.cells[x][y].content;
          break;
        case "mark":
          handleRightClick = () => dispatch({ type: "unmark", cell: { x, y } });
          break;
        default:
          handleRightClick = () => dispatch({ type: "mark", cell: { x, y } });
      }
      let color = "";
      switch (content) {
        case "1":
          color = "lightblue";
          break;
        case "2":
          color = "green";
          break;
        case "3":
          color = "red";
          break;
        case "4":
          color = "blue";
          break;
        case "5":
          color = "purple";
          break;
        case "6":
          color = "yellow";
          break;
        case "7":
          color = "orange";
          break;
        case "8":
          color = "pink";
          break;
        default:
          color = "black";
      }
      elements.push(
        <div
          key={key}
          className={`cell tenByTen ${state.cells[x][y].status} ${color}`}
          onClick={handleLeftClick}
          onContextMenu={handleRightClick}
        >
          {content}
        </div>
      );
    }
  }
  return elements;
}

function getAdjacents(x, y, width, height) {
  let adjacents = [];
  // left top diag
  if (x - 1 > -1 && y - 1 > -1) {
    adjacents.push({
      x: x - 1,
      y: y - 1
    });
  }
  // top
  if (y - 1 > -1) {
    adjacents.push({
      x: x,
      y: y - 1
    });
  }
  // right top diag
  if (x + 1 < width && y - 1 > -1) {
    adjacents.push({
      x: x + 1,
      y: y - 1
    });
  }
  // right
  if (x + 1 < width) {
    adjacents.push({
      x: x + 1,
      y: y
    });
  }
  // right bot diag
  if (x + 1 < width && y + 1 < height) {
    adjacents.push({
      x: x + 1,
      y: y + 1
    });
  }
  // bot
  if (y + 1 < height) {
    adjacents.push({
      x: x,
      y: y + 1
    });
  }
  // left bot diag
  if (x - 1 > -1 && y + 1 < height) {
    adjacents.push({
      x: x - 1,
      y: y + 1
    });
  }
  // left
  if (x - 1 > -1) {
    adjacents.push({
      x: x - 1,
      y: y
    });
  }
  return adjacents;
}
