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
  countriesQuery: any;
  footerTab = '';
  allLabels = {};
  countryComparer: any;
  countryComparisonOptions: any;
  countrySelectors = [];
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
    this.mapService.randomQuery().subscribe(val => {
      this.countriesQuery = val;
    });
    this.countryComparer = {
      firstCountry: '',
      secondCountry: '',
      region: ''
    };
    this.countryComparisonOptions = countryComparison;
    this.chargeCountryComparison();
    this.titles = titles;
    this.regions = regions;
    this.incomeGroups = incomeGroups;
    this.countryContexts = countryContexts;
    this.mapUrlProfile = '#';
    titles.forEach(title => {
      if (title.year === '2016') {
        this.model.year = title;
        this.model.category = title.categories[0];
      }
    });
    this.model.region = this.regions[0];
    this.model.incomeGroup = this.incomeGroups[0];
    this.model.countryContext = this.countryContexts[0];
    this.mapService.createMap('map');
    this.mapConfig();
    this.indicatorSelectedFooter = this.model.year.categories[0].id;
    this.getPartners();
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
  onSelected(event) {
    if (this.countryComparer.firstCountry === this.countryComparer.secondCountry) {
      this.countryComparer.secondCountry = '';
      return;
    }
    this.mapService.paintTwoCountry(event.value);
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
      });
      this.mapService.mouseLeave( () => {
        this.countryName = 'Country';
      });
      this.mapService.clickCountry(event => {
        if (this.selectedTab === 'tab1') {
          self.mapUrlProfile = event.features[0].properties.profile;
          if (self.mapUrlProfile === 'null' || self.mapUrlProfile == null) {
            self.mapUrlProfile = '#';
          }else if (!self.mapUrlProfile.includes('http://')) {
            self.mapUrlProfile = 'http://' + self.mapUrlProfile;
          }
          const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
            layers: ['country-fills']
          });
          this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
          if ( this.selectedCountry ) {
            this.indicatorsSelectedCountry = this.countriesQuery.filter( (a) => a.country === this.selectedCountry)[0];
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
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  selectTab(event) {
    console.log(event.target.id);
    if (event.target.id) {
      this.selectedTab = event.target.id;
      this.mapService.applyFilters(event.target.id);
      this.mapService.resetClickLayer();
      this.selectedCountry = '';
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
    this.updateIndicatorGeojson();
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
  getIndicator(indicator: any) {
    this.footerTab = indicator;
    this.indicatorSelectedFooter = indicator;
    this.footerText = '';
    if (this.selectedCountry) {
      const categories = this.model.year.categories;
      for ( const i of categories ) {
        if (i.id === indicator) {
          if (this.indicatorsSelectedCountry[i.id] === 'Yes' ) {
            this.footerText = this.footerText + i.label + '<br>' + i.yesText + '<br>';
          } else if (this.indicatorsSelectedCountry[i.id] === 'No') {
            this.footerText = this.footerText  + i.label + '<br>' + i.noText + '<br>';
          } else {
            this.footerText = this.footerText + i.label + '<br>' + (i.prefix + ' ' + this.indicatorsSelectedCountry[i.column] + ' ' + i.suffix) + '<br>';
          }
          for (const j of i.subcategories) {
            if (this.indicatorsSelectedCountry[j.column] === 'Yes' ) {
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
    this.mapService.getPartners().subscribe( res => {
      this.partners = res;
    });
  }
}
