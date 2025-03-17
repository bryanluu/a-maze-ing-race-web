// Demo Settings
var mazeWidth = 4;
var mazeHeight = 4;

/**
 *
 * @param {number} row
 * @param {number} col
 * @returns the JQuery reference to the tile at given row, col
 */
function getTile(row, col) {
  return $(`#maze-${row}-${col}`);
};

/**
 *
 * @param {number} row
 * @param {number} col
 * @returns the center position of the tile at given row, col
 */
function getTileMiddlePosition(row, col) {
  let tile = getTile(row, col);
  let {top, left} = tile.position();
  let width = tile.outerWidth();
  let height = tile.outerHeight();
  return {
    "top": top + (height / 2),
    "left": left + (width / 2)
  };
};

/**
 *
 * @param {object} position
 *
 * Moves the player's center to the position coordinates: {top, left}
 */
function centerPlayerAt(position) {
  let player = $("#player");
  let newPosition = {
    "top": position.top - (player.outerHeight() / 2),
    "left": position.left - (player.outerWidth() / 2)
  };
  player.css(newPosition);
};

/**
 *
 * @param {string} direction - left | right | top | bottom
 *
 * Rotates the player to the left, right, top, bottom
 */
function pointPlayerTo(direction) {
  let angle = 0
  switch(direction) {
    case "top":
      angle = 0;
      break;
    case "right":
      angle = 90;
      break;
    case "bottom":
      angle = 180;
      break;
    case "left":
      angle = -90;
      break;
    default:
      console.error(`Invalid direction: "${direction}"`)
      return;
  }
  $("#player").css("transform", `rotate(${angle}deg)`);
}

/**
 * Initializes the player
 */
function readyPlayer() {
  $("#player").load("public/assets/cursor-vertical.svg", () => {
    centerPlayerAt(getTileMiddlePosition(0, 0));
  });
};

/**
 *
 * @param {number} mazeWidth - number of columns the maze should have
 * @param {*} mazeHeight - number of rows the maze should have
 *
 * Creates the HTML for the Maze and inserts it into the document
 */
function buildMaze(mazeWidth, mazeHeight) {
  let mazeHTML = "";
  for (let row = 0; row < mazeHeight; row++) {
    for (let col = 0; col < mazeWidth; col++) {
      let id = `maze-${row}-${col}`
      let tileHTML = `<div id="${id}" class="maze-tile"></div>`;
      mazeHTML += tileHTML;
    }
  }
  // fill the maze with tiles
  $("#maze-grid").html(mazeHTML);
};

/**
 * Initializes the game
 */
function initializeGame() {
  buildMaze(3, 3);
  readyPlayer();
};

/**
 *
 * @param {object} keyEvent
 *
 * Handles the keyboard down presses, which control the game
 */
function handleKeydown(keyEvent) {
  let key = keyEvent.key;
  switch(key) {
    case "ArrowUp":
      pointPlayerTo("top");
      break;
    case "ArrowRight":
      pointPlayerTo("right");
      break;
    case "ArrowDown":
      pointPlayerTo("bottom");
      break;
    case "ArrowLeft":
      pointPlayerTo("left");
      break;
    default:
      // do nothing
  }
}

$(document).ready(initializeGame);

$(document).keydown(handleKeydown);
