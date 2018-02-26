import { WebService } from './services/web.service';
import { MapService } from './services/map.service';
import { LoaderService } from './services/loader.service';
import { GenerateIndicatorsService} from './services/generate-indicators.service';
import { ModelService } from './services/model.service';
import { RouterModule, Routes } from '@angular/router';
import {HttpModule, RequestOptions, XHRBackend} from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Ng2BootstrapModule } from 'ngx-bootstrap';
import { SelectModule } from '../app/lib/ng-select';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { CountryComponent } from './country/country.component';
import { PartnerComponent } from './partner/partner.component';
import { ViewerComponent } from './viewer/viewer.component';
import { Routing } from './app.routes';
import { CountryHistoricalComponent } from './country-historical/country-historical.component';
import { PartnerHistoricalComponent } from './partner-historical/partner-historical.component';
import { DropdownComponent } from './dropdown/dropdown.component';



export function httpServiceFactory(backend: XHRBackend, defaultOptions: RequestOptions) {
  return new WebService(backend, defaultOptions);
}
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CountryComponent,
    PartnerComponent,
    ViewerComponent,
    CountryHistoricalComponent,
    PartnerHistoricalComponent,
    DropdownComponent
  ],
  imports: [
    BrowserModule,
    Routing,
    Ng2BootstrapModule.forRoot(),
    HttpModule,
    FormsModule,
    SelectModule
  ],
  providers: [
    MapService,
    WebService,
    GenerateIndicatorsService,
    LoaderService,
    ModelService,
    {
      provide: WebService,
      useFactory: httpServiceFactory,
      deps: [XHRBackend, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
