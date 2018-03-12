import { Component, OnInit } from '@angular/core';
import { analysisData } from '../../app/analysisData';
import { Subject } from 'rxjs/Subject';
import { CountryAnalysisService } from '../services/country-analysis.service';
import * as d3 from 'd3';
@Component({
  selector: 'app-country-historical',
  templateUrl: './country-historical.component.html',
  styleUrls: ['./country-historical.component.css']
})
export class CountryHistoricalComponent implements OnInit {
  titleSubject: Subject <any> = new Subject();
  filters;
  charttext;
  countries: any;
  selectedCountry = 'Select Country';
  chartData: any;
  model = {   };
  indicator = {
    dropdowncountry: 'Select an indicator',
    subdropdown: [],
    titlecountry: '',
    indicator: '',
    charttext: ''
  };
  subIndicator = {
    subdropdown: 'Select Sub-Indicator',
    titlecountry: '',
    indicator: '',
    charttext: ''
  };  
  subDropdown = false;
  title = '';
  constructor(private countryAnalysisService: CountryAnalysisService) { 
  }
  ngOnInit() {
    this.countryAnalysisService.getCountries().subscribe(res => {
      this.countries = res;
      console.log(this.countries);
    });
    this.filters = analysisData;
    this.filters.forEach(filter => {
      if (filter.year === 2016) {
        this.model = filter;
      }
    });
  }
  resetCountry() {
    this.selectedCountry = 'Select Country';
    this.sendTitle();
  }
  changeCountry(country) {
    this.selectedCountry = country;
    this.sendTitle();
    console.log(this.selectedCountry);
  }
  run() {
    console.log(this.indicator);
    console.log(this.subIndicator);
    console.log(this.selectedCountry);
    console.log(this.model['year']);
    if (this.selectedCountry === 'Select Country') {
      alert('Please select a country');
    }
    if (this.indicator.dropdowncountry === 'Select an indicator') {
      alert('Please select an Indicator');
      return;
    }
    if (this.subDropdown) {
      if (this.subIndicator.subdropdown !== 'Select Sub-Indicator') {
        this.countryAnalysisService.getCharData(this.selectedCountry, this.subIndicator.indicator, this.model['year']).subscribe(res => {
          this.chartData = res;
          this.draw();
        });
      } else {
        alert('Please select a Sub-Indicator');
        return;
      }
    } else {
      this.countryAnalysisService.getCharData(this.selectedCountry, this.indicator.indicator, this.model['year']).subscribe(res => {
        this.chartData = res;
        this.draw();
      });
    }
  }
  changeIndicator(indicator) {
    this.indicator = indicator;
    console.log(this.indicator);
    this.sendTitle();
    this.subDropdown = (this.indicator.subdropdown.length > 0);
    this.charttext = this.indicator.charttext;
    this.subIndicator.subdropdown = 'Select Sub-Indicator';
    if (this.subDropdown) {
      this.indicator.subdropdown.forEach(sub => {
        if (sub.autoselect) {
          this.subIndicator = sub;
          this.sendTitle();
        }    
      });
    }
  }
  changeSubIndicator(subIndicator) {
    this.subIndicator = subIndicator;
    this.charttext = this.subIndicator.charttext;
    this.sendTitle();
  }
  changeYear(year) {
    this.reset();
  }
  sendTitle() {
    this.title = (this.indicator.titlecountry ? this.indicator.titlecountry : '');
    if (this.subDropdown && this.subIndicator.subdropdown !== 'Select Sub-Indicator') {
      this.title = (this.subIndicator.titlecountry ? this.subIndicator.titlecountry : '');
      this.charttext = this.subIndicator.charttext;
    }
    this.title = this.title.replace('[YEAR]', this.model['year']);
    this.title = this.title.replace('[DEVELOPING COUNTRY]', this.selectedCountry);
    if (this.selectedCountry === 'Select Country') {
      this.title = '';
    }
  }
  reset() {
    this.indicator = {
      dropdowncountry: 'Select an indicator',
      subdropdown: [],
      titlecountry: '',
      indicator: '',
      charttext: ''
    };
    this.subIndicator = {
      subdropdown: 'Select Sub-Indicator',
      titlecountry: '',
      indicator: '',
      charttext: ''
    };
    this.subDropdown = false;
    this.title = '';
    this.selectedCountry = 'Select Country';
    this.charttext = '';
  }
  resetSub() {
    this.subIndicator = {
      subdropdown: 'Select Sub-Indicator',
      titlecountry: '',
      indicator: '',
      charttext: ''
    };
    this.charttext = '';
    this.title = (this.indicator.titlecountry ? this.indicator.titlecountry : '');
  }
  show(event) {
    console.log(event);
  }
  draw() {
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 400;
    const height = 600;
    let svg = d3.select("#chart").append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g");
  }
}
