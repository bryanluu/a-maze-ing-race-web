/**
 * Implements a tile for the maze
 */
var Tile = /** @class */ (function () {
    function Tile(r, c) {
        this.r = r;
        this.c = c;
        this.row = r;
        this.column = c;
        var id = "maze-".concat(r, "-").concat(c);
        this.selector = "#" + id;
        this.html = "<div id=\"".concat(id, "\" class=\"maze-tile\"></div>");
        this.index = Tile.existingTiles.length;
        Tile.existingTiles.push(this);
    }
    Tile.existingTiles = []; // all existing tiles
    return Tile;
}());
