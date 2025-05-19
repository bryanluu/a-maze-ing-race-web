import { VertexTile, TileData, Graph, Position } from "./maze.js";
import { Player } from "./player.js";

export class Artifact extends VertexTile {
  id: string;
  data: TileData;
  static svg: XMLDocument;
  static activeArtifacts = {};

  constructor(tileIndex: number) {
    let tile = Graph.getNode(tileIndex);
    let id = `a${tileIndex}`;
    super(id, tileIndex);
    let artifactHTML = `<div id="${id}" class="artifact tile-object">${Artifact.svg}</div>`;
    let artifactsNode = document.querySelector("#artifacts");
    artifactsNode.innerHTML += artifactHTML;
    this.centerAt(tile.center());
    Artifact.activeArtifacts[id] = this;
    tile.data.artifact = this;
  }

  /**
   *
   * @param {Position} position
   *
   * Moves the artifact's center to the position coordinates: {top, left}
   */
  centerAt(position: Position ) {
    let ref = this.ref();
    let newPosition = {
      "top": position.top - (ref.outerHeight() / 2),
      "left": position.left - (ref.outerWidth() / 2)
    };
    ref.css(newPosition);
  }
}
