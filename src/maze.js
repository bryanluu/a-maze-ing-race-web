/**
 * Implements a tile for the maze
 */
class MazeVertex {
    constructor() {
        let index = MazeVertex.nodes.length;
        let id = `v${index}`;
        this.id = id;
        this.data = {
            elementID: id,
            selector: "#" + id,
            index: MazeVertex.nodes.length,
        };
        MazeVertex.nodes.push(this);
    }
    toString() {
        return this.id.toString();
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
MazeVertex.nodes = []; // all existing tiles
/**
 * Implements a weighted graph
 */
class Graph {
    constructor(nodes) {
        this.nodes = new Set(nodes);
        this.edges = new Set();
        this.weights = new Map();
    }
    insertEdge(source, target, weight, directed = false) {
        let newEdges = this.weights.get(source) || new Map();
        newEdges.set(target, weight);
        this.weights.set(source, newEdges);
        if (!directed)
            this.insertEdge(target, source, weight, true); // insert return direction
        else
            this.edges.add([source, target]);
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
        this.weights.forEach((neighbors, src, m) => {
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