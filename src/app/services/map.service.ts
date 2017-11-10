import { Injectable } from '@angular/core';
import { Map, MapboxOptions } from 'mapbox-gl';
import * as mapboxgl from 'mapbox-gl';
import VectorSource = mapboxgl.VectorSource;

@Injectable()
export class MapService {

  public token: String = 'pk.eyJ1IjoidW5kcC1kYXNoYm9hcmQiLCJhIjoiY2o4bjllc2MzMTdzdTJ3bzFiYmloa3VhZyJ9.XPd1v44RritVjBWqnBNvLg';
  public map: Map;
  public style: string = 'mapbox://styles/undp-dashboard/cj9hjb6j79y7h2rpceuoki95q';
  constructor() {
    (mapboxgl as any).accessToken = this.token;
  }

  createMap(mapId: string) {
    this.map = new Map({
      container: mapId,
      preserveDrawingBuffer: true,
      style: this.style,
      center: [13.5, 26],
      zoom: 1.2,
      maxBounds: [[-180, -90], [180, 90]]
    });
  }

}


/*
1280x800
center: [13.5, 1.5],
zoom: 1.2,
*/