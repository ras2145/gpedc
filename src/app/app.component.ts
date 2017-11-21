import { IOption } from './lib/ng-select/option.interface.d';
import { countryComparison } from './countryComparison';
import { WebService } from './services/web.service';
import { MapService } from './services/map.service';
import { Component, Inject, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from './titles';
import { regions, incomeGroups, countryContexts } from './filterCountries';
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
  model = {
    year: null,
    category: {
      label: 'Select indicator',
      title: '',
      column: ''
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
  }
  onDeselected(event) {
    this.mapService.paintTwoCountry(event.value);
  }
  mapConfig() {
    const self = this;
    this.mapService.onLoad(() => {
      this.mapService.getIndicatorFilterGeoJSON(this.model.category.column).subscribe(geojson => {
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
            this.getCategoriesNotNull();
            this.getIndicator(this.indicatorSelectedFooter);
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
        if (this.selectedTab === 'tab1') {
          this.updateIndicatorGeojson();
        }
        if (this.selectedTab === 'tab2') {
          this.resetComparer();
          this.model.category.title = 'Select two countries for comparing indicators: ';
        }
      }
    }
  }
  selectCategory(category) {
    this.model.category = category;
    this.model.subcategory = null;
    this.updateIndicatorGeojson();
  }
  selectSubcategory(category, subcategory) {
    this.model.category = category;
    this.model.subcategory = subcategory;
    this.subIndicator = false;
    this.updateIndicatorGeojson();
  }
  changeYearLabel(y){
     titles.forEach(title => {
      if (y.year === title.year) {
        this.model.year = title;
        this.model.category = title.categories[0];
        this.model.subcategory = null;
      }
    });
  }
  getText(param) {
    return param + (typeof param === 'number' ? '%' : '');
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
    //TODO grisaf update geojson
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
  getLabelCountry(id, country) {
    // re implement charge logic
    if (!id) {
      return '';
    }
    /*if (this.allLabels[id]) {
      console.log('my id ', id);
      return this.allLabels[id];
    }
    const _country = ( (country === 'first') ? this.countryComparer.firstCountry : this.countryComparer.secondCountry);
    if (_country) {
      const categories = this.model.year.categories;
      for ( const category of categories ) {
        if (id === category.id) {
          let text = '';
          this.mapService.getIndicatorCountry(_country).subscribe(val => {
            if (val[category.id] === 'Yes' ) {
              text = text + category.label + '<br>' + category.yesText + '<br>';
            } else if (val[category.id] === 'No') {
              text = text  + category.label + '<br>' + category.noText + '<br>';
            } else {
              text = text + category.label + '<br>' + (category.prefix + ' ' + val[category.column] + ' ' + category.suffix) + '<br>';
            }
            return this.allLabels[id] = text;
          });
          return text;
        }
      }
    }*/
    return '';
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
            this.popupText = this.popupText + ' ' + this.model.category['prefix'] + ' ' + country[this.model.category.column] + ' ' + this.model.category['suffix'];
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
            this.popupText = this.popupText + ' ' + this.model.subcategory.prefix + ' ' + country[this.model.subcategory.column] + ' ' + this.model.subcategory.suffix;
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
          if (this.indicatorsSelectedCountry[i.id] === 'Yes') {
            this.footerText = this.footerText + i.label + '<br>' + i.yesText + '<br>';
          } else if (this.indicatorsSelectedCountry[i.id] === 'No') {
            this.footerText = this.footerText + i.label + '<br>' + i.noText + '<br>';
          } else {
            this.footerText = this.footerText + i.label + '<br>' + (i.prefix + ' ' + this.indicatorsSelectedCountry[i.column] + ' ' + i.suffix) + '<br>';
          }
          for (const j of i.subcategories) {
            if (this.indicatorsSelectedCountry[j.column] === 'Yes') {
              this.footerText = this.footerText + j.yesText + '<br>';
            } else if (this.indicatorsSelectedCountry[j.column] === 'No') {
              this.footerText = this.footerText + j.noText + '<br>';
            } else {
              this.footerText = this.footerText + (j.prefix + ' ' + this.indicatorsSelectedCountry[j.column] + ' ' + j.suffix) + '<br>';
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
      region: ''
    };
    this.organizationComparer = {
      firstOrganization: '',
      ssecondOrganization: ''
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
}
