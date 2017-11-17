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
  twoCountries = [];
  selectedCountry: any = false;
  indicatorsSelectedCountry: any;
  indicatorSelectedFooter: any;
  selectedTab = 'tab1';
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
    this.indicatorSelectedFooter = this.model.year.categories[0].id;
    console.log(this.model);
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
          if ( this.selectedCountry ) {
            this.mapService.getIndicatorCountry(this.selectedCountry)
            .subscribe( res => {
              this.indicatorsSelectedCountry = res;
              this.getIndicator(this.indicatorSelectedFooter);
            });
          } else {
            this.indicatorSelectedFooter = this.model.year.categories[0].id;
          }
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
    this.indicatorSelectedFooter = indicator;
    this.footerText = '';
    if (this.selectedCountry) {
      const categories = this.model.year.categories;
      for ( const i of categories ) {
        if (i.id === indicator) {
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
}
