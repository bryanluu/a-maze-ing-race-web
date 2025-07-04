import { VertexTile, Graph } from "./maze.js";
export class Artifact extends VertexTile {
    constructor(tileIndex) {
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
    centerAt(position) {
        let ref = this.ref();
        let newPosition = {
            "top": position.top - (ref.outerHeight() / 2),
            "left": position.left - (ref.outerWidth() / 2)
        };
        ref.css(newPosition);
    }
}
Artifact.activeArtifacts = {};
//# sourceMappingURL=artifact.js.map