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
  public style: string = 'mapbox://styles/undp-dashboard/cja98kikh1amc2spohea7voeh';
  private twoCountriesFilter = ['in', 'country'];
  private _firstCountry =  '';
  private _secondCountry = '';
  public get firstCountry() {
    return this._firstCountry;
  }
  public get secondCountry() {
    return this._secondCountry;
  }
  public set firstCountry(country) {
    this._firstCountry = country;
  }
  public set secondCountry(country) {
    this._secondCountry = country;
  }
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
      center: [19, 37],
      zoom: 1.2,
      maxBounds: [[-220, -90], [220, 90]],
      maxZoom: 5,
      pitch: 0
    });
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
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
    if (source) {
      source.setData(geojson);
    }
  }
  resize() {
    this.map.resize();
  }
  paintTwoClearOne(toClear) {
    if (toClear === 'first') {
      this.firstCountry = '';
    } else {
      this.secondCountry = '';
    }
    this.twoCountriesFilter = ['in', 'country', this.firstCountry, this.secondCountry];
    this.map.setFilter('country-fills-click', this.twoCountriesFilter);
  }
  paintTwoCountryClear() {
    this.firstCountry = '';
    this.secondCountry = '';
    this.twoCountriesFilter = ['in', 'country'];
    this.map.setFilter('country-fills-click', this.twoCountriesFilter);
  }
  paintTwoCountry(country, firstOrSecond) {
    if (firstOrSecond === 'bad') {
      if (this.twoCountriesFilter.includes(country)) {
        if (this.firstCountry === country) {
          this.firstCountry = '';
        } else {
          this.secondCountry = '';
        }
      }
      this.twoCountriesFilter = ['in', 'country', this.firstCountry, this.secondCountry];
      this.map.setFilter('country-fills-click', this.twoCountriesFilter);  
      return [this.firstCountry, this.secondCountry];
    }
    if (this.twoCountriesFilter.includes(country)) {
      if (this.firstCountry === country) {
        this.firstCountry = '';
      } else {
        this.secondCountry = '';
      }
      this.twoCountriesFilter = ['in', 'country', this.firstCountry, this.secondCountry];
    } else {
        if (firstOrSecond === 'first') {
          this.firstCountry = country;
        }
        else {
          this.secondCountry = country;
        }
        this.twoCountriesFilter = ['in', 'country', this.firstCountry, this.secondCountry];
    }
    this.map.setFilter('country-fills-click', this.twoCountriesFilter);
    return [this.firstCountry, this.secondCountry];
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
  allDataCountryQuery() {
    const query = SERVER.GET_QUERY(`select ${SERVER.COLUMS_OF_COUNTRIES} from "${SERVER.USERNAME}"."${SERVER.COUNTRY_TABLE}"`);
    return this.webService.get(query).map( ans => {
      return ans.json().rows;
    });
  }
  getPartners(): Observable <any> {
    const query = SERVER.GET_QUERY(`select * from "${SERVER.USERNAME}".${SERVER.PARTNER_TABLE} order by partner`, false);
    return this.webService.get(query).map( res => res.json().rows);
  }
  getCountriesYearGeoJSON(year: string): Observable<any> {
    let sql = `SELECT * FROM "${SERVER.USERNAME}" .${SERVER.COUNTRY_TABLE} WHERE UPPER(_${year}) = 'YES'`;
    let query = SERVER.GET_QUERY(sql, true);
    return this.webService.get(query).map(ans => {
      return ans.json();
    });
  }
  getIndicatorFilterGeoJSON(indicator?: string, region?: string, incomeGroup?: string, countryContext?: string, year?: string): Observable<any> {
    let sql = `SELECT * FROM "${SERVER.USERNAME}" .${SERVER.COUNTRY_TABLE}`;
    let where = '';
    if (year != null && year != '') {
      where = where + ' upper(' + `_${year}` + ") = 'YES'";
    }
    if (indicator != null && indicator != '') {
      if (where != '') {
        where = where + ' AND ';
      }
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
    return this.webService.get(query).map(ans => {
      return ans.json();
    });
  }
  paintForIndicator(category: any, subcategory: any, year: any) {
    let indicator: any;
    if (subcategory != null) {
      indicator = subcategory.column;
      if (subcategory.type === 'text') {
        this.map.addLayer({
          'id': category.id,
          'source': 'countries',
          'type': 'fill',
          'paint': {
              'fill-color': {
                  property: indicator,
                  type: 'categorical',
                  stops: [
                      ['Yes', '#1FAB9E'],
                      ['No', '#F16950']
                  ]
              },
              'fill-opacity': 0.75
          }
        }, 'waterway-label');
      } else if (subcategory.type === 'percent') {
        this.map.addLayer({
          'id': category.id,
          'source': 'countries',
          'type': 'fill',
          'paint': {
              'fill-color': {
                  property: indicator,
                  stops: [
                      [20, '#1FAB9E'],
                      [40, '#B1D781'],
                      [60, '#FAD02F'],
                      [80, '#F69229'],
                      [100, '#F16950']
                  ]
              },
              'fill-opacity': 0.75
          }
        }, 'waterway-label');
      }
    }
  }
}


/*
1280x800
center: [13.5, 1.5],
zoom: 1.2,
*/
