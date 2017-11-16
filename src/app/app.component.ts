import { MapService } from './services/map.service';
import { Component, Inject, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { titles } from './titles';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selectedCountry: any = false;
  selectedTab = 'tab1';
  countryName = 'Country';
  countryNameOnClick: string;
  title = 'app';
  modalRef: BsModalRef;
  year: any = '2016';
  geojson: any = {};
  name: any;
  titles: any;
  years: any;
  model = {
    year: null,
    category: {
      label: 'Select indicator',
      title: ''
    },
    subcategory: null
  };
  openedIndicator: string;
  indicatorTitle: any;
  constructor(
    private mapService: MapService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    this.countryNameOnClick = '';
    this.titles = titles;
    titles.forEach(title => {
      if (title.year === '2016') {
        this.model.year = title;
      }
    });
    this.mapService.createMap('map');
    this.mapConfig();
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
        const selectedCountry = self.mapService.map.queryRenderedFeatures(event.point, {
          layers: ['country-fills']
        });
        this.selectedCountry = self.mapService.paintOneCountry(selectedCountry[0].properties.country);
      });
    });
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  selectTab(event) {
    this.selectedTab = event.target.id;
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

}
