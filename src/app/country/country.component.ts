import { countryComparison } from '../countryComparison';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MapService } from '../services/map.service';
import { IOption } from '../lib/ng-select/option.interface.d';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from '../titles';
import { saveAs } from 'file-saver';
import {GenerateIndicatorsService} from '../services/generate-indicators.service';
import { indicator2Exceptions } from '../indicator2.exceptions';
declare var ga: Function;
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
  column_indicator=[{}];
  column_content:'';
  constructor(private generateIndicatorsService: GenerateIndicatorsService,
  private modalService: BsModalService) { }
  private indicator2Exceptions;
  ngOnInit() {
    ga('set', 'page', `/countrycomparison.html`);
    ga('send', 'pageview');
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
    const global = this;
    return this.generateIndicatorsService.getLabelCountryFunction(indicator,  typeOfCountry, global.countryComparer, global.countriesQuery);
  }

  availableCountryRow(category) {
    const global = this;
    let d = 0;
    d += this.countryComparer.firstCountry ? 1 : 0;
    d += this.countryComparer.secondCountry ? 1 : 0;
    if (d === 2) {  
      const texa = this.generateIndicatorsService.getLabelCountryFunction(category, 'firstCountry', global.countryComparer, global.countriesQuery);
      const texb = this.generateIndicatorsService.getLabelCountryFunction(category, 'secondCountry', global.countryComparer, global.countriesQuery);
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
  modalIndicator(subcategory, country, valor){
    if(subcategory.partcntry.split('_')[2]==2)
    {  
      if(valor.replace('<p>','').replace('</p>','')!='-' && valor.replace('<p>','').replace('</p>','')!='Not Applicable' && valor.replace('<p>','').replace('</p>','')!='No data available')
      {
        let selectCountry=(country=='firstCountry')?this.countryComparer.firstCountry:this.countryComparer.secondCountry;
        if(selectCountry!='')    
        return true;
          else
          return false;
      }else{
        return false;
      } 
    }
  }
  modalSubcategory(subcategory,countries){
    this.column_indicator=[{}];
    this.dateModal=indicator2Exceptions[Number(subcategory.column.split('_')[3])-1];
    this.dateModal.title=this.dateModal.title.replace('Module '+this.dateModal.id+' • ','');
    let column_query, column_indicator='';
    this.column_content=subcategory.column;
      for(let i=0; i<this.dateModal.content.length;i++)
      { column_indicator=column_indicator+subcategory.column+'_'+this.dateModal.content[i].id+','; }
        column_query=column_indicator.slice(0, column_indicator.length-1);
        let country=(countries=='firstCountry')?this.countryComparer.firstCountry:this.countryComparer.secondCountry;
        // console.log("para query",column_query, country);
        this.generateIndicatorsService.modalQuery(column_query, country).subscribe(val => {
        this.column_indicator = val;
      });
  }
  htmlIndicator(indicator){
    return this.generateIndicatorsService.htmlIndicatorFunction(indicator);
  }
  marcadorIndicatorContent(id)
  {
    return (this.column_indicator[0][this.column_content+'_'+id]=='Yes')?'check':'close';
  }
  valorIndicatorContent(id)
  {
    if(this.column_indicator[0][this.column_content+'_'+id])
    {
      return  ((this.column_indicator[0][this.column_content+'_'+id]).toString()!='9999')?true:false;
    }
  }
}
