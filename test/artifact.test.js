/**
 * @jest-environment jsdom
 */
import { expect, test, beforeEach } from '@jest/globals';
import $ from "jquery";
globalThis.$ = $;
import { Graph } from "../src/maze";
import { Artifact } from "../src/artifact";
function mockRect(el, rect) {
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
    });
}
beforeEach(() => {
    Artifact.svg = "<svg data-star></svg>";
    Artifact.activeArtifacts = {};
    Graph.buildAdjacencyGraph({ rows: 1, columns: 2 });
    document.body.innerHTML = `
    <div id="artifacts"></div>
    <div id="v0"></div>
    <div id="v1"></div>
  `;
    mockRect(document.querySelector("#v0"), { top: 0, left: 0, width: 50, height: 50 });
    mockRect(document.querySelector("#v1"), { top: 0, left: 50, width: 50, height: 50 });
});
test("creates a positioned DOM element at the tile's center", () => {
    new Artifact(1);
    const el = document.querySelector("#a1");
    expect(el).not.toBeNull();
    expect(el.innerHTML).toContain("data-star");
    // v1 is (0, 50, 50, 50) -> center (25, 75); artifact ref has no rect
    // override, so outerWidth/outerHeight are 0 and centering lands exactly there
    expect(el.style.top).toBe("25px");
    expect(el.style.left).toBe("75px");
});
test("registers itself as active and links back to the tile", () => {
    const artifact = new Artifact(1);
    expect(Artifact.activeArtifacts["a1"]).toBe(artifact);
    expect(Graph.getNode(1).data.artifact).toBe(artifact);
});
test("supports multiple simultaneous artifacts", () => {
    new Artifact(0);
    new Artifact(1);
    expect(document.querySelector("#a0")).not.toBeNull();
    expect(document.querySelector("#a1")).not.toBeNull();
    expect(Object.keys(Artifact.activeArtifacts).sort()).toEqual(["a0", "a1"]);
});
//# sourceMappingURL=artifact.test.js.map