import { Component, Inject } from '@angular/core';
import {MapService} from './map.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(
    private mapService: MapService
  ) {}

  ngOnInit() {
    this.mapService.createMap('map');
  }

}
