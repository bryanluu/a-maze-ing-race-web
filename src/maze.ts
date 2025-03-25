/**
 * Describes a DOM element's dimensions
 */
interface Dimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Implements a tile for the maze
 */
class Tile {
  readonly row: number; // the row of the this tile is in
  readonly column: number; // the column of the this tile is in
  readonly html: string; // the  html of the tile
  readonly id: string; // the id for the tile
  readonly selector: string; // the selector for the tile
  readonly index: number; // the index within the tiles list
  static existingTiles: Tile[] = []; // all existing tiles

  constructor(row: number, col: number) {
    let id = `maze-${row}-${col}`;
    this.selector = "#" + id;
    this.row = row;
    this.column = col;
    this.html = `<div id="${id}" class="maze-tile"></div>`;
    this.index = Tile.existingTiles.length;
    Tile.existingTiles.push(this);
  }

  protected ref(): JQuery {
    return $(this.selector);
  }

  dimensions(): Dimensions {
    let el = this.ref();
    return {
      ...el.position(),
      width: el.outerWidth(),
      height: el.outerHeight()
    }
  }

  center(): Dimensions {
    let dim = this.dimensions();
    return {
      ...dim,
      left: dim.left + (dim.width / 2),
      top: dim.top + (dim.height / 2)
    }
  }
}
