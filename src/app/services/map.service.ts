import { Injectable } from '@angular/core';
import { Map, MapboxOptions } from 'mapbox-gl';
import * as mapboxgl from 'mapbox-gl';
import VectorSource = mapboxgl.VectorSource;

import { Observable } from 'rxjs/Observable';

import { WebService } from './web.service';
import { SERVER } from '../server.config';

@Injectable()
export class MapService {

  public token: String = 'pk.eyJ1IjoidW5kcC1kYXNoYm9hcmQiLCJhIjoiY2o4bjllc2MzMTdzdTJ3bzFiYmloa3VhZyJ9.XPd1v44RritVjBWqnBNvLg';
  public map: Map;
  public style: string = 'mapbox://styles/undp-dashboard/cj9hjb6j79y7h2rpceuoki95q';
  constructor(
    private webService: WebService
  ) {
    (mapboxgl as any).accessToken = this.token;
  }
  private filter=["in", "name"];
  private countries = SERVER.GET_QUERY('SELECT ST_ASGEOJSON(the_geom) geom, country FROM "undp-admin" .undp_countries');
  
  getMap(){
    return this.map;
  }
  createMap(mapId: string): Observable<any> {
    this.map = new Map({
      container: mapId,
      preserveDrawingBuffer: true,
      style: this.style,
      center: [13.5, 26],
      zoom: 1.2,
      maxBounds: [[-180, -90], [180, 90]]
    });
    return this.webService.get(this.countries).map(res => res.json().rows);
  }

  onLoading(cb: Function){
    this.map.on('load', cb);
  }
  build(geojson: any, name: any) {
    this.map.addSource('countries', {
      "type": "geojson",
      "data": geojson
    });

    this.map.addLayer({
      "id": "state-borders",
      "type": "line",
      "source": "countries",
      "layout": {},
    });
    this.map.addLayer({
      "id": "state-fills",
      "type": "fill",
      "source": "countries",
      "layout": {},
      "paint": {
        "fill-color": "#1E4CA9",
        "fill-opacity": 0.5
      },
    });
    this.map.addLayer({
      "id": "state-fills-hover",
      "type": "fill",
      "source": "countries",
      "layout": {},
      "paint": {
        "fill-color": "#627BC1",
        "fill-opacity": 1
      },
      "filter": this.filter
    });
  }
  pickCountry(ev: any) : boolean{
    const _this = this;
    let countryName=ev.features[0].properties.name;
    if (!_this.filter.includes(countryName)) {
      _this.filter=["in", "name", countryName];
      _this.map.setFilter('state-fills-hover', _this.filter);
      return true;
    } else {
      _this.filter=["in","name"];
      _this.map.setFilter('state-fills-hover', _this.filter);
      return false;
    }
  }

  mouseCountryHover(cb: Function){
    this.map.on('mousemove','state-fills', cb);
  }

  clickCountry(cb: Function){
    this.map.on('click','state-fills', cb);
  }
}


/*
1280x800
center: [13.5, 1.5],
zoom: 1.2,
*/