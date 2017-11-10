import { WebService } from './services/web.service';
import { MapService } from './services/map.service';

import {HttpModule, RequestOptions, XHRBackend} from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Ng2BootstrapModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';


export function httpServiceFactory(backend: XHRBackend, defaultOptions: RequestOptions) {
  return new WebService(backend, defaultOptions);
}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Ng2BootstrapModule.forRoot(),
    HttpModule,
    FormsModule
  ],
  providers: [
    MapService,
    WebService,
    {
      provide: WebService,
      useFactory: httpServiceFactory,
      deps: [XHRBackend, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
