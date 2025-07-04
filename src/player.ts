import { error } from "jquery";
import { VertexTile, TileData, Graph, Position } from "./maze.js"

const VIZ_SIZE_SMALL = 100; // px
const VIZ_SIZE_MEDIUM = 200; // px
const VIZ_SIZE_LARGE = 500; // px

export class Player extends VertexTile {
  id: string = "player"; // pseudo-constant id
  data: TileData; // contains metadata about player element
  vizBox: HTMLElement; // the visibility box for the player
  vizSize: string; // the size setting for the vizBox
  memory: boolean; // whether the player remembers what's seen
  static instance: Player;

  constructor(options) {
    let id = "player";
    super(id, options.spawnPoint);
    this.data.collected = 0;
    // load the image and position at the startIndex's node
    this.ref().load("public/assets/cursor-vertical.svg", () => {
      this.centerAt(Graph.getNode(options.spawnPoint).center());
    });
    Player.instance = this;
    // create the viz box
    this.vizBox = document.querySelector("#viz");
    let vizSize = null;
    switch (options.vizSize) {
      case "Small":
        vizSize = VIZ_SIZE_SMALL;
        break;
      case "Medium":
        vizSize = VIZ_SIZE_MEDIUM;
        break;
      case "Large":
        vizSize = VIZ_SIZE_LARGE;
        break;
      case "Infinite":
        const playWindow = document.querySelector("#play-space");
        vizSize = 2 * (playWindow.clientWidth > playWindow.clientHeight ?
                        playWindow.clientWidth : playWindow.clientHeight);
        break;
      default:
        console.error(`Invalid size: "${vizSize}"`)
        return;
    }
    this.vizSize = options.vizSize;
    this.vizBox.style.width = `${vizSize}px`;
    this.vizBox.style.height = `${vizSize}px`;
    this.memory = options.memory;
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
    // center the viz square
    let viz = $(`#${this.vizBox.id}`);
    viz.css({
      "top": position.top - (viz.outerHeight() / 2),
      "left": position.left - (viz.outerWidth() / 2)
    });
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

  /**
   *
   * @param other - the other VertexTile to check within view
   */
  canSee(other: HTMLElement) {
    const vizDim = {
      left: this.vizBox.offsetLeft,
      top: this.vizBox.offsetTop,
      width: this.vizBox.offsetWidth,
      height: this.vizBox.offsetHeight
    };
    const otherDim = {
      left: other.offsetLeft,
      top: other.offsetTop,
      width: other.offsetWidth,
      height: other.offsetHeight
    };
    // use algorithm from:
    // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    if ((vizDim.left < otherDim.left + otherDim.width) &&
        (vizDim.left + vizDim.width > otherDim.left) &&
        (vizDim.top < otherDim.top + otherDim.height) &&
        (vizDim.top + vizDim.height > otherDim.top)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks whether other objects come into view
   */
  checkVisibility() {
    document.querySelectorAll(".artifact, .maze-tile").forEach((obj) => {
      let other = (obj as HTMLElement);
      if (this.canSee(other)) {
        other.classList.add("visible");
        if (this.memory)
          other.classList.add("seen");
      } else {
        other.classList.remove("visible");
      }
    });
  }
}
