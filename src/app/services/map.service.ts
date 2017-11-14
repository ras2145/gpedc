import { Injectable } from '@angular/core';
import { Map, MapboxOptions } from 'mapbox-gl';
import * as mapboxgl from 'mapbox-gl';
import VectorSource = mapboxgl.VectorSource;

import { Observable } from 'rxjs/Observable';

import { WebService } from './web.service';

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
  private countries = 'https://undp-admin.carto.com/api/v2/sql?q=SELECT ST_ASGEOJSON(the_geom) geom, country FROM "undp-admin".undp_countries&api_key=e8c2ad6fa1cf884aa2287ff7a5f9ea5030224eab';

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


  build(mapa: any, name: any) {
    this.map.addSource('countries', {
      "type": "geojson",
      "data": mapa
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
  }

}


/*
1280x800
center: [13.5, 1.5],
zoom: 1.2,
*/