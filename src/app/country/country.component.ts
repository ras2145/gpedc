import { countryComparison } from '../countryComparison';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MapService } from '../services/map.service';
import { IOption } from '../lib/ng-select/option.interface.d';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from '../titles';
import { saveAs } from 'file-saver';
import {GenerateIndicatorsService} from '../services/generate-indicators.service';
import { indicator2Exceptions } from '../indicator2.exceptions';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  dateModal: any;
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
      partcntry: '',
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
  constructor(private generateIndicatorsService: GenerateIndicatorsService,
  private modalService: BsModalService) { }
  private indicator2Exceptions;
  ngOnInit() {
    this.generateIndicatorsService.allQuery().subscribe(val => {
      this.countriesQuery = val;
    });
    this.titles = titles;
    console.log("UND",titles);
    this.titles[2].categories.splice(3, 1);
    for (let i = 0; i < 5; ++i ) {
      this.titles[0].categories[2].subcategories.splice(this.titles[0].categories[2].subcategories[0], 1);
    }
    this.resetComparer();
    this.year = '2016';

    this.model.year = this.titles[2];
    console.log("YA",this.model.year);
    this.chargeCountryComparison();
    this.countries = {};
    this.dateModal={};
  }
  changeYear(year) {
    this.resetComparer();
    this.year = year.year;
    console.log("YEAR",this.year);
    
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
    console.log("country",this.countrySelectors);
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
    return (category === '1a' || category === '2' || category === '3');
  }
  tabsToShowTwo(category) {
    // tslint:disable-next-line:max-line-length
    // return (category === '5a' || category === '5b' || category === '6' || category === '7' || category === '8' || category === '9a' || category === '9b' || category === '10');
    return (category !== '4');
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
      if (category.partcntry=='_2014_8' || category.partcntry=='_2016_8' || category.partcntry=='_2014_7' || category.partcntry=='_2016_7') 
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
  popIndicator(subcategory){ 
    if(subcategory.partcntry.split('_')[2]==2 && this.countryComparer.firstCountry!='')
    {  return true;}else{
      return false;
    }
  }
  popSubcategori(subcategory, valor){
    console.log("susbc",subcategory.column.split('_')[3]);
    this.dateModal=indicator2Exceptions[Number(subcategory.column.split('_')[3])-1] ;
    this.dateModal.title=this.dateModal.title.slice(8,this.dateModal.title.length);
  }
  htmlIndicator(indicator){
    return this.generateIndicatorsService.htmlIndicatorFunction(indicator);
  }
}
