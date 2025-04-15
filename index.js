import { Graph } from "./src/maze.js";
import { Player } from "./src/player.js";

const defaultOptions = {
  rows: 5,
  columns: 5,
  cancellable: true
};

const settingsDialog = document.querySelector("#settings-dialog");
const settingsWidth = settingsDialog.querySelector("#maze-width");
const settingsHeight = settingsDialog.querySelector("#maze-height");
const endgameDialog = document.querySelector("#endgame-dialog");

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
  new Player(Graph.startVertex.data.index);
};

/**
 * Initializes the finish location
 */
function readyFinish() {
  let tile = $(Graph.endVertex.data.selector);
  tile.addClass("end-tile");
}


/**
 * Initializes the game
 */
function initializeGame(options) {
  Graph.buildMaze(options);
  Graph.prepareEndpoints();
  Graph.displayMaze();
  readyPlayer();
  readyFinish();
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
  if (key === "Escape") {
    // if a no-escape dialog is open, ignore Escape press
    const dialog = $("dialog[open]");
    if (dialog.hasClass("no-escape")) {
      keyEvent.preventDefault();
      keyEvent.stopImmediatePropagation();
    }
    return;
  }

  // allows arrow keys to control inputs
  if (!settingsDialog.open) {
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

function showSettings(options) {
  let settings = {...defaultOptions, ...options};
  let maze = Graph.mazeGrid;
  settings.rows = (maze && maze.rows) || settings.rows;
  settings.columns = (maze && maze.columns) || settings.columns;
  // load existing settings
  settingsWidth.value = settings.columns;
  settingsHeight.value = settings.rows;
  if (settings.cancellable) {
    $("#settings-dialog").removeClass("no-escape");
    $("#cancel-settings").attr("hidden", false);
  } else {
    $("#settings-dialog").addClass("no-escape");
    $("#cancel-settings").attr("hidden", true);
  }
  settingsDialog.showModal();
}

function endGame() {
  endgameDialog.showModal();
}

$(document).ready(() => {
  showSettings({cancellable: false});
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
$("#settings-button").on("click", showSettings);
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
$("#play-space").on("playermove", (event) => {
  if (event.detail.newVertex === Graph.endVertex) {
    endGame();
  }
});
$("#play-space").on("playerrotate", (event) => {
  // console.log(event);
  // for now, noop
});
$("#replay-button").on("click", () => {
  showSettings({cancellable: false});
});
