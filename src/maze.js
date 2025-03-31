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
 * Implements a tile for the maze
 */
class MazeVertex extends VertexTile {
    constructor() {
        let index = MazeVertex.nodes.length;
        let id = `v${index}`;
        super(id, index);
        MazeVertex.nodes.push(this);
    }
    static getNode(index) {
        return MazeVertex.nodes[index];
    }
    static isValidIndex(index) {
        return ((0 <= index) && (index < MazeVertex.nodes.length));
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
                newIndex = index - Graph.adjacencyGraph.dimensions.width;
                break;
            case "right":
                newIndex = index + 1;
                break;
            case "down":
                newIndex = index + Graph.adjacencyGraph.dimensions.width;
                break;
            case "left":
                newIndex = index - 1;
                break;
            default:
                console.error(`Invalid direction: "${direction}"`);
                return null;
        }
        if (MazeVertex.isValidIndex(newIndex))
            return newIndex;
        else
            return null;
    }
}
MazeVertex.nodes = []; // all existing tiles
/**
 * Implements a weighted undirected graph
 */
class Graph {
    constructor(nodes, width, height) {
        this.dimensions = {
            width: width,
            height: height
        };
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
}
class Player extends VertexTile {
    constructor(startIndex) {
        let id = "player";
        super(id, startIndex);
        this.id = "player"; // pseudo-constant id
        // load the image and position at the startIndex's node
        this.ref().load("public/assets/cursor-vertical.svg", () => {
            this.centerAt(MazeVertex.getNode(startIndex).center());
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
     * @param {MazeVertex} target
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
        let newIndex = MazeVertex.getNeighborIndex(startIndex, direction);
        // if newIndex is invalid, i.e. player would move out-of-bounds, stop
        if (!MazeVertex.isValidIndex(newIndex))
            return;
        let src = MazeVertex.getNode(startIndex);
        let tgt = MazeVertex.getNode(newIndex);
        if (maze.isNeighbor(src, tgt)) {
            this.data.index = newIndex;
            this.moveTo(MazeVertex.getNode(newIndex));
        }
    }
}
//# sourceMappingURL=maze.js.map