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
    toString() {
        return `(${this.id})`;
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
 * Implements a weighted graph
 */
class Graph {
    constructor(nodes) {
        this.nodes = new Set(nodes);
        this.edges = new Map();
    }
    insertEdge(source, target, weight, directed = false) {
        let newEdges = this.edges.get(source) || new Map();
        newEdges.set(target, weight);
        this.edges.set(source, newEdges);
        if (!directed)
            this.insertEdge(target, source, weight, true);
    }
    toString() {
        let str = "nodes: {";
        // nodes toString
        let i = 0;
        for (let node of this.nodes) {
            str += node.toString();
            i++;
            if (i < this.nodes.size)
                str += ", ";
            else // last node
                str += "}\n";
        }
        // edges toString
        str += "edges:\n";
        this.edges.forEach((neighbors, src, m) => {
            str += "\t";
            str += src.toString() + ": [";
            i = 0;
            neighbors.forEach((weight, tgt, _) => {
                str += tgt.toString() + ":" + weight.toString();
                i++;
                if (i < neighbors.size)
                    str += ", ";
            });
            str += "]\n";
        });
        return str;
    }
    print() {
        console.log(this.toString());
    }
}
//# sourceMappingURL=maze.js.map