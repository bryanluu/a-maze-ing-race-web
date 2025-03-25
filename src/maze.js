/**
 * Implements a tile for the maze
 */
class Tile {
    constructor(row, col) {
        let id = `${row}-${col}`;
        let elementID = "grid-" + id;
        this.id = id;
        this.data = {
            row: row,
            column: col,
            elementID: elementID,
            html: `<div id="${elementID}" class="maze-tile"></div>`,
            selector: "#" + elementID,
            index: Tile.existingTiles.length,
        };
        Tile.existingTiles.push(this);
    }
    ref() {
        return $(this.data.selector);
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
/**
 * Implements a weighted undirected acyclic graph
 */
class Graph {
    constructor(nodes) {
        this.nodes = new Set(nodes);
        this.edges = new Map();
    }
    insertEdge(source, target, weight) {
        // do stuff
    }
}
//# sourceMappingURL=maze.js.map