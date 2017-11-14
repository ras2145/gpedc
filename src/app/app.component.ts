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
  title = 'app';
  modalRef: BsModalRef;
  year: any;
  map: any = {};
  name: any;
  vector;
  constructor(
    private mapService: MapService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
    this.vector=titles;
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
  }
  build(){
    this.mapService.build(this.map,this.name);
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  selectTab(event) {
    const target = event.target.id;
    const div1 = document.getElementById('div1');
    const div2 = document.getElementById('div2');
    if (target === 'tab1') {
      div1.className = 'col-md-5 padding-left-none';
      div2.className = 'col-md-7 border-div-none';
    } else {
      div1.className = 'col-md-7 padding-left-none';
      div2.className = 'col-md-5 border-div-none';
    }
  }
  updateYear(y){
    if(y){
      this.year = y;
    }
  }

  filterItemsOfType(){
    const x = this.vector.filter(x => {
      return x.length > 0 && x[2].length !== 0 && x[0]===+this.year;
    });
    return x;
  }
}
