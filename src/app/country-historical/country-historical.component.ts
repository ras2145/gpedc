import { Component, OnInit } from '@angular/core';
import { analysisData } from '../../app/analysisData';
import { Subject } from 'rxjs/Subject';
@Component({
  selector: 'app-country-historical',
  templateUrl: './country-historical.component.html',
  styleUrls: ['./country-historical.component.css']
})
export class CountryHistoricalComponent implements OnInit {
  titleSubject: Subject <any> = new Subject();
  filters;
  model = {   };
  indicator = {
    dropdowncountry: 'Select an indicator',
    subdropdown: [],
    titlecountry: ''
  };
  subIndicator = {
    subdropdown: 'Select Sub-Indicator',
    titlecountry: ''
  };  
  subDropdown = false;
  title = '';
  constructor() { 
  }
  ngOnInit() {
    this.filters = analysisData;
    this.filters.forEach(filter => {
      if (filter.year === 2016) {
        this.model = filter;
      }
    });
  }
  changeIndicator(indicator) {
    this.indicator = indicator;
    console.log(this.indicator);
    this.title = (this.indicator.titlecountry ? this.indicator.titlecountry : '');
    this.sendTitle();
    this.subDropdown = (this.indicator.subdropdown.length > 0);
    this.subIndicator.subdropdown = 'Select Sub-Indicator';
    if (this.subDropdown) {
      this.indicator.subdropdown.forEach(sub => {
        if (sub.autoselect) {
          this.subIndicator = sub;
          this.title = (this.subIndicator.titlecountry ? this.subIndicator.titlecountry : '');
          this.sendTitle();
        }    
      });
    }
  }
  changeSubIndicator(subIndicator) {
    this.subIndicator = subIndicator;
    this.title = (this.subIndicator.titlecountry ? this.subIndicator.titlecountry: '');
    this.sendTitle();
  }
  changeYear(year) {
    this.reset();
  }
  sendTitle() {
    this.title = this.title.replace('[YEAR]', this.model['year']);
  }
  reset() {
    this.indicator = {
      dropdowncountry: 'Select an indicator',
      subdropdown: [],
      titlecountry: ''
    };
    this.subIndicator = {
      subdropdown: 'Select Sub-Indicator',
      titlecountry: ''
    };
    this.subDropdown = false;
  }
  resetSub() {
    this.subIndicator = {
      subdropdown: 'Select Sub-Indicator',
      titlecountry: ''
    };
  }
  show(event) {
    console.log(event);
  }
}
