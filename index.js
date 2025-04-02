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
  for (let i = 0; i < (mazeWidth * mazeHeight); i++)
    new MazeVertex();
  let nodes = MazeVertex.nodes;

  Graph.adjacencyGraph = new Graph(nodes, mazeWidth, mazeHeight);
  let adj = Graph.adjacencyGraph;
  let i = 0;
  for (let r = 0; r < mazeHeight; r++) {
    for (let c = 0; c < mazeWidth; c++) {
      let src = MazeVertex.getNode(i);
      let srcIndex = src.data.index;
      let weight = Math.floor(nodes.length * Math.random());
      if ((c % mazeWidth) > 0)
      {
        let left = MazeVertex.getNode(MazeVertex.getNeighborIndex(srcIndex, "left"));
        adj.insertEdge(src, left, weight);
      }
      if (r > 0) {
        let above = MazeVertex.getNode(MazeVertex.getNeighborIndex(srcIndex, "up"));
        adj.insertEdge(src, above, weight);
      }
      i++;
    }
  }

  // TODO remove demo code
  let hasCheaperEdge = (u, v) => {
    return v.data.cost - u.data.cost;
  }
  let priorityQueue = new Heap(hasCheaperEdge);
  let start = MazeVertex.getNode(0); // TODO adjust for dynamic start
  priorityQueue.insert(start);
  Graph.mazeGraph = new Graph(nodes, mazeWidth, mazeHeight);
  let maze = Graph.mazeGraph;
  // // TODO fix, currently buggy and stuck in an infinite loop
  // while (!priorityQueue.isEmpty()) {
  //   let v = priorityQueue.extract(); // return border node with cheapest edge
  //   v.data.used = true;
  //   let cheapestCost = v.data.cost;
  //   let cheapestNeighbor = MazeVertex.getNode(v.data.route);

  //   // if v touches the maze, add cheapest neighboring edge to maze
  //   if (cheapestNeighbor)
  //     maze.insertEdge(v, cheapestNeighbor, cheapestCost);

  //   // loop through outgoing edges of v
  //   let neighbors = adj.weights.get(v);
  //   neighbors.forEach((weight, w, _) => {
  //     if ((!w.data.used) && weight < w.data.cost) {
  //       w.data.cost = weight;
  //       w.data.route = v.data.index;
  //       priorityQueue.insert(w);
  //     }
  //   })
  // }
  maze.insertEdge(nodes[0], nodes[1], 1);
  maze.insertEdge(nodes[1], nodes[2], 1);
  maze.insertEdge(nodes[2], nodes[5], 1);
  maze.insertEdge(nodes[3], nodes[6], 1);
  maze.insertEdge(nodes[4], nodes[7], 1);
  maze.insertEdge(nodes[5], nodes[4], 1);
  maze.insertEdge(nodes[6], nodes[7], 1);
  maze.insertEdge(nodes[7], nodes[8], 1);
}

/**
 * Creates the HTML for the Maze and inserts it into the document
 */
function displayMaze() {
  let g = Graph.mazeGraph;
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
  displayMaze();
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
