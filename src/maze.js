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
            this.centerAt(MazeVertex.nodes[startIndex].center());
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
     * Points the player to the left, right, up, down
     *
     * @param {string} direction - left | right | up |down
     */
    pointTo(direction) {
        let player = $("#player");
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
        // this keeps the angle within [0, 360)
        player.css("rotate", `${angle}deg`);
        player.animate({
            "rotate": `+=${(targetAngle - angle)}deg`
        }, {
            // TODO remove this once event queue implemented
            // this ensures the final resting position is the target angle
            "complete": () => {
                player.css("rotate", `${targetAngle}deg`);
            },
            "duration": 100, // quick rotation
            "easing": "linear"
        });
    }
}
//# sourceMappingURL=maze.js.map