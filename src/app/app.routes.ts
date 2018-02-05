

import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CountryComponent } from './country/country.component';
import { PartnerComponent } from './partner/partner.component';


export const appRoutes: Routes = [
    {path: '', component: AppComponent},
    {path: 'country', component: CountryComponent},
    {path: 'partner', component: PartnerComponent},
  ];

export const Routing = RouterModule.forRoot( appRoutes );
