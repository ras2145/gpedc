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
  getCountries(conditions?): Observable<any> {
    const query = SERVER.GET_QUERY(`SELECT DISTINCT country FROM ${SERVER.GPEDC_SCREENS_4_5} WHERE cartodb_id <> 1 ORDER BY country`);
    return this.webService.get(query).map(res => {
      console.log(res.json());
      return res.json().rows;
    });
  }
  getCharData(country, indicator, year) {
    const query = SERVER.GET_QUERY(`SELECT * FROM ${SERVER.GPEDC_SCREENS_4_5} WHERE country = '${country}' AND indicator = '${indicator}' AND year = '${year}'`);
    return this.webService.get(query).map(res => {
      res = res.json().rows[0];
      let ans = [];
      for (let key in res) {
        if (!this.isNumeric(res[key]) || (+res[key] < 0 || +res[key] > 1)) {
          delete res[key];
        } else {
          ans.push({label: key, value: +res[key]});
        }
      }
      ans.sort((a, b) => {
        return b.value - a.value;
      });
      console.log(ans);
      return ans;
    });
  }
}
