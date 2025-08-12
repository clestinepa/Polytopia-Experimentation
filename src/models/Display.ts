import { AssetKeyBorder, assets } from "../assets.js";
import { Biome, Building, Resource, Size } from "../types.js";
import { MapGenerator } from "./Generator/MapGenerator.js";
import { TileGenerator } from "./Generator/TileGenerator.js";
import { City } from "./Simulator/City.js";
import { Map } from "./Simulator/Map.js";
import { State } from "./Simulator/State.js";
import { Tile } from "./Simulator/Tile.js";

export class Display {
  static default_asset: "field" = "field"; //name of the asset used to calculate height and width
  static ratio_ground = 0.63; //(in %) % of the ground coverage from the top of the default_asset
  static canvas_margin = 64; //(in px) margin of the canvas
  static text_padding = 4; //(in px) margin of the canvas

  static elements = {
    turn: document.getElementById("turn") as HTMLElement,
    populations: document.getElementById("populations") as HTMLElement,
    stars: document.getElementById("stars") as HTMLElement,
    stars_production: document.getElementById("stars_production") as HTMLElement,
    points: document.getElementById("points") as HTMLElement,
    historic: document.getElementById("historic-display") as HTMLElement,
  };

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
  text_height: number;

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
    this.text_height = this.tile_height / 8;

    this.canvas.font = `${this.text_height}px "Josefin Sans", sans-serif`;
    this.canvas.textBaseline = "top";
  }

  _get_x(tile: TileGenerator | Tile) {
    let posX = tile.col - tile.row;
    let deltaX = (posX * this.tile_width) / 2;
    return this.canvas_html.width / 2 - this.tile_width / 2 + deltaX;
  }
  _get_y(tile: TileGenerator | Tile) {
    let posY = tile.col + tile.row - (this.map_size - 1);
    let deltaY = (posY * (this.tile_height * Display.ratio_ground)) / 2;
    return this.canvas_html.height / 2 - this.tile_height / 2 + deltaY;
  }
  _draw(tile: TileGenerator | Tile, image: HTMLImageElement, offsetY = 0) {
    this.canvas.drawImage(
      image,
      this._get_x(tile),
      this._get_y(tile) - offsetY * this.tile_height,
      this.tile_width,
      (image.height * this.tile_width) / image.width
    );
  }

  _drawCityName(city: City, tile: Tile) {
    const text = `${city.isCapital ? "👑 " : ""}${city.name} ⭐${city.stars_production}`;
    const textWidth = this.canvas.measureText(text).width;

    const rw = textWidth + Display.text_padding;
    const rh = this.text_height + Display.text_padding * 2;
    const x = this._get_x(tile) + this.tile_width / 2 - rw / 2;
    const y = this._get_y(tile) + (Display.ratio_ground / 2) * this.tile_height;

    this.canvas.fillStyle = "rgba(54, 226, 170, 0.5)";
    this.canvas.fillRect(x, y, rw, rh);

    this._toggleShadow();
    this.canvas.fillStyle = "white";
    this.canvas.fillText(text, x, y + Display.text_padding);
    this._drawUnderline(city.name, x, y + Display.text_padding);
    this._toggleShadow();
  }

  _toggleShadow() {
    if (this.canvas.shadowOffsetX !== 1) {
      this.canvas.shadowColor = "rgba(35, 28, 28, 0.8)";
      this.canvas.shadowBlur = 0;
      this.canvas.shadowOffsetX = 1;
      this.canvas.shadowOffsetY = 1;
    } else {
      this.canvas.shadowColor = "transparent";
      this.canvas.shadowBlur = 0;
      this.canvas.shadowOffsetX = 0;
      this.canvas.shadowOffsetY = 0;
    }
  }

  _drawUnderline(city_name: string, x: number, y: any) {
    const width_name = this.canvas.measureText(city_name).width;
    const margin_left = this.canvas.measureText("👑 ").width;

    const underlineY = y + this.text_height + 0.5;
    const underlineX = x + margin_left;
    this.canvas.strokeStyle = "white";
    this.canvas.lineWidth = 1;
    this.canvas.beginPath();
    this.canvas.moveTo(underlineX, underlineY);
    this.canvas.lineTo(underlineX + width_name, underlineY);
    this.canvas.stroke();
  }

  _drawTiles(map: MapGenerator | Map) {
    for (let tile of map.tiles) {
      if (map instanceof Map && !tile.known)
        this._draw(tile, assets["clouds"] ?? new Image()); //clouds when start simulation
      else {
        this._draw(tile, assets["field"] ?? new Image());
        if (tile.biome !== "field") this._draw(tile, assets[tile.biome] ?? new Image(), Display.offsetY[tile.biome]);
        if (tile instanceof Tile && tile.building) {
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

  _drawNames(cities: City[]) {
    cities.forEach((city) => {
      const c = city.tiles.find((t) => t.biome === "capital"); //TODO : add t.biome === "city"
      if (c) this._drawCityName(city, c);
    });
  }

  drawMap(map: MapGenerator | Map) {
    this.canvas.clearRect(0, 0, this.canvas_html.width, this.canvas_html.height);
    this._drawTiles(map);
    if (map instanceof Map) {
      this._drawBorderCities(map.cities);
      this._drawNames(map.cities);
    }
  }

  drawInfo(state: State) {
    Display.elements.turn.innerHTML = state.turn.toString();
    Display.elements.populations.innerHTML = state.populations.toString();
    Display.elements.stars.innerHTML = state.stars.toString();
    Display.elements.stars_production.innerHTML = state.stars_production.toString();
    Display.elements.points.innerHTML = state.points.toString();
  }

  drawHistoric(state: State, scrollHistoric: number) {
    Display.elements.historic.innerHTML = "";
    state.historic.actions.forEach((a, i) => {
      Display.elements.historic.innerHTML +=
        `<div class="action` +
        (state.historic.index === i ? " active" : "") +
        `"><p>${a.msg?.primary}</p>` +
        (a.msg?.secondary ? `<p>${a.msg?.secondary}</p></div>` : "</div>");
    });
    const search = Display.elements.historic.getElementsByClassName("active");
    const active = search.length === 0 ? undefined : (search[0] as HTMLElement);
    if (scrollHistoric === -1 && active)
      Display.elements.historic.scrollTo(0, active.offsetTop - Display.elements.historic.offsetTop);
    else Display.elements.historic.scrollTo(0, scrollHistoric);

    Array(...Display.elements.historic.children).forEach((a, i) => {
      a.addEventListener("click", () => {
        state.historic.goTo(i);
        this.drawState(state, Display.elements.historic.scrollTop);
      });
    });
  }

  drawState(state: State, scrollHistoric = -1) {
    this.drawMap(state.map);
    this.drawInfo(state);
    this.drawHistoric(state, scrollHistoric);
  }
}
