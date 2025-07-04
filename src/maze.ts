import Heap from "./heap.js";

/**
 * Describes a DOM position
 */
export interface Position {
  top: number;
  left: number;
}

/**
 * Describes a DOM element's rect
 */
export interface Rect extends Position {
  width: number;
  height: number;
}

export interface TileData {
  readonly elementID: string; // the id for the tile element
  readonly selector: string; // the selector for the tile
  index: number; // the index within the tiles list
  cost?: number; // the cheapest cost of connection to vertex
  route?: number; // the index of the neighbor providing the cheapest edge
  used?: boolean; // whether the tile is in the maze
  artifact?: VertexTile; // the reference to a contained artifact, if any
  collected?: number; // number of artifacts collected by player, if any
}

/**
 * Implements an element that lives on a MazeVertex spot
 */
export class VertexTile {
  id: string;
  data: TileData

  constructor(id: string, index: number) {
    this.id = id;
    this.data = {
      elementID: id,
      selector: "#" + id,
      index: index,
      cost: Infinity,
      route: null,
      used: false
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

  protected el(): HTMLElement {
    return document.querySelector(this.data.selector);
  }

  dimensions(): Rect {
    let el = this.el();
    return {
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight
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

type Edge<VertexType> = readonly [VertexType, VertexType];
type EdgeList<VertexType> = Map<VertexType, number>;

/**
 * Implements a weighted undirected graph
 */
export class Graph{
  static nodes: VertexTile[];
  // stores unique edges for easier indexing
  edges: Set<Edge<VertexTile>>;
  weights: Map<VertexTile, EdgeList<VertexTile>>;
  // TODO fix data access
  static adjacencyGraph: Graph;
  static mazeGraph: Graph;
  static mazeGrid: {
    rows: number,
    columns: number
  };
  static startVertex: VertexTile;
  static endVertex: VertexTile;

  constructor() {
    this.edges = new Set<Edge<VertexTile>>();
    this.weights = new Map<VertexTile, EdgeList<VertexTile>>();
  }

  private static resetNodeList(properties: {
    rows: number,
    columns: number
  }) {
    let mazeWidth = properties.columns, mazeHeight = properties.rows;
    Graph.nodes = [];
    for (let index = 0; index < (mazeWidth * mazeHeight); index++)
    {
      let id = `v${index}`;
      let node = new VertexTile(id, index);
      Graph.nodes.push(node);
    }
  }

  static getNode(index: number): VertexTile {
    return Graph.nodes[index];
  }

  static isValidIndex(index: number): boolean {
    return ((0 <= index) && (index < Graph.nodes.length));
  }

  /**
   *
   * @param index - index of the src node
   * @param direction - direction of the neighbor node
   * @returns the index of neighbor node in the direction, null otherwise
   */
  static getNeighborIndex(index: number, direction: string): number {
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
        console.error(`Invalid direction: "${direction}"`)
        return null;
    }

    if (Graph.isValidIndex(newIndex))
      return newIndex;
    else
      return null;
  }

  insertEdge(source: VertexTile, target: VertexTile, weight: number, directed: boolean = false) {
    let newEdges = this.weights.get(source) || new Map<VertexTile, number>();
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
    for (let node of Graph.nodes) {
      str += node.toString();
      i++;
      if (i < Graph.nodes.length)
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

  isNeighbor(src: VertexTile, tgt: VertexTile): boolean {
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
  private static constructMazeGrid(properties: { rows: number, columns: number, testing?: boolean}) {
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
  private static buildDemoGraph(properties: { testing?: boolean }) {
    let mazeWidth = 3, mazeHeight = 3;
    let dimensions = {
      rows: mazeHeight,
      columns: mazeWidth,
      testing: properties.testing
    }
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

  static buildAdjacencyGraph(properties: {rows: number, columns: number}) {
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
        if (c > 0)
        {
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
  static buildMaze(properties: {
    rows: number, columns: number, useDemoGraph: boolean, testing?: boolean
  }) {
    let { useDemoGraph } = properties;
    if (useDemoGraph) {
      Graph.buildDemoGraph(properties);
    } else {
      Graph.buildAdjacencyGraph(properties);
    }
    let adj = Graph.adjacencyGraph;
    let hasCheaperEdge = (u, v) => {
      return v.data.cost - u.data.cost;
    }
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
   * Computes the furthest node from a given vertex
   * @param src vertex index to find furthest node from
   * @returns vertex index of furthest node
   */
  static getFurthestIndex(src: number) {
    let maze = Graph.mazeGraph;
    let v = src; // current node
    let stack = [v];
    let distance = new Map();
    distance.set(v, 0);
    let furthest = src;
    while (stack.length > 0) {
      v = stack.pop();
      ["up", "right", "down", "left"].forEach((dir) => {
        let n = Graph.getNeighborIndex(v, dir);
        if ((n !== null)
              && (maze.isNeighbor(Graph.getNode(v), Graph.getNode(n)))
              && (distance.get(n) === undefined)) {
          stack.push(n);
          let dist = distance.get(v) + 1;
          distance.set(n, dist);
          if (dist > distance.get(furthest))
            furthest = n;
        }
      });
    }
    return furthest;
  }

  /**
   * Determines the start and end of the maze
   */
  static prepareEndpoints() {
    // choose furthest from top left corner for finish
    let lastVertexIndex = Graph.getFurthestIndex(0);
    Graph.endVertex = Graph.getNode(lastVertexIndex);
    // choose further from finish for start
    let firstVertexIndex = Graph.getFurthestIndex(lastVertexIndex);
    Graph.startVertex = Graph.getNode(firstVertexIndex);
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
    }
    let index = 0;
    for (let i = 0; i < 2*mazeHeight-1; i++) {
      for (let j = 0; j < 2*mazeWidth-1; j++) {
        if ((i % 2 == 0) && (j % 2 == 0)) { // vertex tile
          let vertexHTML = `<div id="v${index}" class="maze-tile maze-vertex maze-path"></div>`;
          mazeHTML += vertexHTML;
          index++
        } else {
          if (i % 2 == 0) { // horizontal edge tile
            let src = index - 1;
            let tgt = index;
            mazeHTML += makeEdgeHTML(src, tgt);
          } else if (j % 2 == 0) { // vertical edge tile
            let tgt = index + (j / 2);
            let src = tgt - mazeWidth;
            mazeHTML += makeEdgeHTML(src, tgt);
          } else // gap
            mazeHTML += gapHTML;
        }
      }
    }
    // fill the maze with tiles
    $("#maze-grid").html(mazeHTML);
  }
}
