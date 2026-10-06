import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

Cesium.buildModuleUrl.setBaseUrl('/assets/cesium/');
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMjAwMTU5Ny0zMWQ4LTRlOWEtOGY1My1jMGI2NDUxMGRmOWQiLCJpZCI6NTg4MTksImlhdCI6MTYyMzUwMjQ1MX0.wnG9CO9c5ycWMwO4f0tHsliU4rRfTBDCQ2pMF-E__s4";

// Mohith credentials
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NTM3OTFiYS00YzliLTRkNjctYTkwNS1jOGI4Njk1NGViODgiLCJpZCI6NjAwMTYsImlhdCI6MTY2Nzg0MTAyOH0.aLlLjBq4aEdBGBytkuGKupHYar3RPAjW4T0h8UkIc4g';


//23.462677, 71.796582 26.307909, 86.993809
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(77.996582,20.562677,81.593809,21.807909);

// Cesium.BingMapsApi.defaultKey = 'AjvekXFV3SFSzBrZl-BR61_RKyGfkyXCiQiXhk3dJw8UV-V99vc_Xz6sBti6S24U';
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMjAwMTU5Ny0zMWQ4LTRlOWEtOGY1My1jMGI2NDUxMGRmOWQiLCJpZCI6NTg4MTksImlhdCI6MTYyMzUwMjQ1MX0.wnG9CO9c5ycWMwO4f0tHsliU4rRfTBDCQ2pMF-E__s4
// Cesium.buildModuleUrl.setBaseUrl('/assets/cesium/');
// //Cesium.Ion.defaultAccessToken="";
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// document.addEventListener('DOMContentLoaded', () => {
//                                                                                                                                                                                                                                                                                                                                                                                                          document.addEventListener('DOMContentLoaded', () => {
//                                                                                                                                                                                                                                                                                                                                                                                                             platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));
                                                                                                                                                                                                                                                                                                                                                                                                      //     });
                                                                                                                                                                                                                                                                                                                                                                                                      //  });

