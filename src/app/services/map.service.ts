import { Injectable } from '@angular/core';
import { Map, MapboxOptions, GeoJSONSource } from 'mapbox-gl';
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
  update(geojson: any) {
    let source: GeoJSONSource;
    source = this.map.getSource('countries') as GeoJSONSource;
    source.setData(geojson);
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
    const query = SERVER.GET_QUERY(`select * from "${SERVER.USERNAME}".undp_countries_copy where country='${country}'`);
    return this.webService.get(query).map( ans => {
      return ans.json().rows[0];
    });
  }
  getIndicatorFilterGeoJSON(indicator?: string, region?: string, incomeGroup?: string, countryContext?: string): Observable<any> {
    let sql = `SELECT * FROM "${SERVER.USERNAME}" .${SERVER.COUNTRY_TABLE}`
    let where = '';
    if (indicator != null && indicator != '') {
      where = where + ' ' + indicator + ' IS NOT NULL ';
    }
    if (region  != null && region != '') {
      if (where != '') {
        where = where + ' AND ';
      }
      where = where + " region = '" + region + "' ";
    }
    if (incomeGroup != null && incomeGroup != '') {
      if (where != '') {
        where = where + ' AND ';
      }
      where = where + " inc_group = '" + incomeGroup + "' ";
    }
    if (countryContext != null && countryContext != '') {
      if (where != '') {
        where = where + ' AND ';
      }
      where = where + ' upper(' + countryContext + ") = 'YES'";
    }
    if (where != '') {
      sql = sql + ' WHERE ' + where;
    }
    let query = SERVER.GET_QUERY(sql, true);
    console.log(query);
    return this.webService.get(query).map(ans => {
      return ans.json();
    });
  }
}


/*
1280x800
center: [13.5, 1.5],
zoom: 1.2,
*/
