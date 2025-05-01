import { VertexTile, TileData, Graph, Position } from "./maze.js"

export class Player extends VertexTile {
  id: string = "player"; // pseudo-constant id
  data: TileData; // contains metadata about player element
  static instance: Player;

  constructor(startIndex: number) {
    let id = "player";
    super(id, startIndex);
    this.data.collected = 0;
    // load the image and position at the startIndex's node
    this.ref().load("public/assets/cursor-vertical.svg", () => {
      this.centerAt(Graph.getNode(startIndex).center());
    });
    Player.instance = this;
  }

  /**
   *
   * @param {Position} position
   *
   * Moves the player's center to the position coordinates: {top, left}
   */
  centerAt(position: Position ) {
    let ref = this.ref();
    let newPosition = {
      "top": position.top - (ref.outerHeight() / 2),
      "left": position.left - (ref.outerWidth() / 2)
    };
    ref.css(newPosition);
  }

  /**
   * Updates the player's data and runs any relevant functions
   * @param newIndex - the new index to update to
   * @param newPosition - the new position to set player to
   */
  updatePosition(newIndex: number, newPosition: Position) {
    let player = this.ref();
    player.css(newPosition as any);
    // update the index position of player
    this.data.index = newIndex;
  }

  /**
   *
   * @param {VertexTile} target
   *
   * Moves the player's center to the target vertex
   */
  moveTo(target: VertexTile) {
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
      progress: () => {
        const el = document.querySelector(this.data.selector);
        // check collisions with other elements inside the target tile
        const targetTile = Graph.getNode(target.data.index);
        if (this.collidesWith(targetTile)) {
          const event = new CustomEvent("playercollide", {
            bubbles: true,
            detail: {
              type: "Tile",
              vertex: targetTile
            }
          });
          el.dispatchEvent(event);
        }
        const artifact = targetTile.data.artifact;
        if (artifact && this.collidesWith(artifact)) {
          const event = new CustomEvent("playercollide", {
            bubbles: true,
            detail: {
              type: "Artifact",
              vertex: artifact
            }
          });
          el.dispatchEvent(event);
        }
      },
      // this ensures the final resting position is the target
      complete: () => {
        player.removeClass("moving");
        this.updatePosition(target.data.index, newPosition);
        const event = new CustomEvent("playermove", {
          bubbles: true,
          detail: {
            lastVertex: Graph.getNode(this.data.index),
            newVertex: Graph.getNode(target.data.index)
          }
        });
        let el = document.querySelector(this.data.selector);
        el.dispatchEvent(event);
      },
      duration: 100, // quick movement
      easing: "linear"
    })
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
        if (angle === targetAngle)
          return; // don't emit event if nothing changed

        const event = new CustomEvent("playerrotate", {
          bubbles: true,
          detail: {
            lastAngle: angle,
            newAngle: targetAngle
          }
        });
        let el = document.querySelector(this.data.selector);
        el.dispatchEvent(event);
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

  /**
   *
   * @param other - the other VertexTile to check collision with
   */
  collidesWith(other: VertexTile) {
    const playerDim = this.dimensions();
    const otherDim = other.dimensions();
    // use algorithm from:
    // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    if ((playerDim.left < otherDim.left + otherDim.width) &&
        (playerDim.left + playerDim.width > otherDim.left) &&
        (playerDim.top < otherDim.top + otherDim.height) &&
        (playerDim.top + playerDim.height > otherDim.top)) {
      return true;
    } else {
      return false;
    }
  }
}
