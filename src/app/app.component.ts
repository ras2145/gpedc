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
  categoriesNotNull: any;
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
    this.titles = titles;
    this.regions = regions;
    this.incomeGroups = incomeGroups;
    this.countryContexts = countryContexts;
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
          const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
            layers: ['country-fills']
          });
          this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
          if ( this.selectedCountry ) {
            this.mapService.getIndicatorCountry(this.selectedCountry)
            .subscribe( res => {
              this.indicatorsSelectedCountry = res;
              this.getCategoriesNotNull();
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
  getIndicator(indicator: any) {
    this.indicatorSelectedFooter = indicator;
    this.footerText = '';
    if (this.selectedCountry) {
      const categories = this.model.year.categories;
      for ( const i of categories ) {
        if (i.id === indicator) {
          if (this.indicatorsSelectedCountry[i.id] === 'Yes' ) {
            this.footerText = this.footerText + i.label + '<br>' + i.yesText + '<br>';
          } else if (this.indicatorsSelectedCountry[i.id] === 'No') {
            this.footerText = this.footerText + i.label + '<br>' + i.noText + '<br>';
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
}
