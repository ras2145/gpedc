import { IOption } from './lib/ng-select/option.interface.d';
import { countryComparison } from './countryComparison';
import { WebService } from './services/web.service';
import { MapService } from './services/map.service';
import { Component, Inject, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from './titles';
import { regions, incomeGroups, countryContexts, partnerAggregate } from './filterCountries';
import { saveAs } from 'file-saver';
import { getValueFromObject } from 'ngx-bootstrap/typeahead/typeahead-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  popupText: any;
  countriesQuery: any;
  footerTab = '';
  allLabels = {};
  countryComparer: any;
  organizationComparer: any;
  countryComparisonOptions: any;
  countrySelectors = [];
  organizationSelectors = [];
  selectedCountry: any = false;
  indicatorsSelectedCountry: any;
  indicatorSelectedFooter: any;
  categoriesNotNull: any;
  selectedTab = 'tab1';
  partners: any;
  countryName = 'Country';
  title = 'app';
  modalRef: BsModalRef;
  geojson: any = {};
  name: any;
  titles: any;
  regions: any;
  incomeGroups: any;
  countryContexts: any;
  footerText = '';
  mapUrlProfile: any;
  subIndicator: any;
  isNumber: any;
  indicator: any;
  model = {
    year: null,
    category: {
      label: 'Select indicator',
      title: '',
      column: '',
      id: ''
    },
    subcategory: null,
    region: null,
    incomeGroup: null,
    countryContext: null
  };
  openedIndicator: string;
  indicatorTitle: any;
  constructor(
    private mapService: MapService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    this.mapService.allDataCountryQuery().subscribe(val => {
      this.countriesQuery = val;
    });
    this.getPartners();
    this.countryComparisonOptions = countryComparison;
    this.chargeCountryComparison();
    this.titles = titles;
    this.regions = regions;
    this.incomeGroups = incomeGroups;
    this.countryContexts = countryContexts;
    this.mapUrlProfile = '#';
    this.resetModels();
    this.mapService.createMap('map');
    this.mapConfig();
    this.indicator = true;
  }
  chargeOrganizationComparison() {
    this.organizationSelectors.push({
      key: '2014',
      value: new Array<IOption>()
    });
    this.organizationSelectors.push({
      key: '2016',
      value: new Array<IOption>()
    });
    this.organizationSelectors.push({
      key: 'Aggregate',
      value: new Array<IOption>()
    });
    for (const partner of this.partners) {
      if (partner['_2016'].toUpperCase() === 'YES') {
        this.organizationSelectors[1]['value'].push({
          value: partner['partner'],
          label: partner['partner']
        });
      }
      if (partner['_2014'].toUpperCase() === 'YES') {
        this.organizationSelectors[0]['value'].push({
          value: partner['partner'],
          label: partner['partner']
        });
      }
    }
    for (const aggregate of partnerAggregate) {
      this.organizationSelectors[2]['value'].push({
        value: aggregate.value,
        label: aggregate.label
      });
    }
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
  onSelectedCountry(event) {
    if (this.countryComparer.firstCountry === this.countryComparer.secondCountry) {
      this.countryComparer.secondCountry = '';
      return;
    }
    this.mapService.paintTwoCountry(event.value);
  }
  onSelectedOrganization(event) {
    // TODO organization data
    // LOL
  }
  onDeselected(event) {
    this.mapService.paintTwoCountry(event.value);
  }
  mapConfig() {
    const self = this;
    this.mapService.onLoad(() => {
      this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
        self.mapService.build(geojson);
      });
      this.mapService.mouseCountryHover(event => {
        const countries = self.mapService.map.queryRenderedFeatures(event.point, {
          layers: ['country-fills']
        });
        this.countryName = countries[0].properties.country;
        this.getTextPopUp(this.countryName);
      });
      this.mapService.mouseLeave(() => {
        this.countryName = 'Country';
        this.popupText = '';
      });
      this.mapService.clickCountry(event => {
        if (this.selectedTab === 'tab1') {
          self.mapUrlProfile = event.features[0].properties.profile;
          if (self.mapUrlProfile === 'null' || self.mapUrlProfile == null) {
            self.mapUrlProfile = '#';
          } else if (!self.mapUrlProfile.includes('http://')) {
            self.mapUrlProfile = 'http://' + self.mapUrlProfile;
          }
          const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
            layers: ['country-fills']
          });
          this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
          if (this.selectedCountry) {
            this.indicatorsSelectedCountry = this.countriesQuery.filter((a) => a.country === this.selectedCountry)[0];
            this.categoriesNotNull = [];
            setTimeout(() => {
              this.getCategoriesNotNull();
              this.indicatorSelectedFooter = this.categoriesNotNull.length ? this.categoriesNotNull[0].id : this.model.year.categories[0].id;
              this.getIndicator(this.indicatorSelectedFooter);
            }, 100);
          } else {
            this.indicatorSelectedFooter = this.model.year.categories[0].id;
          }
        } else if (this.selectedTab === 'tab2') {
          const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
            layers: ['country-fills']
          });
          const aux = self.mapService.paintTwoCountry(selectedCountry[0].properties.country);
          this.countryComparer.firstCountry = aux[0];
          this.countryComparer.secondCountry = aux[1];
        }
      });
    });
  }
  resetComparer() {
    this.mapService.paintTwoCountry(this.countryComparer.secondCountry);
    this.mapService.paintTwoCountry(this.countryComparer.firstCountry);
    this.countryComparer.firstCountry = '';
    this.countryComparer.secondCountry = '';
    this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
      this.mapService.update(geojson);
    });
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  getIndicatorValue(country, year) {
    if (!country) {
      return '-';
    }
    let ind = '', index = -1;
    for (const indicator of this.model.year.categories) {
      if (this.model.category && this.model.category.label === indicator.label) {
        ind = indicator.id;
      }
      indicator.subcategories.forEach((ele, idx) => {
        if (this.model.subcategory && this.model.subcategory.label === ele.label) {
          ind = indicator.id;
          if (this.model.subcategory.id) {
            index = -1;
          }
          index = idx + 1;
        }
      });
    }

    if (ind === '1a') {
      ind = ind.replace('a', '');
    }
    ind = `_${year}_${ind}`;
    if (index !== -1) {
      ind = `${ind}_${index}`;
    }
    if (this.countriesQuery) {
      const countryQuery = this.countriesQuery.filter(ele => {
        return ele.country === country;
      })[0];
      if (countryQuery && countryQuery.hasOwnProperty(ind)) {
        return countryQuery[ind] ? countryQuery[ind] : '-';
      }
    }
    return '-';
  }
  selectTab(event) {
    console.log(event.target.id);
    if (event.target.id) {
      if (event.target.id != this.selectedTab) {
        this.selectedTab = event.target.id;
        this.mapService.applyFilters(event.target.id);
        this.mapService.resetClickLayer();
        this.selectedCountry = '';
        titles.forEach(title => {
          if (title.year === '2016') {
            this.model.year = title;
            this.model.category = title.categories[0];
          }
        });
        this.indicator = true;
        if (this.selectedTab === 'tab1') {
          this.model.region = this.regions[0];
          this.model.countryContext = this.countryContexts[0];
          this.model.incomeGroup = this.incomeGroups[0];
          this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
            this.mapService.update(geojson);
          });
        }
        if (this.selectedTab === 'tab2') {
          this.indicator = false;
          this.resetComparer();
          this.model.category = {
            label: '',
            title: 'Select two countries for comparing indicators: ',
            column: '',
            id: ''
          };
        }
        if (this.selectedTab === 'tab1') {
          setTimeout(() => {
            this.mapService.resize();
          }, 100);
        }
      }
    }
  }
  selectCategory(category) {
    this.model.category = category;
    this.model.subcategory = null;
    this.indicator = false;
    this.updateIndicatorGeojson();
  }
  selectSubcategory(category, subcategory) {
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.subIndicator = false;
    this.indicator = false;
    this.updateIndicatorGeojson();
  }
  changeYearLabel(y) {
    titles.forEach(title => {
      if (y.year === title.year) {
        this.model.year = title;
        this.model.category = title.categories[0];
        this.model.subcategory = null;
      }
    });
    this.footerTab = '';
    this.footerText = '';
    this.mapService.resetClickLayer();
    this.indicatorSelectedFooter = this.model.year.categories[0].id;
    this.indicator = true;
    this.selectedCountry = null;
    this.model.region = this.regions[0];
    this.model.countryContext = this.countryContexts[0];
    this.model.incomeGroup = this.incomeGroups[0];
    this.mapService.getCountriesYearGeoJSON(this.model.year.year).subscribe(geojson => {
      this.mapService.update(geojson);
    });
  }
  getText(value, indicator) {
    return this.formatValue(indicator, value);
  }
  onIndicatorOver(category) {
    this.openedIndicator = category.id;
  }
  selectRegion(region) {
    this.model.region = region;
    this.updateIndicatorGeojson();
  }
  selectIncomeGroup(incomeGroup) {
    this.model.incomeGroup = incomeGroup;
    this.updateIndicatorGeojson();
  }
  selectCountryContext(countryContext) {
    this.model.countryContext = countryContext;
    this.updateIndicatorGeojson();
  }
  updateIndicatorGeojson() {
    this.selectedCountry = '';
    this.mapService.resetClickLayer();
    const indicator = this.model.subcategory ? this.model.subcategory.column : this.model.category.column;
    const region = this.model.region.value;
    const incomeGroup = this.model.incomeGroup.value;
    const countryContext = this.model.countryContext.value;
    this.mapService.getIndicatorFilterGeoJSON(indicator, region, incomeGroup, countryContext).subscribe(geojson => {
      this.mapService.update(geojson);
    });
  }
  getCategoriesNotNull() {
    this.categoriesNotNull = [];
    if (this.selectedCountry) {
      for ( const i of this.model.year.categories ) {
        let sw = false;
        if ( this.indicatorsSelectedCountry[i.column] !== null ) {
          sw = true;
        }
        for ( const j of i.subcategories ) {
          if ( this.indicatorsSelectedCountry[j.column] !== null ) {
            sw = true;
          }
        }
        if ( sw ) {
          this.categoriesNotNull.push(i);
        }
      }
    }
  }
  getLabelCountry(indicator, typeOfCountry, isOrganization?: boolean) {
    const countryName = isOrganization ? this.organizationComparer[typeOfCountry] : this.countryComparer[typeOfCountry];
    if (!countryName || !indicator) {
      return '-';
    }
    const dataObject = isOrganization ? this.partners : this.countriesQuery;
    const field = isOrganization ? 'partner' : 'country';
    const country = dataObject.filter( (a) => {
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
      if (this.checkIfString(value) && value.toUpperCase() === 'YES') {
        text = text + ' ' + indicator['yesText'];
      }else if (this.checkIfString(value) && value.toUpperCase() === 'NO') {
        text = text + ' ' + indicator['noText'];
      } else {
        text = text + ' ' + indicator['prefix'] + ' ' + value + ' ' + indicator['suffix'];
      }
    } else {
      if (this.checkIfString(value) && value.toUpperCase() === 'YES') {
        text = text + ' ' + indicator.yesText;
      } else if (this.checkIfString(value) && value.toUpperCase() === 'NO') {
        text = text + ' ' + indicator.noText;
      } else {
        text = text + ' ' + indicator.prefix + ' ' + value + ' ' + indicator.suffix;
      }
    }
    if (text == null || text.trim() == 'null' || text.trim() == 'undefined') {
      return '-';
    }
    return text;
  }
  formatValue(indicator, oldValue) {
    let value = '';
    if (indicator.type === 'percent') {
      value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision) + '%') : '-';
    } else if (indicator.type === 'number') {
      value = oldValue ? (parseFloat(oldValue).toFixed(indicator.precision)) : '-';
    } else if (indicator.type === 'text') {
      value = oldValue ? oldValue : '-';
    }
    return value;
  }
  checkIfString(val) {
    return typeof val === 'string';
  }
  getTextPopUp(countryName) {
    this.popupText = '';
    if (countryName !== 'Country') {
      const country = this.countriesQuery.filter( (a) => a.country === countryName)[0];
      if (this.model.category == null) {
        this.popupText = 'No indicator selected.<br>';
      } else if (this.model.category != null && this.model.subcategory == null ) {
        if (country[this.model.category.column] != null ) {
          this.popupText = '';
          if (this.checkIfString(country[this.model.category.column]) && country[this.model.category.column].toUpperCase() === 'YES') {
            this.popupText = this.popupText + ' ' + this.model.category['yesText'];
          }else if (this.checkIfString(country[this.model.category.column]) && country[this.model.category.column].toUpperCase() === 'NO') {
            this.popupText = this.popupText + ' ' + this.model.category['noText'];
          } else {
            this.popupText = this.popupText + ' ' + this.model.category['prefix'] + ' ' + this.formatValue(this.model.category, country) + ' ' + this.model.category['suffix'];
          }
        }
      } else if (this.model.category != null && this.model.subcategory != null) {
        this.popupText = '';
        if (country[this.model.subcategory.column] != null) {
          if (this.checkIfString(country[this.model.subcategory.column]) && country[this.model.subcategory.column].toUpperCase() === 'YES') {
            this.popupText = this.popupText + ' ' + this.model.subcategory.yesText;
          }else if (this.checkIfString(country[this.model.subcategory.column]) && country[this.model.subcategory.column].toUpperCase() === 'NO') {
            this.popupText = this.popupText + ' ' + this.model.subcategory.noText;
          } else {
            this.popupText = this.popupText + ' ' + this.model.subcategory.prefix + ' ' + this.formatValue(this.model.subcategory, country) + ' ' + this.model.subcategory.suffix;
          }
        }
      }
    }
  }
  getIndicator(indicator: any) {
    this.footerTab = indicator;
    this.indicatorSelectedFooter = indicator;
    this.footerText = '';
    if (this.selectedCountry) {
      const categories = this.model.year.categories;
      for (const i of categories) {
        if (i.id === indicator) {
          let value = this.formatValue(i, this.indicatorsSelectedCountry[i.column]);
          if (value === 'Yes') {
            this.footerText = this.footerText + i.label + ': ' + i.yesText + '<br>';
          } else if (value === 'No') {
            this.footerText = this.footerText + i.label + ': ' + i.noText + '<br>';
          } else {
            this.footerText = this.footerText + i.label + ': ' + (i.prefix + ' ' + value + ' ' + i.suffix) + '<br>';
          }
          for (const j of i.subcategories) {
            let subvalue = this.formatValue(j, this.indicatorsSelectedCountry[j.column]);
            if (subvalue === 'Yes') {
              this.footerText = this.footerText + j.yesText + '<br>';
            } else if (subvalue === 'No') {
              this.footerText = this.footerText + j.noText + '<br>';
            } else {
              this.footerText = this.footerText + (j.prefix + ' ' + subvalue + ' ' + j.suffix) + '<br>';
            }
          }
        }
      }
    }
  }
  getPartners() {
    this.mapService.getPartners().subscribe(res => {
      this.partners = res;
      this.chargeOrganizationComparison();
    });
  }
  resetModels() {
    this.countryComparer = {
      firstCountry: '',
      secondCountry: '',
      aggregate: ''
    };
    this.organizationComparer = {
      firstOrganization: '',
      ssecondOrganization: '',
      aggregate: ''
    };
    titles.forEach(title => {
      if (title.year === '2016') {
        this.model.year = title;
        this.model.category = title.categories[0];
      }
    });
    this.model.region = this.regions[0];
    this.model.incomeGroup = this.incomeGroups[0];
    this.model.countryContext = this.countryContexts[0];
    this.indicatorSelectedFooter = this.model.year.categories[0].id;
    this.subIndicator = true;
    this.isNumber = false;
  }
  exportCsv(isOrganization?: boolean) {
    const comparer = isOrganization ? this.organizationComparer : this.countryComparer;
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
    this.model.year.categories.forEach(category => {
      let line = [];
      line.push(category.title);
      if (comparer[first] != '') {
        line.push(this.getLabelCountry(category, first, isOrganization).trim());
      }
      if (comparer[second] != '') {
        line.push(this.getLabelCountry(category, second, isOrganization).trim());
      }
      if (comparer.aggregate != '') {
        line.push(this.getLabelCountry(category, 'aggregate', isOrganization).trim());
      }
      lines.push(line);
      category.subcategories.forEach(subcategory => {
        line = [];
        line.push(subcategory.label);
        if (comparer[first] != '') {
          line.push(this.getLabelCountry(subcategory, first, isOrganization).trim());
        }
        if (comparer[second] != '') {
          line.push(this.getLabelCountry(subcategory, second, isOrganization).trim());
        }
        if (comparer.aggregate != '') {
          line.push(this.getLabelCountry(subcategory, 'aggregate', isOrganization).trim());
        }
        lines.push(line);
      });
    });
    let linesString = lines.map(line => line.map(element => '"' + element + '"').join(','));
    let result = linesString.join('\n');
    let blob = new Blob([result], { type: 'text/csv' });
    const fileName = isOrganization? 'organizations' : 'countries';
    saveAs(blob, fileName + '.csv');
  }
  noIsSevenOrEight(category) {
    return !(category.id === '7' || category.id === '8');
  }
}
