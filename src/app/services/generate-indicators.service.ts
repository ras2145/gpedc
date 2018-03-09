import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import { countryComparison } from '../countryComparison';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { IOption } from '../lib/ng-select/option.interface.d';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from '../titles';
import { saveAs } from 'file-saver';
import { SERVER } from '../server.config';
import { element } from 'protractor';

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
    const query = SERVER.GET_QUERY(`select * from "${SERVER.USERNAME}"."${SERVER.GPEDC_SCREENS_1_2_WITHOUT_GEOMETRY}"`);
    return this.webService.get(query).map(ans => {
      return ans.json().rows;
    });
  }
  getLabelCountryFunction(indicator, type, comparer, query, partnerType, isOrganization?: boolean) {
    // let aux = indicator.column;
    // console.log("getL", partnerType);
    const name = comparer[type];
    const column = isOrganization ? 'column' : partnerType === 'partcntry'? 'partcntry':'devpart';
    // const column = isOrganization ? 'column' : 'partcntry';
    if (!name || !indicator) {
      return '-';
    }
    const dataObject = query;
    // console.log("qery", query);
    const field = isOrganization ? 'partner' : 'country';
    const data = dataObject.filter((a) => {
      if (!a[field]) {
        return false;
      }
      return a[field].toLowerCase().trim() === name.toLowerCase().trim();
    })[0];
    let text = '';
    if (!data) {
      return '-';
    }
    const value = this.formatValue(indicator, data[indicator[column]]);
    const val = (Math.round(Number(value)).toString() !== '9999') ? value : 'Not Applicable';
    text = text + '<p>' + val   + '</p>';
    // if (indicator['subcategories']) {
    //   const val = (Math.round(Number(value)).toString() !== '9999') ? value : 'Not Applicable';
    //   text = text + '<p>' + val   + '</p>';
    // } else {
    //   const val = value.toString() !== '9999'? value : 'Not Applicable';
    //   text = text + '<p>' + val + '</p>';
    // }
    if (text == null || text.trim() == 'null' || text.trim() == 'undefined') {
      return '-';
    }
    // console.log("text", text);
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
      // value = oldValue ? oldValue :'No data available';
        if (oldValue === null || oldValue === '9999' || oldValue === undefined) {
            value = 'No data available';
        } else {
        let valueBol = oldValue.toString();
        if (oldValue.toString() === 'true' || oldValue.toString() === 'false') {
            valueBol = (oldValue ? ' Yes' : 'No');
            oldValue = valueBol;
        } 
        value = oldValue ? (valueBol) : 'No data available';
      }
    }
    return value;
  }

  exportCsvFunction(comparerExport, queryExport, model, partnerType,partnerTypeSecond, isOrganization?: boolean) {
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
        line.push(this.getLabelCountryFunction(category, first, comparerExport, queryExport, partnerType, isOrganization).trim());
      }
      if (comparer[second] != '') {
        line.push(this.getLabelCountryFunction(category, second, comparerExport, queryExport, partnerTypeSecond, isOrganization).trim());
      }
      if (comparer.aggregate != '') {
        line.push(this.getLabelCountryFunction(category, 'aggregate', comparerExport, queryExport, partnerType, isOrganization).trim());
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
          line.push(this.getLabelCountryFunction(subcategory, first, comparerExport, queryExport, partnerType, isOrganization).trim());
        }
        if (comparer[second] != '') {
          line.push(this.getLabelCountryFunction(subcategory, second, comparerExport, queryExport, partnerType, isOrganization).trim());
        }
        if (comparer.aggregate != '') {
          line.push(this.getLabelCountryFunction(subcategory, 'aggregate', comparerExport, queryExport, partnerType, isOrganization).trim());
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
    let linesString = lines.map(line => line.map(element => {
      if (!element) {
        return '""';
      }
      return '"' + element.replace('<p>', '').replace('</p>', '') + '"';
    }).join(','));
    let result = linesString.join('\n');
    result = result.replace(/ ?<\/?b> ?/g, ' ');
    result = result.replace(/," /g, ',"');
    result = result.replace(/ ",/g, '",');
    let blob = new Blob([result], { type: 'text/csv' });
    const fileName = isOrganization ? 'partner' : 'country';
    saveAs(blob, fileName + '.csv');
  }
  htmlIndicatorFunction(indicator) {
    // console.log("ind2",indicator.icon2);
    if (indicator.icon2) {
      return '<div class="div-img-two"><img src="assets/'+indicator.icon+'"class="icon-indicator"><img src="assets/'+indicator.icon2+'" width="47px" class="ll-po"></div><article class="article-img-two">'+indicator.comparison+'</article>'; 
    }else {
      return '<div class="div-img-one"><img src="assets/'+indicator.icon+'"class="icon-indicator"></div><article class="article-img-one">'+indicator.comparison+'</article>';
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
