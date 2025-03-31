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
 * Creates the Maze graph with the given dimensions
 *
 * @param {*} mazeWidth
 * @param {*} mazeHeight
 */
function buildMaze(mazeWidth, mazeHeight) {
  let numNodes = mazeWidth * mazeHeight;
  for (let i = 0; i < numNodes; i++)
    new MazeVertex();

  // TODO remove demo code
  let nodes = MazeVertex.nodes;
  g = new Graph(nodes, mazeWidth, mazeHeight);
  g.insertEdge(nodes[0], nodes[1], 1);
  g.insertEdge(nodes[1], nodes[2], 1);
  g.insertEdge(nodes[2], nodes[5], 1);
  g.insertEdge(nodes[3], nodes[6], 1);
  g.insertEdge(nodes[4], nodes[7], 1);
  g.insertEdge(nodes[5], nodes[4], 1);
  g.insertEdge(nodes[6], nodes[7], 1);
  g.insertEdge(nodes[7], nodes[8], 1);
}

/**
 * Creates the HTML for the Maze and inserts it into the document
 *
 * @param {Graph} g - graph object to display as the maze
 */
function displayMaze(g) {
  let mazeWidth = g.dimensions.width;
  let mazeHeight = g.dimensions.height;
  let mazeHTML = "";
  let gapHTML = '<div class="maze-tile maze-gap"></div>';
  let makeEdgeHTML = (srcIndex, tgtIndex) => {
    let src = MazeVertex.getNode(srcIndex);
    let tgt = MazeVertex.getNode(tgtIndex);
    let visible = g.isNeighbor(src, tgt);
    let classes = (visible ? "maze-tile maze-edge maze-path" : "maze-tile maze-edge maze-gap");
    return `<div id="e${srcIndex}-${tgtIndex}" class="${classes}"></div>`;
  }
  let index = 0;
  for (let i = 0; i < 2*mazeHeight-1; i++) {
    for (let j = 0; j < 2*mazeWidth-1; j++) {
      if ((i % 2 == 0) && (j % 2 == 0)) { // vertex tile
        let vertexHTML = `<div id="v${index}" class="maze-tile maze-vertex maze-path"></div>`;
        mazeHTML += vertexHTML;
        index++
      } else {
        if (i % 2 == 0) { // horizontal edge tile
          let src = index - 1;
          let tgt = index;
          mazeHTML += makeEdgeHTML(src, tgt);
        } else if (j % 2 == 0) { // vertical edge tile
          let tgt = index + (j / 2);
          let src = tgt - mazeWidth;
          mazeHTML += makeEdgeHTML(src, tgt);
        } else // gap
          mazeHTML += gapHTML;
      }
    }
  }
  // fill the maze with tiles
  $("#maze-grid").html(mazeHTML);
};

/**
 * Initializes the game
 */
function initializeGame() {
  buildMaze(3, 3); // TODO make dynamic
  displayMaze(g);
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
      Player.instance.pointTo(direction);
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

var g; // TODO delete me!!
