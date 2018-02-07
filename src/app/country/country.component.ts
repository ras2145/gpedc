import { countryComparison } from '../countryComparison';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MapService } from '../services/map.service';
import { IOption } from '../lib/ng-select/option.interface.d';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from '../titles';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  countryComparer: any;
  countrySelectors = [];
  titles;
  countriesQuery: any;
  categoriesNotNull = [];
  indicator: any;
  subIndicator: any;
  notFromTab: any;
  viewModal = true;
  modalRef: BsModalRef;
  model = {
    year: null,
    category: {
      label: 'Select indicator',
      title: '',
      column: '',
      id: '',
      legendText: ''
    },
    subcategory: null,
    region: null,
    incomeGroup: null,
    countryContext: null
  };
  year;
  countries: any;
  constructor(private mapService: MapService,
    private modalService: BsModalService) { }

  ngOnInit() {
    this.mapService.allDataCountryQuery().subscribe(val => {
      this.countriesQuery = val;
    });
    this.titles = titles;
    this.resetComparer();
    this.year = '2016';
    this.model.year = titles[2];
    this.chargeCountryComparison();
    this.countries = {};
  }
  
  resetComparer() {
    this.countryComparer = {};
    this.countryComparer.firstCountry = '';
    this.countryComparer.secondCountry = '';
    this.countryComparer.aggregate = '';
  }
  chargeCountryComparison() {
    for (const key in countryComparison) {
      this.countrySelectors.push({
        key: key,
        value: new Array<IOption>()
      });
      const size = this.countrySelectors.length;
      // tslint:disable-next-line:forin
      for (const arrays in countryComparison[key]) {
        this.countrySelectors[size - 1]['value'].push({
          value: arrays, label: arrays, disabled: true
        });
        for (const ele of countryComparison[key][arrays]) {
          this.countrySelectors[size - 1]['value'].push({
            value: ele, label: ele
          });
        }
      }
    }
  }
  onSelectedCountry(event, type) {
    if (type === 'first') {
      if (event.value === this.countryComparer.secondCountry) {
        setTimeout(() => {
          this.countryComparer.firstCountry = undefined;
          this.countries.firstCountry = 'Country';
        }, 10);
        return;
      }
      this.countries.firstCountry = event.value;
    } else {
      if (event.value === this.countryComparer.firstCountry) {
        setTimeout(() => {
          this.countryComparer.secondCountry = undefined;
          this.countries.secondCountry = 'Country';
        }, 10);
        return;
      }
      this.countries.secondCountry = event.value;
    }
  }
  openModal(template: TemplateRef<any>) {
    this.viewModal = false;
    this.modalRef = this.modalService.show(template);
  }
  findViewerCategory(category, subcategory, indicator, subIndicator) {
    this.notFromTab = true;
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.indicator = indicator;
    this.subIndicator = subIndicator;
  }
  // TODO: Blanca, Ayar other generic function
  exportCsv() {
    const comparer = this.countryComparer;
    const first =  'firstCountry';
    const second = 'secondCountry';
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
    this.model.year.categories.forEach(category => {
      let line = [];
      line.push(category.title);
      if (comparer[first] != '') {
        line.push(this.getLabelCountry(category, first).trim());
      }
      if (comparer[second] != '') {
        line.push(this.getLabelCountry(category, second).trim());
      }
      if (comparer.aggregate != '') {
        line.push(this.getLabelCountry(category, 'aggregate').trim());
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
          line.push(this.getLabelCountry(subcategory, first).trim());
        }
        if (comparer[second] != '') {
          line.push(this.getLabelCountry(subcategory, second).trim());
        }
        if (comparer.aggregate != '') {
          line.push(this.getLabelCountry(subcategory, 'aggregate').trim());
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
    const fileName = 'countries';
    saveAs(blob, fileName + '.csv');
  }
  onDeselected(event, type) {
    if (type === 'first') {
      this.countryComparer.firstCountry = '';
    } else {
      this.countryComparer.secondCountry = '';
    }
  }
  tabsToShow(category) {
    return (category === '1a' || category === '2' || category === '3' || category === '4');
  }

  //TODO: Blanca, Ayar PASS THIS FUNCTION TO SERVICE TO AVOID REDUNDANCE
  getLabelCountry(indicator, typeOfCountry, isOrganization?: boolean) {
    let aux = indicator.column;
    const countryName = this.countryComparer[typeOfCountry];
    if (!countryName || !indicator) {
      return '-';
    }
    const dataObject = this.countriesQuery;
    const field = 'country';
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


    const value = this.formatValue(indicator, country[indicator.column]);
    if (indicator['subcategories']) {
      // if (this.checkIfString(value) && value.toUpperCase() === 'YES') {
      // text = text + ' ' + indicator['yesText'];
      // } else if (this.checkIfString(value) && value.toUpperCase() === 'NO') {
      //  text = text + ' ' + indicator['noText'];
      //} else {
      // text = text + ' ' + indicator['prefix'] + ' <b>' + value + '</b> ' + indicator['suffix'];
      const val = (value.toString() !== '9999') ? value : 'Not Applicable';
      text = text + '<p>' + val   + '</p>';
      //}
    } else {
      /*if (this.checkIfString(value) && value.toUpperCase() === 'YES') {
        text = text + ' ' + indicator.yesText;
      } else if (this.checkIfString(value) && value.toUpperCase() === 'NO') {
        text = text + ' ' + indicator.noText;
      } else {*/
      const val = value.toString() !== '9999'? value : 'Not Applicable';
      text = text + '<p>' + val + '</p>';
      // }
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
  availableCountryRow(category) {
    let d = 0;
    d += this.countryComparer.firstCountry ? 1 : 0;
    d += this.countryComparer.secondCountry ? 1 : 0;
    if (d === 2) {
      const texa = this.getLabelCountry(category, 'firstCountry');
      const texb = this.getLabelCountry(category, 'secondCountry');
      let isValid = false;
      isValid = (texa !== '-' && !texa.includes('No data'));
      isValid = isValid || (texb !== '-' && !texb.includes('No data'));
      return isValid;
    }
    if(category.id==null)
    {
      if (category.column=='_2014_8' || category.column=='_2016_8' || category.column=='_2014_7' || category.column=='_2016_7') 
      return false;
    }
    return true;
  }
  hasSubCountry(indicator) {
    let ans = 0;
    for (let subcategory of indicator.subcategories) {
      if (this.availableCountryRow(subcategory)) {
        ans++;
      }
    }
    return ans;
  }
}
