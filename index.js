// Demo Settings
var mazeWidth = 4;
var mazeHeight = 4;

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
 * Rotates the player to the left, right, up, down
 *
 * @param {string} direction - left | right | up |down
 */
function pointPlayerTo(direction) {
  let player = $("#player");
  let angle = Number.parseInt(player.css("rotate")) || 0;
  let targetAngle = null;
  switch(direction) {
    case "up":
      targetAngle = 0;
      break;
    case "right":
      targetAngle = 90;
      break;
    case "down":
      targetAngle = 180;
      break;
    case "left":
      targetAngle = 270;
      break;
    default:
      console.error(`Invalid direction: "${direction}"`)
      return;
  }
  // chooses the sensible short arc if the angles are periodically close
  while((targetAngle - angle) > 180) {
    angle += 360;
  }
  while((targetAngle - angle) < -180) {
    angle -= 360;
  }
  // this keeps the angle within [0, 360)
  player.css("rotate", `${angle}deg`);
  player.animate({
    "rotate": `+=${(targetAngle - angle)}deg`
  },
  {
    // TODO remove this once event queue implemented
    // this ensures the final resting position is the target angle
    "complete": () => {
      player.css("rotate", `${targetAngle}deg`);
    },
    "duration": 100, // quick rotation
    "easing": "linear"
  });
}

/**
 * Styles the DPad button to look like its being pressed
 *
 * @param {string} direction - up | right | left | down
 */
function styleDpadButton(direction) {
  switch(direction) {
    case "up":
    case "right":
    case "down":
    case "left":
      $("#" + direction).addClass("pressed");
      break;
    default:
      console.error(`Invalid direction: "${direction}"`)
      return;
  }
}

/**
 * Initializes the player
 */
function readyPlayer() {
  let firstTile = Tile.existingTiles[0];
  $("#player").load("public/assets/cursor-vertical.svg", () => {
    centerPlayerAt(firstTile.center());
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
      let tile = new Tile(row, col);
      mazeHTML += tile.html;
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
 * Triggers the d-pad clicks
 */
function inputDPad(direction) {
  switch(direction) {
    case "up":
    case "right":
    case "down":
    case "left":
      styleDpadButton(direction);
      pointPlayerTo(direction);
      break;
    default:
      console.error(`Invalid direction: "${direction}"`)
      return;
  }
}

function releaseDPad() {
  $(".key-symbol.pressed").removeClass("pressed");
}

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
      inputDPad("up");
      break;
    case "ArrowRight":
      inputDPad("right");
      break;
    case "ArrowDown":
      inputDPad("down");
      break;
    case "ArrowLeft":
      inputDPad("left");
      break;
    default:
      // do nothing
      return;
  }
  keyEvent.preventDefault();
}

function handleKeyup(keyEvent) {
  if (keyEvent.type != "keyup")
    return;

  let key = keyEvent.key;
  switch(key) {
    case "ArrowUp":
    case "ArrowRight":
    case "ArrowDown":
    case "ArrowLeft":
      releaseDPad();
      break;
    default:
      // do nothing
  }
}

$(document).ready(initializeGame);

$(document).on("keydown", handleKeydown);
$(document).on("keyup", handleKeyup);

$("button.key-symbol").on("mousedown",
  (event) => {
    let key = event.target.id
    inputDPad(key);
  }
);

$("button.key-symbol").on("mouseup", releaseDPad);
