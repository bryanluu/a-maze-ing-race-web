import Heap from "./heap.js";
/**
 * Implements an element that lives on a MazeVertex spot
 */
class VertexTile {
    constructor(id, index) {
        this.id = id;
        this.data = {
            elementID: id,
            selector: "#" + id,
            index: index,
            cost: Infinity,
            route: null,
            used: false
        };
    }
    toString() {
        return this.id.toString();
    }
    getIndex() {
        return this.data.index;
    }
    ref() {
        return $(this.data.selector);
    }
    dimensions() {
        let el = this.ref();
        return Object.assign(Object.assign({}, el.position()), { width: el.outerWidth(), height: el.outerHeight() });
    }
    center() {
        let { top, left, width, height } = this.dimensions();
        return {
            top: top + (height / 2),
            left: left + (width / 2),
            width: width,
            height: height
        };
    }
}
/**
 * Implements a weighted undirected graph
 */
export class Graph {
    constructor() {
        this.edges = new Set();
        this.weights = new Map();
    }
    static resetNodeList(properties) {
        let mazeWidth = properties.columns, mazeHeight = properties.rows;
        Graph.nodes = [];
        for (let index = 0; index < (mazeWidth * mazeHeight); index++) {
            let id = `v${index}`;
            let node = new VertexTile(id, index);
            Graph.nodes.push(node);
        }
    }
    static getNode(index) {
        return Graph.nodes[index];
    }
    static isValidIndex(index) {
        return ((0 <= index) && (index < Graph.nodes.length));
    }
    /**
     *
     * @param index - index of the src node
     * @param direction - direction of the neighbor node
     * @returns the index of neighbor node in the direction, null otherwise
     */
    static getNeighborIndex(index, direction) {
        let newIndex = index;
        switch (direction) {
            case "up":
                newIndex = index - Graph.mazeGrid.columns;
                break;
            case "right":
                newIndex = index + 1;
                break;
            case "down":
                newIndex = index + Graph.mazeGrid.columns;
                break;
            case "left":
                newIndex = index - 1;
                break;
            default:
                console.error(`Invalid direction: "${direction}"`);
                return null;
        }
        if (Graph.isValidIndex(newIndex))
            return newIndex;
        else
            return null;
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
        for (let node of Graph.nodes) {
            str += node.toString();
            i++;
            if (i < Graph.nodes.length)
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
    isNeighbor(src, tgt) {
        // check the edges for a src-tgt or tgt-src pair
        for (let edge of this.edges) {
            let s = edge[0], t = edge[1];
            if (((s == src) && (t == tgt)) || ((t == src) && (s == tgt))) {
                // src-tgt or tgt-src found
                return true;
            }
        }
        // if no edges match, return false
        return false;
    }
    /**
     * Constructs the grid used by the maze
     *
     * @param properties
     */
    static constructMazeGrid(properties) {
        Graph.mazeGrid = {
            rows: properties.rows,
            columns: properties.columns
        };
        let cssGrid = {
            rows: (2 * properties.rows) - 1,
            columns: (2 * properties.columns) - 1,
        };
        if (properties.testing)
            return;
        let grid = $("#maze-grid");
        grid.css("grid-template-rows", `repeat(${cssGrid.rows}, 1fr)`);
        grid.css("grid-template-columns", `repeat(${cssGrid.columns}, 1fr)`);
    }
    /**
     * Demo maze to debug stuff
     */
    static buildDemoGraph(properties) {
        let mazeWidth = 3, mazeHeight = 3;
        let dimensions = {
            rows: mazeHeight,
            columns: mazeWidth,
            testing: properties.testing
        };
        Graph.constructMazeGrid(dimensions);
        Graph.resetNodeList(dimensions);
        const v = Graph.getNode;
        Graph.adjacencyGraph = new Graph();
        let adj = Graph.adjacencyGraph;
        adj.insertEdge(v(0), v(1), 3);
        adj.insertEdge(v(1), v(2), 5);
        adj.insertEdge(v(0), v(3), 1);
        adj.insertEdge(v(1), v(4), 1);
        adj.insertEdge(v(2), v(5), 3);
        adj.insertEdge(v(3), v(4), 2);
        adj.insertEdge(v(4), v(5), 2);
        adj.insertEdge(v(3), v(6), 4);
        adj.insertEdge(v(4), v(7), 1);
        adj.insertEdge(v(5), v(8), 5);
        adj.insertEdge(v(6), v(7), 1);
        adj.insertEdge(v(7), v(8), 2);
    }
    static buildAdjacencyGraph(properties) {
        let mazeWidth = properties.columns, mazeHeight = properties.rows;
        Graph.constructMazeGrid(properties);
        Graph.resetNodeList(properties);
        let nodes = Graph.nodes;
        Graph.adjacencyGraph = new Graph();
        let adj = Graph.adjacencyGraph;
        let i = 0;
        for (let r = 0; r < mazeHeight; r++) {
            for (let c = 0; c < mazeWidth; c++) {
                let src = Graph.getNode(i);
                let srcIndex = src.data.index;
                let weight = Math.floor(nodes.length * Math.random());
                if (c > 0) {
                    let left = Graph.getNode(Graph.getNeighborIndex(srcIndex, "left"));
                    adj.insertEdge(src, left, weight);
                }
                if (r > 0) {
                    let above = Graph.getNode(Graph.getNeighborIndex(srcIndex, "up"));
                    adj.insertEdge(src, above, weight);
                }
                i++;
            }
        }
    }
    /**
     * Creates the Maze graph with the given dimensions
     *
     * @param {*} mazeWidth
     * @param {*} mazeHeight
     */
    static buildMaze(properties) {
        let { useDemoGraph } = properties;
        if (useDemoGraph) {
            Graph.buildDemoGraph(properties);
        }
        else {
            Graph.buildAdjacencyGraph(properties);
        }
        let adj = Graph.adjacencyGraph;
        let hasCheaperEdge = (u, v) => {
            return v.data.cost - u.data.cost;
        };
        let priorityQueue = new Heap(hasCheaperEdge);
        let start = Graph.getNode(0); // TODO adjust for dynamic start
        priorityQueue.insert(start);
        Graph.mazeGraph = new Graph();
        let maze = Graph.mazeGraph;
        while (!priorityQueue.isEmpty()) {
            let v = priorityQueue.extract(); // return border node with cheapest edge
            v.data.used = true;
            let cheapestCost = v.data.cost;
            let cheapestNeighbor = Graph.getNode(v.data.route);
            // if v touches the maze, add cheapest neighboring edge to maze
            if (cheapestNeighbor)
                maze.insertEdge(v, cheapestNeighbor, cheapestCost);
            // loop through outgoing edges of v
            let neighbors = adj.weights.get(v);
            neighbors.forEach((weight, w, _) => {
                if ((!w.data.used) && weight < w.data.cost) {
                    w.data.cost = weight;
                    w.data.route = v.data.index;
                    priorityQueue.insert(w);
                }
            });
        }
    }
    /**
     * Creates the HTML for the Maze and inserts it into the document
     */
    static displayMaze() {
        let g = Graph.mazeGraph;
        let mazeWidth = Graph.mazeGrid.columns;
        let mazeHeight = Graph.mazeGrid.rows;
        let mazeHTML = "";
        let gapHTML = '<div class="maze-tile maze-gap"></div>';
        let makeEdgeHTML = (srcIndex, tgtIndex) => {
            let src = Graph.getNode(srcIndex);
            let tgt = Graph.getNode(tgtIndex);
            let visible = g.isNeighbor(src, tgt);
            let classes = (visible ? "maze-tile maze-edge maze-path" : "maze-tile maze-edge maze-gap");
            return `<div id="e${srcIndex}-${tgtIndex}" class="${classes}"></div>`;
        };
        let index = 0;
        for (let i = 0; i < 2 * mazeHeight - 1; i++) {
            for (let j = 0; j < 2 * mazeWidth - 1; j++) {
                if ((i % 2 == 0) && (j % 2 == 0)) { // vertex tile
                    let vertexHTML = `<div id="v${index}" class="maze-tile maze-vertex maze-path"></div>`;
                    mazeHTML += vertexHTML;
                    index++;
                }
                else {
                    if (i % 2 == 0) { // horizontal edge tile
                        let src = index - 1;
                        let tgt = index;
                        mazeHTML += makeEdgeHTML(src, tgt);
                    }
                    else if (j % 2 == 0) { // vertical edge tile
                        let tgt = index + (j / 2);
                        let src = tgt - mazeWidth;
                        mazeHTML += makeEdgeHTML(src, tgt);
                    }
                    else // gap
                        mazeHTML += gapHTML;
                }
            }
        }
        // fill the maze with tiles
        $("#maze-grid").html(mazeHTML);
    }
}
export class Player extends VertexTile {
    constructor(startIndex) {
        let id = "player";
        super(id, startIndex);
        this.id = "player"; // pseudo-constant id
        // load the image and position at the startIndex's node
        this.ref().load("public/assets/cursor-vertical.svg", () => {
            this.centerAt(Graph.getNode(startIndex).center());
        });
        Player.instance = this;
    }
    /**
     *
     * @param {Rect} position
     *
     * Moves the player's center to the position coordinates: {top, left}
     */
    centerAt(position) {
        let ref = this.ref();
        let newPosition = {
            "top": position.top - (ref.outerHeight() / 2),
            "left": position.left - (ref.outerWidth() / 2)
        };
        ref.css(newPosition);
    }
    /**
     *
     * @param {VertexTile} target
     *
     * Moves the player's center to the target vertex
     */
    moveTo(target) {
        let player = this.ref();
        if (player.hasClass("moving"))
            return;
        let position = target.center();
        let newPosition = {
            "top": position.top - (player.outerHeight() / 2),
            "left": position.left - (player.outerWidth() / 2)
        };
        player.addClass("moving");
        player.animate(newPosition, {
            // this ensures the final resting position is the target
            complete: () => {
                player.css(newPosition);
                player.removeClass("moving");
            },
            duration: 100, // quick movement
            easing: "linear"
        });
    }
    /**
     *
     * Points the player to the left, right, up, down
     *
     * @param {string} direction - left | right | up |down
     */
    pointTo(direction) {
        let player = this.ref();
        if (player.hasClass("rotating"))
            return;
        let angle = Number.parseInt(player.css("rotate")) || 0;
        let targetAngle = null;
        switch (direction) {
            case "up":
                targetAngle = 0;
                break;
            case "right":
                targetAngle = 90;
                break;
            case "down":
                targetAngle = 180;
                break;
            case "left":
                targetAngle = 270;
                break;
            default:
                console.error(`Invalid direction: "${direction}"`);
                return;
        }
        // chooses the sensible short arc if the angles are periodically close
        while ((targetAngle - angle) > 180) {
            angle += 360;
        }
        while ((targetAngle - angle) < -180) {
            angle -= 360;
        }
        player.addClass("rotating");
        // this keeps the angle within [0, 360)
        player.css("rotate", `${angle}deg`);
        player.animate({
            "rotate": `+=${(targetAngle - angle)}deg`
        }, {
            // this ensures the final resting position is the target angle
            complete: () => {
                player.css("rotate", `${targetAngle}deg`);
                player.removeClass("rotating");
            },
            duration: 100, // quick rotation
            easing: "linear"
        });
    }
    /**
     *
     * @param direction - the direction to attempt to move towards
     * @returns stops if move is illegal
     */
    attemptMove(direction) {
        let maze = Graph.mazeGraph;
        let player = this.ref();
        if (player.hasClass("moving"))
            return;
        this.pointTo(direction);
        let startIndex = this.data.index;
        let newIndex = Graph.getNeighborIndex(startIndex, direction);
        // if newIndex is invalid, i.e. player would move out-of-bounds, stop
        if (!Graph.isValidIndex(newIndex))
            return;
        let src = Graph.getNode(startIndex);
        let tgt = Graph.getNode(newIndex);
        if (maze.isNeighbor(src, tgt)) {
            this.data.index = newIndex;
            this.moveTo(Graph.getNode(newIndex));
        }
    }
}
//# sourceMappingURL=maze.js.map