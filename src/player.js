import { VertexTile, Graph } from "./maze.js";
export class Player extends VertexTile {
    constructor(startIndex) {
        let id = "player";
        super(id, startIndex);
        this.id = "player"; // pseudo-constant id
        // load the image and position at the startIndex's node
        this.ref().load("public/assets/cursor-vertical.svg", () => {
            this.centerAt(Graph.getNode(startIndex).center());
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
     * @param {VertexTile} target
     *
     * Moves the player's center to the target vertex
     */
    moveTo(target) {
        let player = this.ref();
        if (player.hasClass("moving"))
            return;
        let position = target.center();
        let newPosition = {
            "top": position.top - (player.outerHeight() / 2),
            "left": position.left - (player.outerWidth() / 2)
        };
        player.addClass("moving");
        player.animate(newPosition, {
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
        player.addClass("rotating");
        // this keeps the angle within [0, 360)
        player.css("rotate", `${angle}deg`);
        player.animate({
            "rotate": `+=${(targetAngle - angle)}deg`
        }, {
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
    attemptMove(direction) {
        let maze = Graph.mazeGraph;
        let player = this.ref();
        if (player.hasClass("moving"))
            return;
        this.pointTo(direction);
        let startIndex = this.data.index;
        let newIndex = Graph.getNeighborIndex(startIndex, direction);
        // if newIndex is invalid, i.e. player would move out-of-bounds, stop
        if (!Graph.isValidIndex(newIndex))
            return;
        let src = Graph.getNode(startIndex);
        let tgt = Graph.getNode(newIndex);
        if (maze.isNeighbor(src, tgt)) {
            this.data.index = newIndex;
            this.moveTo(Graph.getNode(newIndex));
        }
    }
}
//# sourceMappingURL=player.js.map