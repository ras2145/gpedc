import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import { countryComparison } from '../countryComparison';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { IOption } from '../lib/ng-select/option.interface.d';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from '../titles';
import { saveAs } from 'file-saver';
import { SERVER } from '../server.config';

@Injectable()
export class GenerateIndicatorsService {
  constructor(private webService: WebService) { }
  countrySelectors = [];
  titles;
  countriesQuery: any;
  categoriesNotNull = [];
  indicator: any;
  subIndicator: any;
  notFromTab: any;
  viewModal = true;
  modalRef: BsModalRef;
  year;
  countries: any;
  ngOnInit() {
    
  }
  allQuery () {
    const query = SERVER.GET_QUERY(`select * from "${SERVER.USERNAME}"."${SERVER.GPEDC_SCREENS_1_2}"`);
    return this.webService.get(query).map(ans => {
      return ans.json().rows;
    });
  }
  getLabelCountryFunction(indicator, typeOfCountry, comparer, query, isOrganization?: boolean) {
    // let aux = indicator.column;
    const countryName = comparer[typeOfCountry];
    if (!countryName || !indicator) {
      return '-';
    }
    const dataObject = query;
    const field = isOrganization ? 'partner' : 'country';
    const country = dataObject.filter((a) => {
      if (!a[field]) {
        return false;
      }
      return a[field].toLowerCase().trim() === countryName.toLowerCase().trim();
    })[0];
    let text = '';
    if (!country) {
      return '-';
    }
    const value = this.formatValue(indicator, country[indicator.partcntry]);
    if (indicator['subcategories']) {
      const val = (value.toString() !== '9999') ? value : 'Not Applicable';
      text = text + '<p>' + val   + '</p>';
    } else {
      const val = value.toString() !== '9999'? value : 'Not Applicable';
      text = text + '<p>' + val + '</p>';
    }
    if (text == null || text.trim() == 'null' || text.trim() == 'undefined') {
      return '-';
    }
    return text;
  }

  formatValue(indicator, oldValue) {
    let value = '';
    if (indicator.type === 'percent') {
      const previousValue = oldValue;
      oldValue = oldValue * 100;
      if (previousValue != '9999')  {
        value = (previousValue != null) ? (parseFloat(oldValue + '').toFixed(indicator.precision) + '%') : 'No data available';
      } else {
        value = 'Not Applicable';
      }
        
    } else if (indicator.type === 'number') {
      value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision)) : 'No data available';
    } else if (indicator.type === 'text') {
      value = oldValue ? oldValue : 'No data available';
    }
    return value;
  }

  exportCsvFunction(comparerExport, queryExport, model, isOrganization?: boolean) {
    const comparer = comparerExport;
    const first = isOrganization ? 'firstOrganization' : 'firstCountry';
    const second = isOrganization ? 'secondOrganization' : 'secondCountry';
    const lines = [];
    const headers = ['Indicator'];
    if (comparer[first] != '') {
      headers.push(comparer[first]);
    }
    if (comparer[second] != '') {
      headers.push(comparer[second]);
    }
    if (comparer.aggregate != '') {
      headers.push(comparer.aggregate);
    }
    lines.push(headers);
    model.year.categories.forEach(category => {
      let line = [];
      line.push(category.title);
      if (comparer[first] != '') {
        line.push(this.getLabelCountryFunction(category, first, comparerExport, queryExport, isOrganization).trim());
      }
      if (comparer[second] != '') {
        line.push(this.getLabelCountryFunction(category, second,comparerExport,queryExport, isOrganization).trim());
      }
      if (comparer.aggregate != '') {
        line.push(this.getLabelCountryFunction(category, 'aggregate',comparerExport,queryExport, isOrganization).trim());
      }
      let add = true;
      if (line.length == 2) {
        if (line[1] == 'No data available' || line[1] == '<p>No data available</p>' || line[1] == '-' || line[1] == '' || line[1] == null) {
          add = false;
        }
      } else if (line.length == 3 || line.length == 4) {
        if ((line[1] == 'No data available' || line[1] == '<p>No data available</p>' || line[1] == '-' || line[1] == '' || line[1] == null) && (line[2] == 'No data available' || line[2] == '<p>No data available</p>' || line[2] == '-' || line[2] == '' || line[2] == null)) {
          add = false;
        }
      }
      if (add) {
        lines.push(line);
      }
      category.subcategories.forEach(subcategory => {
        line = [];
        line.push(subcategory.label);
        if (comparer[first] != '') {
          line.push(this.getLabelCountryFunction(subcategory, first,comparerExport,queryExport, isOrganization).trim());
        }
        if (comparer[second] != '') {
          line.push(this.getLabelCountryFunction(subcategory, second,comparerExport,queryExport, isOrganization).trim());
        }
        if (comparer.aggregate != '') {
          line.push(this.getLabelCountryFunction(subcategory, 'aggregate',comparerExport,queryExport, isOrganization).trim());
        }
        let add = true;
        if (line.length == 2) {
          if (line[1] == 'No data available' || line[1] == '<p>No data available</p>' || line[1] == '-' || line[1] == '' || line[1] == null) {
            add = false;
          }
        } else if (line.length == 3 || line.length == 4) {
          if ((line[1] == 'No data available' || line[1] == '<p>No data available</p>' || line[1] == '-' || line[1] == '' || line[1] == null) && (line[2] == 'No data available' || line[2] == '<p>No data available</p>' || line[2] == '-' || line[2] == '' || line[2] == null)) {
            add = false;
          }
        }
        if (add) {
          lines.push(line);
        }
      });
    });
    let linesString = lines.map(line => line.map(element => '"' + element.replace('<p>', '').replace('</p>', '') + '"').join(','));
    let result = linesString.join('\n');
    result = result.replace(/ ?<\/?b> ?/g, ' ');
    result = result.replace(/," /g, ',"');
    result = result.replace(/ ",/g, '",');
    let blob = new Blob([result], { type: 'text/csv' });
    const fileName = isOrganization ? 'partner' : 'country';
    saveAs(blob, fileName + '.csv');
  }
  htmlIndicatorFunction(indicator) {
    if (indicator.icon2) {
      return '<img src="assets/'+indicator.icon+'"class="icon-indicator"><img src="assets/'+indicator.icon2+'"class="icon-indicator"><article>'+indicator.comparison+'</article>'; 
    }else {
      return '<img src="assets/'+indicator.icon+'"class="icon-indicator"><article>'+indicator.comparison+'</article>';
    }
  }
  modalQuery (column_query, country) {
    const query = SERVER.GET_QUERY(`select ${column_query} from "${SERVER.USERNAME}"."${SERVER.GPEDC_SCREENS_1_2}" where country like '${country}' `);
    return this.webService.get(query).map(ans => {
      // console.log("modalquery",ans);
      return ans.json().rows;
    });
  }
}
