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
  public _map: Map;
  public style: string = 'mapbox://styles/undp-dashboard/cj9hjb6j79y7h2rpceuoki95q';
  private twoCountriesFilter = ['in', 'country'];
  constructor(
    private webService: WebService
  ) {
    (mapboxgl as any).accessToken = this.token;
  }
  private filterOneCountry = ['in', 'country'];
  getCountriesGeoJSON(): Observable<any> {
    const query = SERVER.GET_QUERY(`SELECT ST_ASGEOJSON(the_geom) geom, country FROM "${SERVER.USERNAME}" .${SERVER.COUNTRY_TABLE}`);
    console.log(query);
    return this.webService.get(query).map(ans => {
      console.log('ans ', ans);
      ans = ans.json();
      let geojson = {
        type: 'FeatureCollection',
        features: []
      };
      for (const item of ans.rows) {
        const feature = {
          type: 'Feature',
          geometry: JSON.parse(item.geom),
          properties: {
            country: item.country
          }
        };
        geojson.features.push(feature);
      }
      return geojson;
    });
  }
  get map() {
    return this._map;
  }
  set map(m) {
    this._map = m;
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

  onLoad(cb: Function) {
    this.map.on('load', cb);
  }

  build(geojson: any) {
    this.map.addSource('countries', {
      "type": "geojson",
      "data": geojson
    });

    this.map.addLayer({
      "id": "country-borders",
      "type": "line",
      "source": "countries",
      "layout": {},
    });
    this.map.addLayer({
      "id": "country-fills",
      "type": "fill",
      "source": "countries",
      "layout": {},
      "paint": {
        "fill-color": "#1E4CA9",
        "fill-opacity": 0.5
      },
    });
    this.map.addLayer({
      "id": "country-fills-click",
      "type": "fill",
      "source": "countries",
      "layout": {},
      "paint": {
        "fill-color": "#b22c29",
        "fill-opacity": 1
      },
      filter: ['in', 'country']
    });
  }
  paintTwoCountry(country) {
    if (this.twoCountriesFilter.includes(country)) {
      this.twoCountriesFilter.splice(this.twoCountriesFilter.indexOf(country), 1);
    } else if (this.twoCountriesFilter.length < 4 && !this.twoCountriesFilter.includes(country)) {
        this.twoCountriesFilter.push(country);
    }
    this.map.setFilter('country-fills-click', this.twoCountriesFilter);
    return this.twoCountriesFilter.slice(2, this.twoCountriesFilter.length);
  }
  applyFilters(tab) {
    if (tab !== 'tab3') {
      this.map.setFilter('country-borders', ['!in', 'country']);
      this.map.setFilter('country-fills', ['!in', 'country']);
    } else {
      this.map.setFilter('country-borders', ['in', 'country']);
      this.map.setFilter('country-fills', ['in', 'country']);
    }
  }
  paintOneCountry(country) {
    if (this.filterOneCountry.includes(country)) {
      this.filterOneCountry.pop();
      this.map.setFilter('country-fills-click', this.filterOneCountry);
      return false;
    } else {
      if (this.filterOneCountry.length > 2) {
        this.filterOneCountry.pop();
      }
      this.filterOneCountry.push(country);
      this.map.setFilter('country-fills-click', this.filterOneCountry);
      return country;
    }
  }
  resetClickLayer() {
    this.map.setFilter('country-fills-click', ['in', 'country']);
  }
  mouseCountryHover(cb: Function) {
    this.map.on('mousemove', 'country-fills', cb);
  }
  mouseLeave(cb: Function) {
    this.map.on('mouseleave', 'country-fills', cb);
  }
  clickCountry(cb: Function) {
    this.map.on('click', 'country-fills', cb);
  }
  getIndicatorCountry(country: any): Observable<any> {
    const query = SERVER.GET_QUERY(`select * from "undp-admin".undp_countries_copy where country='${country}'`);
    return this.webService.get(query).map( ans => {
      return ans.json().rows[0];
    });

  }
}


/*
1280x800
center: [13.5, 1.5],
zoom: 1.2,
*/
