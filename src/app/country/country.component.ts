import { countryComparison } from '../countryComparison';
import { Component, OnInit } from '@angular/core';
import { MapService } from '../services/map.service';
import { IOption } from '../lib/ng-select/option.interface.d';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  countryComparer: any;
  countrySelectors = [];
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
    this.resetComparer();
    this.year = '2016';
    this.chargeCountryComparison();
    console.log(this.countryComparer);
  }
  resetComparer() {
    this.countryComparer = {};
    this.countryComparer.firstCountry = '';
    this.countryComparer.secondCountry = '';
    
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
        this.mapService.paintTwoClearOne('first');
        setTimeout(() => {
          this.countryComparer.firstCountry = undefined;
        }, 10);
        return;
      }
      if (this.countryComparer.firstCountry !== '') {
        this.mapService.paintTwoCountry(this.countryComparer.firstCountry, 'first');
      }
    } else {
      if (event.value === this.countryComparer.firstCountry) {
        setTimeout(() => {
          this.countryComparer.secondCountry = undefined;
        }, 10);
        this.mapService.paintTwoClearOne('second');
        return;
      }
      if (this.countryComparer.secondCountry !== '') {
        this.mapService.secondCountry = '';
        this.mapService.paintTwoCountry(this.countryComparer.secondCountry, 'second');
      }
    }
  }
  onDeselected(event, type) {
    if (type === 'first') {
      this.countryComparer.firstCountry = '';
    } else {
      this.countryComparer.secondCountry = '';
    }
    this.mapService.paintTwoCountry(event.value, 'ok');
  }
}
