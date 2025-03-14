// Demo Settings
var mazeWidth = 4;
var mazeHeight = 4;

function buildMaze(mazeWidth, mazeHeight) {
  let mazeHTML = "";
  for (let row = 0; row < mazeWidth; row++) {
    for (let col = 0; col < mazeHeight; col++) {
      let id = `maze-${row}-${col}`
      let tileHTML = `<div id="${id}" class="maze-tile"></div>`;
      mazeHTML += tileHTML;
    }
  }
  // fill the maze with tiles
  $("#maze-grid").html(mazeHTML);
};

function loadGame() {
  buildMaze(4, 4);
};

$(document).ready(loadGame);
