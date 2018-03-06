import { Component, OnInit, TemplateRef, AfterViewInit, ViewChild, Input, OnChanges } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnChanges {
  modalRef: BsModalRef;
  viewModal: boolean;
  mapTitle = '';
  indicator = true;
  @ViewChild('tuto') tuto: TemplateRef<any>;
  tutorial = [
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ];
  @Input() titleSubject: Subject<any>;
  constructor(private modalService: BsModalService) { }

  ngOnInit() {
    console.log('navbar loaded!');
  }
  ngOnChanges() {
    this.titleSubject.subscribe(event => {
      this.indicator = event.indicator ;
      this.mapTitle = event.mapTitle ;
      console.log('cambio', event.indicator);
    });
  }
  ngAfterViewInit () {
    if (!window.localStorage.getItem('tutorial')) {
      this.openModal(this.tuto);
    }
    localStorage.setItem('tutorial', 'ok');
  }

  openModal(template: TemplateRef<any>) {
    this.viewModal = false;
    this.modalRef = this.modalService.show(template);
  }
  continueTutorial() {
    let index = -1;
    for (let i = 0; i < this.tutorial.length; i++) {
      if (this.tutorial[i]) {
        index = i;
      }
    }
    if (index === -1) {
      this.tutorial[0] = true;
    } else {
      this.tutorial[index] = false;
      this.tutorial[(index + 1) % this.tutorial.length] = true;
    }
  }

  selectTutorial(index) {
    this.unselectTutorial();
    this.tutorial[index] = true;
  }

  unselectTutorial() {
    for (let i = 0; i < this.tutorial.length; i++) {
      this.tutorial[i] = false;
    }
  }
}
