/**
 * Describes a DOM element's rect
 */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TileData {
  readonly elementID: string; // the id for the tile element
  readonly selector: string; // the selector for the tile
  index: number; // the index within the tiles list
}

/**
 * Implements an element that lives on a MazeVertex spot
 */
class VertexTile {
  id: string;
  data: TileData

  constructor(id: string, index: number) {
    this.id = id;
    this.data = {
      elementID: id,
      selector: "#" + id,
      index: index,
    }
  }

  toString() : string {
    return this.id.toString();
  }

  getIndex(): number {
    return this.data.index;
  }

  protected ref(): JQuery {
    return $(this.data.selector);
  }

  dimensions(): Rect {
    let el = this.ref();
    return {
      ...el.position(),
      width: el.outerWidth(),
      height: el.outerHeight()
    }
  }

  center(): Rect {
    let {top, left, width, height} = this.dimensions();
    return {
      top: top + (height / 2),
      left: left + (width / 2),
      width: width,
      height: height
    }
  }
}

/**
 * Implements a tile for the maze
 */
class MazeVertex extends VertexTile {
  readonly id: string; // the id for the tile
  readonly data: TileData // data payload for tile
  static nodes: MazeVertex[] = []; // all existing tiles

  constructor() {
    let index = MazeVertex.nodes.length;
    let id = `v${index}`;
    super(id, index);
    MazeVertex.nodes.push(this);
  }

  static getNode(index: number): MazeVertex {
    return MazeVertex.nodes[index];
  }
}

interface Maze<VertexType> {
  nodes: Set<VertexType>;
  dimensions: {
    width: number,
    height: number
  };
}

type Edge<VertexType> = readonly [VertexType, VertexType];
type EdgeList<VertexType> = Map<VertexType, number>;

/**
 * Implements a weighted undirected graph
 */
class Graph<VertexType> implements Maze<VertexType> {
  nodes: Set<VertexType>
  // stores unique edges for easier indexing
  edges: Set<Edge<VertexType>>;
  weights: Map<VertexType, EdgeList<VertexType>>;
  dimensions: {
    width: number,
    height: number
  }
  static adjacencyGraph: Graph<MazeVertex>;
  static mazeGraph: Graph<MazeVertex>;

  constructor(nodes, width, height) {
    this.dimensions = {
      width: width,
      height: height
    };
    this.nodes = new Set<VertexType>(nodes);
    this.edges = new Set<Edge<VertexType>>();
    this.weights = new Map<VertexType, EdgeList<VertexType>>();
  }

  insertEdge(source: VertexType, target: VertexType, weight: number, directed: boolean = false) {
    let newEdges = this.weights.get(source) || new Map<VertexType, number>();
    newEdges.set(target, weight);
    this.weights.set(source, newEdges);

    if (!directed)
      this.insertEdge(target, source, weight, true); // insert return direction
    else
      this.edges.add([source, target]);
  }

  toString(): string {
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
    str += "edges:\n"
    this.weights.forEach((neighbors, src, m) => {
      str += "\t";
      str += src.toString() + ": [";
      i = 0;
      neighbors.forEach((weight, tgt, _) => {
        str += tgt.toString() + ":" + weight.toString();
        i++;
        if (i < neighbors.size)
          str += ", ";
      })
      str += "]\n";
    })
    return str;
  }

  private print(): void {
    console.log(this.toString());
  }

  isNeighbor(src: VertexType, tgt:VertexType): boolean {
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
  id: string = "player"; // pseudo-constant id
  data: TileData; // contains metadata about player element
  static instance: Player;

  constructor(startIndex: number) {
    let id = "player";
    super(id, startIndex);
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
  centerAt(position: Rect) {
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
  moveTo(target: MazeVertex) {
    let player = this.ref();
    if (player.hasClass("moving"))
      return;
    let position = target.center();
    let newPosition = {
      "top": position.top - (player.outerHeight() / 2),
      "left": position.left - (player.outerWidth() / 2)
    };
    player.addClass("moving");
    player.animate(
      newPosition,
    {
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
    switch(direction) {
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
        console.error(`Invalid direction: "${direction}"`)
        return;
    }
    // chooses the sensible short arc if the angles are periodically close
    while((targetAngle - angle) > 180) {
      angle += 360;
    }
    while((targetAngle - angle) < -180) {
      angle -= 360;
    }
    player.addClass("rotating");
    // this keeps the angle within [0, 360)
    player.css("rotate", `${angle}deg`);
    player.animate({
      "rotate": `+=${(targetAngle - angle)}deg`
    },
    {
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
  attemptMove(direction: string) {
    let maze = Graph.mazeGraph;
    let player = this.ref();
    if (player.hasClass("moving"))
      return;
    this.pointTo(direction);
    let startIndex = this.data.index;
    let newIndex = startIndex;
    switch(direction) {
      case "up":
        newIndex = startIndex - maze.dimensions.width;
        if (newIndex < 0) // at the top edge
          return;
        break;
      case "right":
        newIndex = startIndex + 1;
        if ((newIndex % maze.dimensions.width) === 0) // at right edge
          return;
        break;
      case "down":
        newIndex = startIndex + maze.dimensions.width;
        if (newIndex >= MazeVertex.nodes.length) // at bottom edge
          return;
        break;
      case "left":
        newIndex = startIndex - 1;
        if ((startIndex % maze.dimensions.width) === 0) // at left edge
          return;
        break;
      default:
        console.error(`Invalid direction: "${direction}"`)
        return;
    }
    let src = MazeVertex.getNode(startIndex);
    let tgt = MazeVertex.getNode(newIndex);
    if (maze.isNeighbor(src, tgt)) {
      this.data.index = newIndex;
      this.moveTo(MazeVertex.getNode(newIndex));
    }
  }
}
