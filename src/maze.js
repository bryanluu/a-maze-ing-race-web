/**
 * Implements a tile for the maze
 */
class Tile {
    constructor(row, col) {
        let id = `maze-${row}-${col}`;
        this.selector = "#" + id;
        this.row = row;
        this.column = col;
        this.html = `<div id="${id}" class="maze-tile"></div>`;
        this.index = Tile.existingTiles.length;
        Tile.existingTiles.push(this);
    }
    ref() {
        return $(this.selector);
    }
    dimensions() {
        let el = this.ref();
        return Object.assign(Object.assign({}, el.position()), { width: el.outerWidth(), height: el.outerHeight() });
    }
    center() {
        let dim = this.dimensions();
        return Object.assign(Object.assign({}, dim), { left: dim.left + (dim.width / 2), top: dim.top + (dim.height / 2) });
    }
}
Tile.existingTiles = []; // all existing tiles
//# sourceMappingURL=maze.js.map