// Demo Settings
var mazeWidth = 4;
var mazeHeight = 4;

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
  let firstVertex = MazeVertex.nodes[0];
  new Player(firstVertex.data.index);
};


/**
 * Initializes the game
 */
function initializeGame() {
  Graph.buildMaze(3, 3); // TODO make dynamic
  Graph.displayMaze();
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
      Player.instance.attemptMove(direction);
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
