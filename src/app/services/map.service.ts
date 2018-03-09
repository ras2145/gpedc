import { titles } from './../titles';
import { Injectable } from '@angular/core';
import { Map, MapboxOptions, GeoJSONSource } from 'mapbox-gl';
import * as mapboxgl from 'mapbox-gl';
import VectorSource = mapboxgl.VectorSource;

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/bindCallback';
import { WebService } from './web.service';
import { SERVER } from '../server.config';
import { layers } from '../layers';

declare var cartodb: any;

@Injectable()
export class MapService {

  public token: String = 'pk.eyJ1IjoidW5kcC1kYXNoYm9hcmQiLCJhIjoiY2o4bjllc2MzMTdzdTJ3bzFiYmloa3VhZyJ9.XPd1v44RritVjBWqnBNvLg';
  public _map: Map;
  public style: string = 'mapbox://styles/undp-dashboard/cja98kikh1amc2spohea7voeh';
  private twoCountriesFilter = ['in', 'country'];
  private _firstCountry = '';
  private _secondCountry = '';
  private layers = layers;
  private titles = titles;

  private bounds = [
    [-220.04728500751165, -84.68392799015035], [220.04728500751165, 84.68392799015035]
  ];
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
  private mapDefault = {
    tab1: {
      center: [19, 37],
      zoom: 1.3
    },
    tab2: {
      center: [-33, 37],
      zoom: 1.3
    },
    tab3: {
      center: [-65, 37],
      zoom: 1.3
    }
  };
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
      center: this.mapDefault.tab1.center,
      zoom: this.mapDefault.tab1.zoom,
      // [[-220, -90], [220, 90]]
      maxBounds: this.bounds,
      maxZoom: 8,
      minZoom: 0.9,
      pitch: 0
    });
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
  }
  switchMapCenter(index) {
    console.log(this.mapDefault[index]);
    this.map.setCenter(this.mapDefault[index].center);
    this.map.setZoom(this.mapDefault[index].zoom);
  }
  mapSetCenter(center) {
    this.map.setCenter(center);
  }
  mapFitBounds(bounds) {
    this.map.fitBounds(bounds, {
      padding: {top: 75, bottom: 70, left: 50, right: 50}
      //85,30
    });
    // this.map.fitBounds(bounds);
  }

  onLoad(cb: Function) {
    if (this.map.isStyleLoaded()) {
      cb();
    } else {
      setTimeout(() => {
        this.onLoad(cb);
      }, 1000);
    }
  }

  // build(geojson: any) {
  //   this.map.addSource('countries', {
  //     "type": "geojson",
  //     "data": geojson
  //   });
  //   this.buildLayers();
  // }
  update(geojson: any) {
    let source: GeoJSONSource;
    source = this.map.getSource('countries') as GeoJSONSource;
    if (source) {
      source.setData(geojson);
    }
  }

  buildVectorSource(tiles: any) {
    this.map.addSource('countries', {
      "type": "vector",
      "tiles": tiles
    });
    this.buildLayers();
  }

  buildLayers() {
    if (this.map.getLayer('country-fills')) {
      this.map.removeLayer('country-fills');
    }
    if (this.map.getLayer('country-fills-click')) {
      this.map.removeLayer('country-fills-click');
    }
    if (this.map.getLayer('country-borders')) {
      this.map.removeLayer('country-borders');
    }
    this.map.addLayer({
      "id": "country-fills",
      "type": "fill",
      "source": "countries",
      "source-layer": "layer0",
      "layout": {},
      "paint": {
        "fill-color": "#F07848",
        "fill-opacity": 0.5
      },
    });
    this.map.addLayer({
      "id": "country-fills-click",
      "type": "fill",
      "source": "countries",
      "source-layer": "layer0",
      "layout": {},
      "paint": {
        "fill-color": "#b22c29",
        "fill-opacity": 0.25
      },
      filter: ['in', 'country']
    });
    this.map.addLayer({
      "id": "country-borders",
      "type": "line",
      "source": "countries",
      "source-layer": "layer0",
      "paint": {
        "line-opacity": 0.25,
        "line-color": "#000000"
      }
    });
  }

  updateVectorSource(tiles: any) {
    if (this.map.getSource('countries')) {
      this.map.removeSource('countries');
    }
    this.buildVectorSource(tiles);
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
    console.log('click');
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
    if (this.filterOneCountry.includes(country, 3)) {
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
    const query = SERVER.GET_QUERY(`select * from "${SERVER.USERNAME}"."${SERVER.GPEDC_SCREENS_1_2_WITHOUT_GEOMETRY}"`);
    return this.webService.get(query).map(ans => {
      return ans.json().rows;
    });
  }
  getPartners(): Observable<any> {
    const query = SERVER.GET_QUERY(`select * from "${SERVER.USERNAME}".${SERVER.PARTNER_TABLE} order by partner`, false);
    return this.webService.get(query).map(res => res.json().rows);
  }
  getVectorTilesOptions(sql: string) {
    const tilesOptions = {
      user_name: SERVER.USERNAME,
      sublayers: [{
        sql: sql,
        cartocss: '#layer { polygon-fill: #555000; }'
      }]
    };
    return tilesOptions;
  }
  getCountriesYearQuery(year: string, categories: any, partnerType: string): string {
    let sql = `SELECT * FROM "${SERVER.USERNAME}" .${SERVER.GPEDC_SCREENS_1_2} WHERE yr${year} = true`;
    sql = sql + this.getDevPartCondition(categories, partnerType) + (year === '2016' ? ' AND (CARTODB_ID != 76)' : '' ) + (year === '2016' && partnerType === 'partcntry' ? ' AND country != \'Mexico\' ' : ' ');
    return sql;
  }
  getDevPartCondition(categories: any, partnerType: string) {
    const countrydest1 = ' AND (CARTODB_ID != 142)'; // paises no se filtra.
    const countrydest2 = ' AND (CARTODB_ID != 33)'; // pais no se filtra.
    //const countrydest3 = ' AND (CARTODB_ID != 76)'; // pais no se filtra.
    let res = ' AND ( ';
    for ( const cat of categories) {
      for (const sub of cat.subcategories) {
        if ( partnerType === 'devpart') {
          if (sub.devpart !== '') {
            res += ' ' + sub.devpart + '::text != \'9999\'  OR';
          }
        } else {
          if (sub.partcntry !== '') {
            res += ' ' + sub.partcntry + '::text != \'9999\'  OR';
          }
        }
      }
      if ( partnerType === 'devpart') {
        if (cat.devpart !== '') {
          res += ' ' + cat.devpart + '::text != \'9999\' OR';
        }
      } else {
        if (cat.partcntry !== '') {
          res += ' ' + cat.partcntry + '::text != \'9999\'  OR';
        }
      }
    }

    res = res.substring(0, res.length - 2);
    res += ') '  + countrydest1 + countrydest2 ;
    return res;
  }
  /*getCountriesYearGeoJSON(year: string): Observable<any> {
    const sql = this.getCountriesYearQuery(year); 
    const query = SERVER.GET_QUERY(sql, true);
    return this.webService.get(query).map(ans => {
      return ans.json();
    });
  }*/
  mapTiles(tilesUrl, error) {
    if (tilesUrl == null) {
      console.log('error: ', error.errors.join('\n'));
      throw error;
    }
    const tilesUrls = [];
    for (const tile of tilesUrl.tiles) {
      tilesUrls.push(tile.split('{s}.').join('').split('.png?').join('.mvt?').split('?cache_policy=persist').join(''));
    }
    console.log('url template is ', tilesUrls);
    return tilesUrls;
  }
  getCountriesYearVectorUrl(year: string, categories: any, partnerType: string): Observable<any> {
    const sql = this.getCountriesYearQuery( year, categories, partnerType );
    const tilesOptions = this.getVectorTilesOptions(sql);
    const observable: any = Observable.bindCallback(cartodb.Tiles.getTiles, this.mapTiles);
    return observable(tilesOptions);
  }
  TypeDataFilterIndicator(category?, year?, indicatorType?) {
    let completeQuery = '';
    let notAvailable = '';
    let anyColumn = '';
    const indicatorTypeQuery = '';
    for (const t of this.titles) {
      if (t.year === year) {
        for (const i of t.categories) {
          if (i.id === category.id) {
            for (const j of i.subcategories) {
              completeQuery = completeQuery + ' OR ' + j[indicatorType] + ' IS NOT NULL ';
              notAvailable = notAvailable + ' OR ' + j[indicatorType] + '::text != \'9999\'';
              anyColumn = anyColumn + ' OR ' + j[indicatorType] + '::text != \'\'';
            }
          }
        }
      }
    }
    const dataAvailable = notAvailable.slice(3).trim();
    const dataAny = anyColumn.slice(3).trim();
    const dataQuery = completeQuery.slice(3).trim();
    indicatorType = ' AND (' + dataQuery + ') AND ' + '(' + dataAvailable + ') AND ' + '(' + dataAny + ')';
    return indicatorType;
  }
  queryGlobalDataOfIndicatorType(indicator?: string, region?: string, incomeGroup?: string, countryContext?: string, year?: string, category?: any): string {
    let sql = `SELECT * FROM "${SERVER.USERNAME}" .${SERVER.GPEDC_SCREENS_1_2}`;
    let where = '';
    if (year != null && year !== '') {
      where = where + `yr${year}` + ' = true';
    }
    if (indicator !== null && indicator !== '') {
      if (where !== '') {
        where = where + ' AND ';
      }
      where = where + ' ' + indicator + ' IS NOT NULL ';
    }
    if (region != null && region !== '') {
      if (where !== '') {
        where = where + ' AND ';
      }
      where = where + " region = '" + region + "' ";
    }
    if (incomeGroup !== null && incomeGroup !== '') {
      if (where !== '') {
        where = where + ' AND ';
      }
      where = where + " inc_group = '" + incomeGroup + "' ";
    }
    if (countryContext != null && countryContext != '') {
      if (where != '') {
        where = where + ' AND ';
      }
      where = where + ' ' + countryContext + " = true";
    }
    if (where != '') {
      sql = sql + ' WHERE ' + where;
    }
    return sql;
  }
  // tslint:disable-next-line:max-line-length
  getIndicatorFilterQuery(indicator?: string, region?: string, incomeGroup?: string, countryContext?: string, year?: string, category?: any, indicatorType?): string {
    let sql = '';
    let globalData = '';
    if ((indicator === '')) {
      sql = this.queryGlobalDataOfIndicatorType(indicator, region, incomeGroup, countryContext, year, category);
      globalData = this.TypeDataFilterIndicator(category, year, indicatorType);
      sql = sql + globalData;
    } else {
      sql = this.queryGlobalDataOfIndicatorType(indicator, region, incomeGroup, countryContext, year, category);
    }
    return sql;
  }
  // tslint:disable-next-line:max-line-length
  getIndicatorFilterGeoJSON(indicator?: string, region?: string, incomeGroup?: string, countryContext?: string, year?: string, partnerType?): Observable<any> {
    const sql = this.getIndicatorFilterQuery(indicator, region, incomeGroup, countryContext, year, partnerType);
    const query = SERVER.GET_QUERY(sql, true);
    return this.webService.get(query).map(ans => {
      return ans.json();
    });
  }
  // tslint:disable-next-line:max-line-length
  getIndicatorFilterVectorUrl(indicator?: string, region?: string, incomeGroup?: string, countryContext?: string, year?: string, category?: any, indicatorType?): Observable<any> {
    const sql = this.getIndicatorFilterQuery(indicator, region, incomeGroup, countryContext, year, category, indicatorType);
    const tilesOptions = this.getVectorTilesOptions(sql);
    const observable: any = Observable.bindCallback(cartodb.Tiles.getTiles, this.mapTiles);
    return observable(tilesOptions);
  }
  sidsCountriesQuery(column, year, region, incomeGroup, countryContext, categories, partnerType) {

    const centerx = 'ST_X(ST_Centroid(the_geom)) as centerx';
    const centery = 'ST_Y(ST_Centroid(the_geom)) as centery';
    const bboxx1 = 'ST_X(ST_StartPoint(ST_BoundingDiagonal(the_geom))) as bboxx1';
    const bboxy1 = 'ST_Y(ST_StartPoint(ST_BoundingDiagonal(the_geom))) as bboxy1';
    const bboxx2 = 'ST_X(ST_EndPoint(ST_BoundingDiagonal(the_geom))) as bboxx2';
    const bboxy2 = 'ST_Y(ST_EndPoint(ST_BoundingDiagonal(the_geom))) as bboxy2';
    const area = 'ST_Area(the_geom) as area';
    let sqlone: String = '';
    let where = '';
    if (year != null && year !== '') {
      where = where + `yr${year}` + " = true";
    }
    if (region != null && region !== '') {
      if (where !== '') {
        where = where + ' AND ';
      }
      where = where + " region = '" + region + "' ";
    }
    if (incomeGroup != null && incomeGroup != '') {
      if (where !== '') {
        where = where + ' AND ';
      }
      where = where + " inc_group = '" + incomeGroup + "' ";  
    }
    if (countryContext != null && countryContext != '') {
      if (where != '') {
        where = where + ' AND ';
      }
      where = where + ' ' + countryContext + " = true";
    }
    if (where != '') {
      sqlone =  where;
    }
    const partSQL = this.getDevPartCondition(categories, partnerType);
    // ---------------
    // tslint:disable-next-line:max-line-length
    const sql1 = SERVER.GET_QUERY(`SELECT ${centerx}, ${centery}, ${bboxx1}, ${bboxy1}, ${bboxx2}, ${bboxy2}, ${area}, country, sids FROM (SELECT country, (ST_Dump(the_geom)).geom as the_geom, sids FROM "${SERVER.USERNAME}"."${SERVER.GPEDC_SCREENS_1_2}" WHERE ${column} is not null and ${sqlone} ${partSQL}) as st_dump ORDER BY country`);
    const sql2 = SERVER.GET_QUERY(`SELECT ${centerx}, ${centery}, ${bboxx1}, ${bboxy1}, ${bboxx2}, ${bboxy2}, ${area}, country, sids FROM (SELECT country, (ST_Dump(the_geom)).geom as the_geom, sids FROM "${SERVER.USERNAME}"."${SERVER.GPEDC_SCREENS_1_2}" WHERE ${sqlone} ${partSQL}) as st_dump ORDER BY country`);
    const query = column ? sql1 : sql2;
    //console.log('QUERY', query);
    return this.webService.get(query).map(ans => {
      return ans.json().rows;
    });
  }

  resetLayer() {
    this.map.removeLayer('country-fills');
    if (!this.map.getSource('countries')) {
      return;
    }
    this.map.addLayer({
      'id': 'country-fills',
      'type': 'fill',
      'source': 'countries',
      'source-layer': 'layer0',
      'layout': {},
      'paint': {
        'fill-color': '#F07848',
        'fill-opacity': 0.5
      },
    });
  }
  zoomIn() {
    this.map.zoomIn();
  }
  zoomOut() {
    this.map.zoomOut();
  }
  paintForIndicator(category: any, subcategory: any, year: any, partnerType?: any) {
   // console.log('PAINT' , category, subcategory);
    this.map.removeLayer('country-fills');
    let indicator: any;
    let layer: any;
    let columnCat = '';
    let columnSub = '';
    if (partnerType === 'devpart') {
      columnCat = category.devpart;
      columnSub = subcategory ? subcategory.devpart : '';
    } else if (partnerType === 'partcntry') {
      columnCat = category.partcntry;
      columnSub = subcategory ? subcategory.partcntry : '';
    } else {
      columnCat = category.column;
      columnSub = subcategory ? subcategory.column : '';
    }
    console.log('columns', partnerType, columnCat, columnSub);
    if (!columnCat && !columnSub) {
      this.resetLayer();
    } else {
    // tslint:disable-next-line:prefer-const
    let layerone: any;
    if (subcategory != null) {
      // indicator = subcategory.column;
      indicator = columnSub;
      if (indicator.includes ('2016_2_1')) {
        console.log('2_1');
        console.log(indicator);
        layer = this.layers.indicator2_1;
        layer['paint']['fill-color'].property = indicator;
        layer['source-layer'] = 'layer0';
        this.map.addLayer(layer, 'waterway-label');
      }
      if (indicator.includes ('2016_2_2')) {
        console.log('2_2');
        console.log(indicator);
        layer = this.layers.indicator2_2;
        layer['paint']['fill-color'].property = indicator;
        layer['source-layer'] = 'layer0';
        this.map.addLayer(layer, 'waterway-label');
      }
      if (indicator.includes('2016_2_3') || indicator.includes('2016_2_4')) {
        console.log('2_3 % 2_4');
        console.log(indicator);
        layer = this.layers.indicator2_34;
        layer['paint']['fill-color'].property = indicator;
        layer['source-layer'] = 'layer0';
        this.map.addLayer(layer, 'waterway-label');
      }
      console.log('ID', category.id);
      if (category.id === '3') {
        console.log('3');
        console.log(indicator);
        layer = this.layers.indicator3;
        layer['paint']['fill-color'].property = indicator;
        layer['source-layer'] = 'layer0';
        this.map.addLayer(layer, 'waterway-label');
      }
      if (subcategory.type === 'text') {
        if (category.id === '4') {
          console.log('4');
          console.log(indicator);
          layer = this.layers.indicator4;
          layer['paint']['fill-color'].property = indicator;
          layer['source-layer'] = 'layer0';
          this.map.addLayer(layer, 'waterway-label');
          // layer gris
        } else {
          console.log('ELSE', this.layers);
          console.log(indicator);
          layer = this.layers.yesNo;
          layer['paint']['fill-color'].property = indicator;
          layer['source-layer'] = 'layer0';
          this.map.addLayer(layer, 'waterway-label');
        }
      }
      if (subcategory.type === 'percent') {
        console.log(category.id, 'CSECCONDCAT');
        console.log(indicator);
        layer = this.layers.percent;
        layer['paint']['fill-color'].property = indicator;
        layer['source-layer'] = 'layer0';
        this.map.addLayer(layer, 'waterway-label');
      }
    } else {
      indicator = columnCat;
      if (category.id === '9a') {
        console.log('9a');
        console.log(indicator);
        layer = this.layers.indicator9a;
        layer['paint']['fill-color'].property = indicator;
        layer['source-layer'] = 'layer0';
        this.map.addLayer(layer, 'waterway-label');
      }
      if (category.type === 'text') {
        if (category.id === '4') {
          console.log('4aaaa'); console.log(indicator);
          layer = this.layers.indicator4;
          layer['paint']['fill-color'].property = indicator;
          layer['source-layer'] = 'layer0';
          this.map.addLayer(layer, 'waterway-label');
        } else {
          console.log('else 4 '); console.log(indicator);
          layer = this.layers.yesNo;
          layer['paint']['fill-color'].property = indicator;
          layer['source-layer'] = 'layer0';
          this.map.addLayer(layer, 'waterway-label');
        }
      }
      if (category.type === 'percent') {
        console.log('percent'); console.log(indicator);
        layer = this.layers.percent;
        layer['paint']['fill-color'].property = indicator;
        layer['source-layer'] = 'layer0';
        this.map.addLayer(layer, 'waterway-label');
      }
    }
  }
  }
  filterNotNull(column: string) {
      this._map.setFilter('country-fills', ['!=', column, '']);
  }
  modalQuery (column_query, country) {
    // tslint:disable-next-line:max-line-length
    const query = SERVER.GET_QUERY(`select ${column_query} from "${SERVER.USERNAME}"."${SERVER.GPEDC_SCREENS_1_2}" where country like '${country}' `);
    return this.webService.get(query).map(ans => {
      // console.log("modalquery",ans);
      return ans.json().rows;
    });
  }
  iconIndicator_1_8(indicator) {
      let text = '<img src="assets/0001.png" > ';
    if (indicator === '1a') {
       // tslint:disable-next-line:max-line-length
       text = text + ' <img src="assets/' + 'icon17.svg" tooltip="Vivamus sagittis lacus vel augue laoreet rutrum faucibus." placement="right" > ';
      return text;
    } else if ( indicator === '8') {
       text = text + ' <img src="assets/' + 'icon5.svg" ' +
      // tslint:disable-next-line:max-line-length
      'tooltip="This indicator provides evidence to follow up and review of SDG target 5.c.1, which tracks the proportion of countries with systems to monitor and make public allocations for gender equality and women’s empowerment. " ' +
      'placement="right"> ';
      return text;
    } else {
      return '';
    }
  }
}


/*
1280x800
center: [13.5, 1.5],
zoom: 1.2,
*/
