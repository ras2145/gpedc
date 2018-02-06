import { countryComparison } from '../countryComparison';
import { Component, OnInit } from '@angular/core';
import { MapService } from '../services/map.service';
import { IOption } from '../lib/ng-select/option.interface.d';
import { titles } from '../titles';
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
  constructor(private mapService: MapService) { }

  ngOnInit() {
    this.mapService.allDataCountryQuery().subscribe(val => {
      this.countriesQuery = val;
    });
    this.titles = titles;
    console.log(titles);
    this.resetComparer();
    this.year = '2016';
    this.model.year = titles[2];
    this.chargeCountryComparison();
    console.log(titles[2]);
    console.log(this.countryComparer);

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
        }, 10);
        return;
      }
    } else {
      if (event.value === this.countryComparer.firstCountry) {
        setTimeout(() => {
          this.countryComparer.secondCountry = undefined;
        }, 10);
        return;
      }
    }
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
