import { Graph, Player } from "../src/maze.js";

const defaultOptions = {
  rows: 5,
  columns: 5
};

const settingsDialog = document.querySelector("#settings-dialog");
const settingsWidth = settingsDialog.querySelector("#maze-width");
const settingsHeight = settingsDialog.querySelector("#maze-height");

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
  let firstVertex = Graph.nodes[0];
  new Player(firstVertex.data.index);
};


/**
 * Initializes the game
 */
function initializeGame(options) {
  Graph.buildMaze(options);
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
  if (settingsDialog.open)
    return;

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

  if (settingsDialog.open)
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

$(document).ready(() => {
  initializeGame(defaultOptions);
});

$(document).on("keydown", handleKeydown);
$(document).on("keyup", handleKeyup);

$("button.key-symbol").on("mousedown",
  (event) => {
    let key = event.target.id
    inputDPad(key);
  }
);

$("button.key-symbol").on("mouseup", releaseDPad);
$("#settings-button").on("click", () => {
  settingsWidth.value = Graph.mazeGrid.columns;
  settingsHeight.value = Graph.mazeGrid.rows;
  settingsDialog.showModal();
});
$("#cancel-settings").on("click", (event) => {
  event.preventDefault();
  settingsDialog.close();
});
$("#settings-dialog").on("submit", () => {
  let options = {
    rows: Number.parseInt(settingsHeight.value),
    columns: Number.parseInt(settingsWidth.value)
  };
  initializeGame(options);
});
