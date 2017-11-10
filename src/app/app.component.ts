import { MapService } from './services/map.service';
import { Component, Inject, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  modalRef: BsModalRef;
  constructor(
    private mapService: MapService,
    private modalService: BsModalService,
  ) {}

  ngOnInit() {
    this.mapService.createMap('map');
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  selectTab (event) {
    const target = event.target.id;
    const div1 = document.getElementById('div1');
    const div2 = document.getElementById('div2');
    if (target === 'tab1' ) {
      div1.className = 'col-md-5 padding-left-none';
      div2.className = 'col-md-7 border-div-none';
    } else {
      div1.className = 'col-md-7 padding-left-none';
      div2.className = 'col-md-5 border-div-none';
    }
  }

}
