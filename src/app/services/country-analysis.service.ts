import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import { SERVER } from '../server.config';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class CountryAnalysisService {

  constructor(private webService: WebService) { }
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  getFirstRow() {
    const query = SERVER.GET_QUERY(`SELECT * from ${SERVER.GPEDC_SCREENS_4} WHERE cartodb_id = 1`);
    return this.webService.get(query).map(res => res.json().rows[0]);
  }
  getCountries(conditions?): Observable<any> {
    const query = SERVER.GET_QUERY(`SELECT DISTINCT country FROM ${SERVER.GPEDC_SCREENS_4} WHERE cartodb_id <> 1 ORDER BY country`);
    return this.webService.get(query).map(res => {
      console.log(res.json());
      return res.json().rows;
    });
  }
  getCharData(country, indicator, year) {
    const query = SERVER.GET_QUERY(`SELECT * FROM ${SERVER.GPEDC_SCREENS_4} WHERE country = '${country}' AND indicator = '${indicator}' AND year = '${year}'`);
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
          ans.push({label: key, value: +(+res[key] * 100).toFixed(1), column: key});
        }
      }
      ans.sort((a, b) => {
        if (b.value === a.value) {
          return a.label.localeCompare(b.label);
        }
        return b.value - a.value;
      });
      return ans;
    });
  }
  getSecondChartData(country, indicator, column) {
    const query = SERVER.GET_QUERY(`SELECT ${column} as value, year FROM ${SERVER.GPEDC_SCREENS_4} WHERE country = '${country}' AND indicator = '${indicator}'`);
    return this.webService.get(query).map(res => {
      return res.json().rows;
    });
  }
  getIndicators(country, year) {
    const query = SERVER.GET_QUERY(`SELECT indicator FROM ${SERVER.GPEDC_SCREENS_4} WHERE available='4' AND country='${country}' AND year = '${year}'`);
    return this.webService.get(query).map(res => res.json().rows);
  }
}
