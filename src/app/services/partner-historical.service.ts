import { Injectable } from '@angular/core';
import { analysisData } from '../analysisData';
import { Indicator } from '../partner-historical/indicator.model';
import { Subindicator } from '../partner-historical/subindicator.model';
import { Year } from '../partner-historical/year.model';
import { SERVER } from '../server.config';
import { WebService } from './web.service';
import { categories } from '../partner-historical/devpartner-types';
import { column_devpartner } from '../partner-historical/devpartner-column';
@Injectable()
export class PartnerHistoricalService {

  years: Array<number>;

  constructor(private webService: WebService) {
    this.years = [2005, 2007, 2010, 2014, 2016];
  }
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  getFirstRow() {
    const query = SERVER.GET_QUERY(`SELECT * from ${SERVER.GPEDC_SCREENS_5} WHERE cartodb_id = 1`);
    return this.webService.get(query).map(res => res.json().rows[0]);
  }

  getAll() {
    return analysisData;
  }

  getYears() {
    return this.years;
  }

  getIndicatorsByYear(yearId): Array<Indicator> {
    const dataYear = analysisData[yearId];

    const indicators = new Array<Indicator>();
    for (const it1 of dataYear.data) {
      const indicator = new Indicator();
      indicator.id = it1.indicator;
      indicator.title = it1.titlepartner;
      indicator.dropdown = it1.dropdownpartner;
      indicator.type = it1.type;
      indicator.chartText = it1.charttext;
      indicator.autoselect = it1.autoselect === '' ? false : true;
      indicator.image = it1.image;
      const subindicators = new Array<Subindicator>();
      for (const it2 of it1.subdropdown) {
        const subindicator = new Subindicator();
        subindicator.id = it2.indicator;
        subindicator.title = it2.titlepartner;
        subindicator.type = it2.type;
        subindicator.subdropdown = it2.subdropdown;
        subindicator.chartText = it2.charttext;
        subindicator.autoselect = it2.autoselect === '' ? false : true;
        subindicator.image = it2.image;
        subindicators.push(subindicator);
      }
      indicator.subindicators = subindicators;
      indicators.push(indicator);
    }
    return indicators;
  }

  getDataByYear(yearId): Year {
    const data = new Year();
    data.year = analysisData[yearId].year;
    data.indicators = this.getIndicatorsByYear(yearId);
    return data;
  }

  getDevPartners() {
    return categories;
  }

  getColumn(devpartner) {
    const devpartners = column_devpartner.devpartner;
    const columns = column_devpartner.column;
    for (let i = 0; i < devpartners.length; i++) {
      if (devpartner === devpartners[i]) {
        return columns[i];
      }
    }
    return 'not found';
  }
  getChartData(year, indicator, devpartner) {
    const query = SERVER.GET_QUERY(`SELECT * FROM ${SERVER.GPEDC_SCREENS_5} WHERE development_partner = '${devpartner}' AND indicator = '${indicator}' AND year = '${year}'`);
    console.log(query);
    return this.webService.get(query).map(res => {
      res = res.json().rows[0];
      let ans = [];
      for (let key in res) {
        if (!this.isNumeric(res[key]) || (+res[key] < 0 || +res[key] > 1)) {
          delete res[key];
        } else {
          if (+res[key] > 1) {
            continue;
          }
          ans.push({label: key, value: (+res[key] * 100.0).toFixed(1), column: key});
        }
      }
      ans.sort((a, b) => {
        if (b.value === a.value) {
          return a.label.localeCompare(b.label);
        }
        return b.value - a.value;
      });
      console.log('ANS', ans);
      return ans;
    });
  }

  getSecondChartData(devpartner, indicator, country) {
    country = country.replace('\'', '\'\'');
    const column = this.getColumn(devpartner);
    const query = SERVER.GET_QUERY(`select year, ${column} as value from ${SERVER.GPEDC_SCREENS_4} where indicator = '${indicator}' and country = '${country}'`);
    console.log(query);
    return this.webService.get(query).map(res => {
      res = res.json().rows;
      console.log(res);
      return res;
    });
  }
}
