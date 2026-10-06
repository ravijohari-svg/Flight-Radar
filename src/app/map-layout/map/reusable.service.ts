/**
 * @description
 * This service is responsible for dynamically managing the MapComponent within different views.
 * @author
 * Saroj Kumar Pahi / Yash Murjani
 */

import { Injectable, ViewContainerRef, ComponentRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { MapComponent } from './map.component';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';

@Injectable({ providedIn: 'root' })
export class ReusableService {
  private componentRef: ComponentRef<MapComponent> | null = null;
  private currentViewContainerRef: ViewContainerRef | null = null;

  constructor(
    private router: Router,
    private mapLayerService: MapLayersService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && this.currentViewContainerRef) {
        this.mapLayerService.resetMap(true);
        this.detach();
      }
    });
  }

  public attach(viewContainerRef: ViewContainerRef): void {
    this.currentViewContainerRef = viewContainerRef;
    this.createComponentIfNeeded();
    if (this.componentRef) {
      viewContainerRef.insert(this.componentRef.hostView);
    }
  }

  public detach(): void {
    if (this.componentRef && this.currentViewContainerRef) {
      const index = this.currentViewContainerRef.indexOf(this.componentRef.hostView);
      if (index !== -1) {
        this.currentViewContainerRef.detach(index);
      }
    }
  }

  private createComponentIfNeeded(): void {
    if (!this.componentRef && this.currentViewContainerRef) {
      this.componentRef = this.currentViewContainerRef.createComponent(MapComponent);
    }
  }
}
// export class ReusableService {
//   private componentRef: ComponentRef<MapComponent>;
//   private currentViewContainerRef: ViewContainerRef;

//   constructor(
//     private componentFactoryResolver: ComponentFactoryResolver,
//     private injector: Injector,
//     private router: Router,
//     private mapLayerService: MapLayersService
//   ) {
//     this.createInjector();
//     this.router.events.subscribe((event) => {
//       if (event instanceof NavigationStart && this.currentViewContainerRef) {
//         this.mapLayerService.resetMap(true);
//         this.detach(this.currentViewContainerRef);
//       }
//     });
//   }
//   createInjector() {
//     const componentFactory =
//       this.componentFactoryResolver.resolveComponentFactory(MapComponent);
//     this.componentRef = componentFactory.create(this.injector);
//   }
//   public attach(viewContainerRef: ViewContainerRef) {
//     try {
//       this.currentViewContainerRef = viewContainerRef;
//       viewContainerRef.insert(this.componentRef.hostView);
//     } catch (error) {
//       // console.log(error);
//       this.createInjector();
//       this.attach(viewContainerRef);
//     }
//   }

//   public detach(viewContainerRef: ViewContainerRef) {
//     try {
//       viewContainerRef.detach(
//         viewContainerRef.indexOf(this.componentRef.hostView)
//       );
//     } catch (err) {
//       // console.log(err);
//     }
//   }
// }