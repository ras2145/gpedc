
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CountryComponent } from './country/country.component';
import { PartnerComponent } from './partner/partner.component';
import { ViewerComponent } from './viewer/viewer.component';


export const appRoutes: Routes = [
    {
    path: '',
    redirectTo: '/viewer',
    pathMatch: 'full'
    },{
      path: 'country', 
      component: CountryComponent
    },{
      path: 'partner', 
      component: PartnerComponent
    },{
    path: 'viewer',
    component: ViewerComponent
  }
  ];

export const Routing = RouterModule.forRoot( appRoutes );
