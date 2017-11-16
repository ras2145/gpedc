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
  twoCountries = [];
  selectedCountry: any = false;
  selectedTab = 'tab1';
  countryName = 'Country';
  title = 'app';
  modalRef: BsModalRef;
  year: any = '2016';
  geojson: any = {};
  name: any;
  titles: any;
  years: any;
  regions: any;
  incomeGroups: any;
  countryContexts: any;
  footerText = '';
  model = {
    year: null,
    category: {
      label: 'Select indicator',
      title: ''
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
    this.titles = titles;
    this.regions = regions;
    this.incomeGroups = incomeGroups;
    this.countryContexts = countryContexts;
    titles.forEach(title => {
      if (title.year === '2016') {
        this.model.year = title;
      }
    });
    this.model.region = this.regions[0];
    this.model.incomeGroup = this.incomeGroups[0];
    this.model.countryContext = this.countryContexts[0];
    this.mapService.createMap('map');
    this.mapConfig();
  }
  getCategories() {
    for (const ele of this.titles){
      if (ele.year === this.model.year['year']) {
        return ele.categories;
      }
    }
  }
  mapConfig() {
    const self = this;
    this.mapService.onLoad(() => {
      this.mapService.getCountriesGeoJSON().subscribe(geojson => {
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
          const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
            layers: ['country-fills']
          });
          this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
        } else if (this.selectedTab === 'tab2') {
          const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
            layers: ['country-fills']
          });
          this.twoCountries = self.mapService.paintTwoCountry(selectedCountry[0].properties.country);
        }
      });
    });
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  selectTab(event) {
    this.selectedTab = event.target.id;
    this.mapService.applyFilters(event.target.id);
    this.mapService.resetClickLayer();
  }

  updateYear(y) {
    if (y) {
      this.year = y;
    }
  }

  selectCategory(category) {
    this.model.category = category;
    this.model.subcategory = null;
  }
  selectSubcategory(category, subcategory) {
    this.model.category = category;
    this.model.subcategory = subcategory;
  }
  onIndicatorOver(category) {
    this.openedIndicator = category.id;
  }
  selectRegion(region) {
    this.model.region = region;
  }
  selectIncomeGroup(incomeGroup) {
    this.model.incomeGroup = incomeGroup;
  }
  selectCountryContext(countryContext) {
    this.model.countryContext = countryContext;
  }
  updateIndicatorGeojson() {
    //TODO grisaf update geojson
  }

  getIndicator(indicator: any) {
    //TODO arreglar texto y primer tab
    this.footerText = '';
    if (this.selectedCountry) {
      this.mapService.getIndicatorCountry(this.selectedCountry)
      .subscribe( res => {
        const categories = this.getCategories();
        for ( let i of categories ) {
          if (i.id === indicator) {
            for (let j of i.subcategories) {
              if (res[j.column] === 'Yes' ) {
                this.footerText = this.footerText + j.yesText + '\n';
              } else if (res[j.column] === 'No') {
                this.footerText = this.footerText + j.noText + '\n';
              } else {
                this.footerText = this.footerText + (j.prefix + ' ' + res[j.column] + ' ' + j.suffix) + '\n';
              }
            }
          }
        }
      });
    }
  }
}
