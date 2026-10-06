import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';
import { Constants } from 'src/app/constants/constants';

export class CustomReuseStrategy implements RouteReuseStrategy {

  currentPath;
  futurePath;

  
  private handlers: { [key: string]: DetachedRouteHandle } = {};

  // 2 ----- if 1: false , check if we want to store the route or not if return true then store is fire
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Do not store any routes if the route comes from the mission and goes to the dashboard
    //this is operator
    if (this.currentPath === 'mission' && this.futurePath === 'dashboard' || this.currentPath === 'blackbox' && this.futurePath === 'create-mission' || this.currentPath === 'mission' && this.futurePath === 'drones-gears'
    || this.currentPath === 'mission' && this.futurePath === 'operators-setting') {
      return false;
    }
    ///this is for authority
    if (this.currentPath === 'blackbox' && this.futurePath === 'dashboard'
       || this.currentPath === 'blackbox' && this.futurePath === 'rule-engine' || this.currentPath === 'blackbox' && this.futurePath ==='admin' || this.currentPath === 'blackbox' && this.futurePath === 'onelap') {
      return false;
    }
    //this for the authority overview
    if( this.currentPath === 'blackbox/:metric' && this.futurePath === 'dashboard' || this.currentPath === 'blackbox/:metric' && this.futurePath === 'rule-engine'
   || this.currentPath === 'blackbox/:metric' && this.futurePath === 'admin'
    || this.currentPath === 'blackbox/:metric' && this.futurePath === 'onelap'){
      return false;
    }
  
    // Determine if the route component should be detached for reuse
    return (
      route.routeConfig?.path === Constants.ReuseAddress_droneParameters ||
      route.routeConfig?.path === Constants.ReuseAddress_missionParamters ||
      route.routeConfig?.path === Constants.ReuseAddress_blackbox
    );
  }
  // 3 ------ if 2: true, then store the route
  // store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
  //   // Store the detached route handle for future reuse
  //   if (route.routeConfig?.path === Constants.ReuseAddress_droneParameters) {
  //     this.handlers[Constants.ReuseAddress_droneParameters] = handle;
  //   }
  //   if (route.routeConfig?.path === Constants.ReuseAddress_missionParamters) {
  //     this.handlers[Constants.ReuseAddress_missionParamters] = handle;
  //   }
  //   if (route.routeConfig?.path === Constants.ReuseAddress_blackbox) {
  //     this.handlers[Constants.ReuseAddress_blackbox] = handle;
  //   }
  // }
  //alternate to above store method, to avoid multiple handlers
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const path = route.routeConfig?.path;
    if (path) {
      const handlerKey = this.getHandlerKeyFromPath(path);
      if (handlerKey) {
        this.handlers[handlerKey] = handle;
      }
    }
  }
  private getHandlerKeyFromPath(path: string): string | null {
    const handlerKeys: { [path: string]: string } = {
      [Constants.ReuseAddress_droneParameters]:
        Constants.ReuseAddress_droneParameters,
      [Constants.ReuseAddress_missionParamters]:
        Constants.ReuseAddress_missionParamters,
      [Constants.ReuseAddress_blackbox]: Constants.ReuseAddress_blackbox,
    };
    return handlerKeys[path] || null;
  }

  //5 retrun the attached route handle
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Determine if the route component should be reattached
    return (
      (route.routeConfig?.path === Constants.ReuseAddress_droneParameters &&
        !!this.handlers[Constants.ReuseAddress_droneParameters]) ||
      (route.routeConfig?.path === Constants.ReuseAddress_blackbox &&
        !!this.handlers[Constants.ReuseAddress_blackbox]) ||
      (route.routeConfig?.path === Constants.ReuseAddress_missionParamters &&
        !!this.handlers[Constants.ReuseAddress_missionParamters])
    );
  }

  // retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
  //   // Retrieve the stored detached route handle for reuse
  //   if (route.routeConfig?.path === Constants.ReuseAddress_droneParameters) {
  //     return this.handlers[Constants.ReuseAddress_droneParameters] || null;
  //   }
  //   if (route.routeConfig?.path === Constants.ReuseAddress_blackbox) {
  //     return this.handlers[Constants.ReuseAddress_blackbox] || null;
  //   }
  //   if (route.routeConfig?.path === Constants.ReuseAddress_missionParamters) {
  //     return this.handlers[Constants.ReuseAddress_missionParamters] || null;
  //   }
  //   return null;
  // }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
  
    // if (!route.routeConfig) { return null as any; }
    // if (route.routeConfig.loadChildren) {
    //   Object.keys(this.handlers).forEach(key => delete this.handlers[key]);
    //   return null as any;
    // }
    // return this.handlers[this.calcKey(route)];

    // if(  this.currentPath !== 'dashboard' && this.futurePath !== 'blackbox/:metric' ) {
    //   return null;
    // }
    const path = route.routeConfig?.path;
    if (path) {
      const handlerKey = this.getHandlerKeyFromPath(path);
      return handlerKey ? this.handlers[handlerKey] || null : null;
    }
    return null;

  }

  //1 should return false in mismatch of route
  //4 this will again hit when we go back and router miss-match results give false, and this time shouldAttach fire
  // And we can decide whether we want regenrate the component or reuse from memory
  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    current: ActivatedRouteSnapshot
  ): boolean {
    this.currentPath = current.routeConfig?.path;
    this.futurePath = future.routeConfig?.path;
    // console.log("current: " + this.currentPath, "future: " + this.futurePath)
    // Determine if the route component should be reused
    return future.routeConfig === current.routeConfig;
  }
}
