import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//HTTP
import { HttpClientModule } from '@angular/common/http';

//Router
import { RouterModule } from '@angular/router';
//Cesium
import { NgxEchartsModule } from 'ngx-echarts';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TestCcavenueComponent } from './test-ccavenue/test-ccavenue.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RetryInterceptor } from './custom-services/interceptor/retry.interceptor';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './custom-services/router-reuse-strategy/custom-reuse-strategy';

@NgModule({
  declarations: [AppComponent, TestCcavenueComponent],
  imports: [
    // BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    //Router
    RouterModule,
    //Ngx-echarts
    NgxEchartsModule.forRoot({
      echarts: loadEcharts,
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ],
  bootstrap: [AppComponent],
  exports: [
    // AngularCesiumModule,
  ],
})
export class AppModule {}
export function loadEcharts() {
  return import('echarts');
}
