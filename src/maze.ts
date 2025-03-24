/**
 * Implements a tile for the maze
 */
class Tile {
  row: number; // the row of the this tile is in
  column: number; // the column of the this tile is in
  html: string; // the  html of the tile
  selector: string; // the selector for the tile
  index: number; // the index within the tiles list
  static existingTiles: Tile[] = []; // all existing tiles

  constructor(public r: number, public c: number) {
    this.row = r;
    this.column = c;
    let id = `maze-${r}-${c}`;
    this.selector = "#" + id;
    this.html = `<div id="${id}" class="maze-tile"></div>`;
    this.index = Tile.existingTiles.length;
    Tile.existingTiles.push(this);
  }
}
