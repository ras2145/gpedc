import { countryComparison } from '../countryComparison';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MapService } from '../services/map.service';
import { IOption } from '../lib/ng-select/option.interface.d';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from '../titles';
import { saveAs } from 'file-saver';
import {GenerateIndicatorsService} from '../services/generate-indicators.service';

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
  constructor(private mapService: MapService, private generateIndicatorsService: GenerateIndicatorsService,
  private modalService: BsModalService) { }

  ngOnInit() {
    this.mapService.allDataCountryQuery().subscribe(val => {
    this.countriesQuery = val;
    });
    this.titles = titles;
    console.log("UND",titles);
    this.resetComparer();
    this.year = '2016';
    console.log(this.model.year, '------!!!year');
    this.model.year = titles[2];
    console.log("YA",this.model.year);
    this.chargeCountryComparison();
    this.countries = {};
  }
  changeYear(year) {
    console.log(year.year, 'year----------- pendejo');
    this.resetComparer();
    this.year = year.year;
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
    console.log('onSelectedCountry');
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
    this.generateIndicatorsService.exportCsvFunction(this.countryComparer, this.countriesQuery, this.model);
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
  getLabelCountry(indicator, typeOfCountry, isOrganization?: boolean) {
    return this.generateIndicatorsService.getLabelCountryFunction(indicator,  typeOfCountry, this.countryComparer, this.countriesQuery);
  }

  availableCountryRow(category) {
    let d = 0;
    d += this.countryComparer.firstCountry ? 1 : 0;
    d += this.countryComparer.secondCountry ? 1 : 0;
    if (d === 2) {  
      const texa = this.generateIndicatorsService.getLabelCountryFunction(category, 'firstCountry', this.countryComparer, this.countriesQuery);
      const texb = this.generateIndicatorsService.getLabelCountryFunction(category, 'secondCountry', this.countryComparer, this.countriesQuery);
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
    if (category.id === '8') {
      if (category.subcategories.length > 4) {
        category.subcategories.splice(0, 1);
      }
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
