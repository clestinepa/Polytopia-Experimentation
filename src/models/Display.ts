import { AssetKeyBorder, assets } from "../assets.js";
import { Biome, Building, Resource, Size } from "../types.js";
import { MapGenerator } from "./Generator/MapGenerator.js";
import { City } from "./Simulator/City.js";
import { Map } from "./Simulator/Map.js";
import { State } from "./Simulator/State.js";
import { TileSimulator } from "./Simulator/TileSimulator.js";
import { Tile } from "./Tile.js";

export class Display {
  static default_asset: "field" = "field"; //name of the asset used to calculate height and width
  static ratio_ground = 0.63; //(in %) % of the ground coverage from the top of the default_asset
  static canvas_margin = 64; //(in px) margin of the canvas

  static offsetY: Partial<Record<Biome | Resource | Building, number>> = {
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

  canvas_html: HTMLCanvasElement;
  canvas: CanvasRenderingContext2D;

  map_size: Size;
  tile_height: number;
  tile_width: number;

  constructor(size: Size) {
    this.map_size = size;

    this.canvas_html = document.getElementById("canvas_html") as HTMLCanvasElement;
    this.canvas_html.width = window.innerWidth;
    this.canvas_html.height = window.innerHeight;
    this.canvas = this.canvas_html.getContext("2d") as CanvasRenderingContext2D;

    let default_image: HTMLImageElement = assets[Display.default_asset] ?? new Image();

    const max_height = this.canvas_html.height - Display.canvas_margin * 2;
    const max_width = this.canvas_html.width - Display.canvas_margin * 2;
    this.tile_height = max_height / (this.map_size * Display.ratio_ground);
    this.tile_width = (default_image.width * this.tile_height) / default_image.height;
    if (this.tile_width * this.map_size > max_width) {
      this.tile_width = max_width / this.map_size;
      this.tile_height = (default_image.height * this.tile_width) / default_image.width;
    }
  }

  _get_x(tile: Tile) {
    let posX = tile.col - tile.row;
    let deltaX = (posX * this.tile_width) / 2;
    return this.canvas_html.width / 2 - this.tile_width / 2 + deltaX;
  }
  _get_y(tile: Tile) {
    let posY = tile.col + tile.row - (this.map_size - 1);
    let deltaY = (posY * (this.tile_height * Display.ratio_ground)) / 2;
    return this.canvas_html.height / 2 - this.tile_height / 2 + deltaY;
  }
  _draw(tile: Tile, image: HTMLImageElement, offsetY = 0) {
    this.canvas.drawImage(
      image,
      this._get_x(tile),
      this._get_y(tile) - offsetY * this.tile_height,
      this.tile_width,
      (image.height * this.tile_width) / image.width
    );
  }

  _drawTiles(map: MapGenerator | Map) {
    for (let tile of map.tiles) {
      if (map instanceof Map && !tile.known)
        this._draw(tile, assets["clouds"] ?? new Image()); //clouds when start simulation
      else {
        this._draw(tile, assets["field"] ?? new Image());
        if (tile.biome !== "field") this._draw(tile, assets[tile.biome] ?? new Image(), Display.offsetY[tile.biome]);
        if (tile instanceof TileSimulator && tile.building) {
          this._draw(tile, assets[tile.building] ?? new Image(), Display.offsetY[tile.building]);
        } else {
          if (tile.resource) this._draw(tile, assets[tile.resource] ?? new Image(), Display.offsetY[tile.resource]);
        }
      }
    }
  }

  _drawBorderCities(cities: City[]) {
    cities.forEach((city) => {
      const tileSet = new Set(city.tiles.map((t) => `${t.row},${t.col}`));
      const bordersTile: { dr: -1 | 0 | 1; dc: -1 | 0 | 1; border: AssetKeyBorder }[] = [
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
            this._draw(tile, assets.borders ? assets.borders[border] ?? new Image() : new Image());
          }
        }
      }
    });
  }

  drawMap(map: MapGenerator | Map) {
    this.canvas.clearRect(0, 0, this.canvas_html.width, this.canvas_html.height);
    this._drawTiles(map);
    if (map instanceof Map) this._drawBorderCities(map.cities);
  }

  drawState(state: State) {
    this.drawMap(state.map);
    (document.getElementById("turn") as HTMLElement).innerHTML = state.turn.toString();
    (document.getElementById("populations") as HTMLElement).innerHTML = state.populations.toString();
    (document.getElementById("stars") as HTMLElement).innerHTML = state.stars.toString();
    (document.getElementById("stars_production") as HTMLElement).innerHTML = state.stars_production.toString();
  }
}
