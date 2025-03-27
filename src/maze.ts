/**
 * Describes a DOM element's rect
 */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Vertex<idType, dataType> {
  id: idType;
  data: dataType;
}

interface TileData {
  readonly elementID: string; // the id for the tile element
  readonly selector: string; // the selector for the tile
  readonly index: number; // the index within the tiles list
}

/**
 * Implements a tile for the maze
 */
class MazeVertex implements Vertex<string, TileData> {
  readonly id: string; // the id for the tile
  readonly data: TileData // data payload for tile
  static nodes: MazeVertex[] = []; // all existing tiles

  constructor() {
    let index = MazeVertex.nodes.length;
    let id = `v${index}`;
    this.id = id;
    this.data = {
      elementID: id,
      selector: "#" + id,
      index: index,
    }
    MazeVertex.nodes.push(this);
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
    let dim = this.dimensions();
    return {
      ...dim,
      left: dim.left + (dim.width / 2),
      top: dim.top + (dim.height / 2)
    }
  }

  static getNode(index: number): MazeVertex {
    return MazeVertex.nodes[index];
  }
}

type Edge<VertexType> = readonly [VertexType, VertexType];
type EdgeList<VertexType> = Map<VertexType, number>;

/**
 * Implements a weighted undirected graph
 */
class Graph<VertexType> {
  nodes: Set<VertexType>
  // stores unique edges for easier indexing
  edges: Set<Edge<VertexType>>;
  weights: Map<VertexType, EdgeList<VertexType>>;

  constructor(nodes: VertexType[]) {
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

  isNeighbour(src: VertexType, tgt:VertexType): boolean {
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
