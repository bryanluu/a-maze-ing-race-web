import {describe, expect, test} from '@jest/globals';
import { MazeVertex, Graph } from "../src/maze";

test("adjacencyGraph is built correctly", () => {
  Graph.buildAdjacencyGraph(3, 3);

  const v = MazeVertex.getNode;
  const isConnected = (v1, v2) => {
    return Graph.adjacencyGraph.isNeighbor(v1, v2);
  };

  let i = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (c > 0)
        expect(isConnected(v(i), v(i-1))).toBe(true);
      if (r > 0)
        expect(isConnected(v(i), v(i-3))).toBe(true);
      i++;
    }
  }
});

test("Prim's algo is working correctly", () => {
  let mazeWidth = 3, mazeHeight = 3;
  const v = MazeVertex.getNode;
  Graph.buildMaze(mazeWidth, mazeHeight, true);
  const isConnected = (v1, v2) => {
    return Graph.mazeGraph.isNeighbor(v1, v2);
  };

  expect(isConnected(v(0), v(1))).toBe(false);
  expect(isConnected(v(1), v(2))).toBe(false);
  expect(isConnected(v(0), v(3))).toBe(true);
  expect(isConnected(v(1), v(4))).toBe(true);
  expect(isConnected(v(2), v(5))).toBe(true);
  expect(isConnected(v(3), v(4))).toBe(true);
  expect(isConnected(v(4), v(5))).toBe(true);
  expect(isConnected(v(3), v(6))).toBe(false);
  expect(isConnected(v(4), v(7))).toBe(true);
  expect(isConnected(v(5), v(8))).toBe(false);
  expect(isConnected(v(6), v(7))).toBe(true);
  expect(isConnected(v(7), v(8))).toBe(true);
});
