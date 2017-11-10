import { Component, Inject, TemplateRef } from '@angular/core';
import {MapService} from './map.service';
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

}
