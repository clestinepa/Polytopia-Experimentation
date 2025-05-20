import { assets } from "../assets.js";
import { MapGenerator } from "./Generator/MapGenerator.js";
import { City } from "./Simulator/City.js";
import { Map } from "./Simulator/Map.js";

export class Display {
  static default_asset = "field"; //name of the asset used to calculate height and width
  static ratio_ground = 0.63; //(in %) % of the ground coverage from the top of the default_asset
  static canvas_margin = 64; //(in px) margin of the canvas

  static offsetY = {
    //biome
    forest: 0.1,
    mountain: 0.25,
    capital: 0.3,
    lighthouse: 0.5,
    //building
    farm: 0.05,
    "mountain temple": 0.25,
    "forest temple": 0.1,
  };

  /** @type {HTMLCanvasElement} */
  canvas_html;
  /** @type {CanvasRenderingContext2D} */
  canvas;

  /** @type {Size} */
  map_size;
  /** @type {Number} */
  tile_height;
  /** @type {Number} */
  tile_width;

  /**
   * @param {Size} size
   */
  constructor(size) {
    this.map_size = size;

    this.canvas_html = document.getElementById("canvas_html");
    this.canvas_html.width = window.innerWidth;
    this.canvas_html.height = window.innerHeight;
    this.canvas = canvas_html.getContext("2d");

    /** @type {HTMLImageElement} */
    let default_image = assets[Display.default_asset];

    const max_height = this.canvas_html.height - Display.canvas_margin * 2;
    const max_width = this.canvas_html.width - Display.canvas_margin * 2;
    this.tile_height = max_height / (this.map_size * Display.ratio_ground);
    this.tile_width = (default_image.width * this.tile_height) / default_image.height;
    if (this.tile_width * this.map_size > max_width) {
      this.tile_width = max_width / this.map_size;
      this.tile_height = (default_image.height * this.tile_width) / default_image.width;
    }
  }

  _get_x(tile) {
    let posX = tile.col - tile.row;
    let deltaX = (posX * this.tile_width) / 2;
    return this.canvas_html.width / 2 - this.tile_width / 2 + deltaX;
  }
  _get_y(tile) {
    let posY = tile.col + tile.row - (this.map_size - 1);
    let deltaY = (posY * (this.tile_height * Display.ratio_ground)) / 2;
    return this.canvas_html.height / 2 - this.tile_height / 2 + deltaY;
  }
  _draw(tile, image, offsetY = 0) {
    this.canvas.drawImage(
      image,
      this._get_x(tile),
      this._get_y(tile) - offsetY * this.tile_height,
      this.tile_width,
      (image.height * this.tile_width) / image.width
    );
  }

  /**
   * @param {MapGenerator | Map} map
   */
  _drawTiles(map) {
    for (let tile of map.tiles) {
      if (map.cities && !tile.known) this._draw(tile, assets["clouds"]); //clouds when start simulation
      else {
        this._draw(tile, assets["field"]);
        if (tile.biome !== "field") this._draw(tile, assets[tile.biome], Display.offsetY[tile.biome]);
        if (tile.resource && !tile.building) this._draw(tile, assets[tile.resource], Display.offsetY[tile.resource]);
        if (tile.building) this._draw(tile, assets[tile.building], Display.offsetY[tile.building]);
      }
    }
  }

  /**
   * @param {City} cities
   */
  _drawBorderCities(cities) {
    cities.forEach((city) => {
      const tileSet = new Set(city.tiles.map((t) => `${t.row},${t.col}`));
      const bordersTile = [
        { dr: -1, dc: -1, border: "corner top" },
        { dr: +1, dc: +1, border: "corner bottom" },
        { dr: -1, dc: +1, border: "corner right" },
        { dr: +1, dc: -1, border: "corner left" },
        { dr: -1, dc: 0, border: "top" },
        { dr: +1, dc: 0, border: "bottom" },
        { dr: 0, dc: +1, border: "right" },
        { dr: 0, dc: -1, border: "left" },
      ];

      for (let tile of city.tiles) {
        for (let { dr, dc, border } of bordersTile) {
          const neighborKey = `${tile.row + dr},${tile.col + dc}`;
          if (!tileSet.has(neighborKey)) {
            this._draw(tile, assets.borders[border]);
          }
        }
      }
    });
  }

  /**
   * @param {MapGenerator | Map} map
   */
  drawMap(map) {
    this.canvas.clearRect(0, 0, canvas_html.width, canvas_html.height);
    this._drawTiles(map);
    if (map.cities) this._drawBorderCities(map.cities);
  }
}
