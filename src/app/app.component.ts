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
  countryName: string;
  countryNameOnClick: string;
  title = 'app';
  modalRef: BsModalRef;
  year: any = '2016';
  map: any = {};
  name: any;
  vector;
  titles;
  years;
  model = {
    year: null,
    category: {
      title: ''
    },
    subcategory: null
  };
  indicatorTitle: any;
  constructor(
    private mapService: MapService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    this.countryNameOnClick="";
    this.vector = titles;
    this.titles = titles;
    titles.forEach(title => {
      if (title.year == '2016') {
        this.model.year = title;
      }
    });
    const vec = [];
      for(let i = 0; i <= 10; i++) {
        vec.push(''+i);
        vec.push(i +'a');
        vec.push(i + 'b');
      }
    this.vector.sort(function(a,b) {
      if (a[0] !== b[0]) {
        return a[0] - b[0];
      }
      let da = a[1], db = b[1];
      return vec.indexOf(da) - vec.indexOf(db);
    });
    this.mapService.createMap('map').subscribe(res => {
      this.map['type'] = "FeatureCollection";
      this.map['features'] = [];
      for (let x of res) {
        let object = {
          type: 'Feature',
          properties: {
            name: x.country
          },
          geometry: JSON.parse(x.geom)
        }
        this.map.features.push(object);
      }
      this.build();
      this.name = res.country;
    });
    this.year = 2016;
    this.indicatorTitle = "";
    this.pickCountry();
  }
  build() {
    let self = this;
    this.mapService.onLoading(() => {
      this.mapService.build(this.map, this.name);
      this.mapService.mouseCountryHover(data => {
        this.countryName = data.features[0].properties.name;
        let countries = self.mapService.map.queryRenderedFeatures(data.point, {
          layers: ['state-fills']
        });
      });
    });
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  selectTab(event) {
    const target = event.target.id;
    const div1 = document.getElementById('div1');
    const div2 = document.getElementById('div2');
    if (target === 'tab1') {
      div1.className = 'col-md-4 padding-left-none';
      div2.className = 'col-md-8 border-div-none';
    } else {
      div1.className = 'col-md-7 padding-left-none';
      div2.className = 'col-md-5 border-div-none';
    }
  }

  indTitleSelect(event) {
    this.vector.filter(res => {
      let found = false;
      for (let x of res) {
        if (found) {
          this.indicatorTitle = x;
        }
        if (x === event) {
          found = true;
        }
      }
    });
  }

  set() {
    return this.indicatorTitle;
  }
  updateYear(y) {
    if (y) {
      this.year = y;
    }
  }

  filterItemsOfType() {
    const x = this.vector.filter(x => {
      return x.length > 0 && x[2].length !== 0 && x[0] === +this.year;
    });
    return x;
  }

  pickCountry() {
    const _this = this;
    this.mapService.clickCountry((ev) => {
      _this.countryNameOnClick = ev.features[0].properties.name;
      if(!_this.mapService.pickCountry(ev)) {
        _this.countryNameOnClick = "";
      }
    });
  }


}
