/**
 * @jest-environment jsdom
 */
import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals';
import $ from "jquery";
(globalThis as any).$ = $;

import { Graph } from "../src/maze";
import { Player } from "../src/player";

function mockRect(el: HTMLElement, rect: { top: number, left: number, width: number, height: number }) {
  Object.defineProperties(el, {
    offsetLeft: { value: rect.left, configurable: true },
    offsetTop: { value: rect.top, configurable: true },
    offsetWidth: { value: rect.width, configurable: true },
    offsetHeight: { value: rect.height, configurable: true },
  });
  el.getBoundingClientRect = () => ({
    top: rect.top, left: rect.left, width: rect.width, height: rect.height,
    right: rect.left + rect.width, bottom: rect.top + rect.height,
    x: rect.left, y: rect.top, toJSON: () => ({}),
  } as DOMRect);
}

// Builds a deterministic 2x2 maze grid where only v0-v1 and v1-v3 are
// connected (an "L" shape), so v0-v2 and v2-v3 are guaranteed blocked
// regardless of buildMaze's random edge weights.
function buildTestMaze() {
  Graph.buildAdjacencyGraph({ rows: 2, columns: 2 });
  Graph.mazeGraph = new Graph();
  const v = Graph.getNode;
  Graph.mazeGraph.insertEdge(v(0), v(1), 1);
  Graph.mazeGraph.insertEdge(v(1), v(3), 1);

  document.body.innerHTML = `
    <div id="play-space">
      <div id="viz"></div>
      <div id="player"></div>
      <div id="v0"></div>
      <div id="v1"></div>
      <div id="v2"></div>
      <div id="v3"></div>
    </div>
  `;
  mockRect(document.querySelector("#v0") as HTMLElement, { top: 0, left: 0, width: 50, height: 50 });
  mockRect(document.querySelector("#v1") as HTMLElement, { top: 0, left: 50, width: 50, height: 50 });
  mockRect(document.querySelector("#v2") as HTMLElement, { top: 50, left: 0, width: 50, height: 50 });
  mockRect(document.querySelector("#v3") as HTMLElement, { top: 50, left: 50, width: 50, height: 50 });
}

beforeEach(() => {
  Player.svg = "<svg data-cursor></svg>" as unknown as XMLDocument;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Player construction", () => {
  test("positions both the player and viz box at the spawn tile without throwing", () => {
    // regression test: the viz box must be fully set up before centerAt()
    // runs, or centering throws and aborts the rest of game init
    buildTestMaze();
    new Player({ spawnPoint: 0, vizSize: "Small", memory: false });

    const player = document.querySelector("#player") as HTMLElement;
    const viz = document.querySelector("#viz") as HTMLElement;
    expect(player.innerHTML).toContain("data-cursor");
    // v0 center is (25, 25). The player has no rect override, so jQuery's
    // outerWidth/outerHeight are 0 and centering lands exactly there. The
    // viz box (Small = 100x100) is already sized by the time centerAt()
    // runs, so it centers around the same point using its real size.
    expect(player.style.top).toBe("25px");
    expect(player.style.left).toBe("25px");
    expect(viz.style.top).toBe("-25px");
    expect(viz.style.left).toBe("-25px");
  });

  test("sizes the viz box according to vizSize", () => {
    buildTestMaze();
    new Player({ spawnPoint: 0, vizSize: "Medium", memory: false });

    const viz = document.querySelector("#viz") as HTMLElement;
    expect(viz.style.width).toBe("200px");
    expect(viz.style.height).toBe("200px");
  });

  test("sizes an Infinite viz box relative to the play space", () => {
    buildTestMaze();
    const playSpace = document.querySelector("#play-space") as HTMLElement;
    Object.defineProperties(playSpace, {
      clientWidth: { value: 300, configurable: true },
      clientHeight: { value: 100, configurable: true },
    });

    new Player({ spawnPoint: 0, vizSize: "Infinite", memory: false });

    const viz = document.querySelector("#viz") as HTMLElement;
    expect(viz.style.width).toBe("600px"); // 2 * max(300, 100)
    expect(viz.style.height).toBe("600px");
  });
});

describe("attemptMove", () => {
  test("does not move when there is no maze edge in that direction", () => {
    buildTestMaze();
    const player = new Player({ spawnPoint: 0, vizSize: "Small", memory: false });
    jest.spyOn(Player.prototype, "pointTo").mockImplementation(() => {});
    const moveSpy = jest.spyOn(Player.prototype, "moveTo").mockImplementation(() => {});

    player.attemptMove("down"); // v0 -> v2 is grid-adjacent but not a maze edge

    expect(player.data.index).toBe(0);
    expect(moveSpy).not.toHaveBeenCalled();
  });

  test("moves when a maze edge exists in that direction", () => {
    buildTestMaze();
    const player = new Player({ spawnPoint: 0, vizSize: "Small", memory: false });
    jest.spyOn(Player.prototype, "pointTo").mockImplementation(() => {});
    const moveSpy = jest.spyOn(Player.prototype, "moveTo").mockImplementation(() => {});

    player.attemptMove("right"); // v0 -> v1 is connected

    expect(player.data.index).toBe(1);
    expect(moveSpy).toHaveBeenCalledWith(Graph.getNode(1));
  });

  test("does not move out of bounds", () => {
    buildTestMaze();
    const player = new Player({ spawnPoint: 0, vizSize: "Small", memory: false });
    jest.spyOn(Player.prototype, "pointTo").mockImplementation(() => {});
    const moveSpy = jest.spyOn(Player.prototype, "moveTo").mockImplementation(() => {});

    player.attemptMove("up"); // v0 is already on the top row

    expect(player.data.index).toBe(0);
    expect(moveSpy).not.toHaveBeenCalled();
  });
});

describe("collidesWith", () => {
  test("detects AABB overlap and non-overlap", () => {
    buildTestMaze();
    const player = new Player({ spawnPoint: 0, vizSize: "Small", memory: false });
    // give the player a small 20x20 box centered inside v0 (0,0,50,50)
    mockRect(document.querySelector("#player") as HTMLElement, { top: 10, left: 10, width: 20, height: 20 });

    expect(player.collidesWith(Graph.getNode(0))).toBe(true); // overlaps its own tile, v0
    expect(player.collidesWith(Graph.getNode(3))).toBe(false); // v3 (50,50,50,50) is out of range
  });
});

describe("canSee", () => {
  test("reports elements inside and outside the visibility box", () => {
    buildTestMaze();
    const player = new Player({ spawnPoint: 0, vizSize: "Small", memory: false });
    mockRect(document.querySelector("#viz") as HTMLElement, { top: 0, left: 0, width: 60, height: 60 });

    const inView = document.createElement("div");
    document.body.appendChild(inView);
    mockRect(inView, { top: 10, left: 10, width: 10, height: 10 });

    const outOfView = document.createElement("div");
    document.body.appendChild(outOfView);
    mockRect(outOfView, { top: 500, left: 500, width: 10, height: 10 });

    expect(player.canSee(inView)).toBe(true);
    expect(player.canSee(outOfView)).toBe(false);
  });
});

describe("checkVisibility", () => {
  test("toggles visible/seen classes based on the viz box", () => {
    buildTestMaze();
    const player = new Player({ spawnPoint: 0, vizSize: "Small", memory: true });
    mockRect(document.querySelector("#viz") as HTMLElement, { top: 0, left: 0, width: 40, height: 40 });

    const v0 = document.querySelector("#v0") as HTMLElement; // inside viz box
    v0.classList.add("maze-tile");
    const v3 = document.querySelector("#v3") as HTMLElement; // outside viz box
    v3.classList.add("maze-tile");

    player.checkVisibility();

    expect(v0.classList.contains("visible")).toBe(true);
    expect(v0.classList.contains("seen")).toBe(true);
    expect(v3.classList.contains("visible")).toBe(false);
  });
});
