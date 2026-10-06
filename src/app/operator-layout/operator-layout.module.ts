import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperatorLayoutComponent } from './operator-layout.component';
import { OperatorLayoutRoutingModule } from './operator-layout-routing.module';
import { OperatorLoginComponent } from './operator-login/operator-login.component';
import { HttpClientModule } from '@angular/common/http';

//Services
import { OperatorapisService } from '../custom-services/operator/operatorapis.service';

//Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperatorLandingPageComponent } from './operator-landing-page/operator-landing-page.component';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OperatorNewLandingPageComponent } from './operator-new-landing-page/operator-new-landing-page.component';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import { ContactComponent } from './contact/contact.component';
@NgModule({
  declarations: [OperatorLayoutComponent, OperatorLoginComponent, OperatorLandingPageComponent, OperatorNewLandingPageComponent, ContactComponent],
  imports: [
    CommonModule,
    OperatorLayoutRoutingModule,
    //Forms
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CarouselModule,
    CdkAccordionModule
  ],
  providers : [
    OperatorapisService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class OperatorLayoutModule { }
