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
  readonly row: number; // the row of the this tile is in
  readonly column: number; // the column of the this tile is in
  readonly html: string; // the  html of the tile
  readonly elementID: string; // the id for the tile element
  readonly selector: string; // the selector for the tile
  readonly index: number; // the index within the tiles list
}

/**
 * Implements a tile for the maze
 */
class Tile implements Vertex<string, TileData> {
  readonly id: string; // the id for the tile
  readonly data: TileData // data payload for tile
  static existingTiles: Tile[] = []; // all existing tiles

  constructor(row: number, col: number) {
    let id = `${row}-${col}`;
    let elementID = "grid-"+id;
    this.id = id;
    this.data = {
      row: row,
      column: col,
      elementID: elementID,
      html: `<div id="${elementID}" class="maze-tile"></div>`,
      selector: "#" + elementID,
      index: Tile.existingTiles.length,
    }
    Tile.existingTiles.push(this);
  }

  toString() : string {
    return `(${this.data.row},${this.data.column})`;
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
}

type Edge<VertexType> = readonly [VertexType, VertexType];
type EdgeList<VertexType> = Map<VertexType, number>;

/**
 * Implements a weighted graph
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
      this.insertEdge(target, source, weight, true);
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
}
