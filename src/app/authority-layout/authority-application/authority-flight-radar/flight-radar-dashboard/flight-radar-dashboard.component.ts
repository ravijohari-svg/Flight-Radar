import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { takeUntil } from 'rxjs/operators';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { WebsocketFlightRadarService } from 'src/app/custom-services/authority/websocketFlightRadar';
import { CesiumFunctionService } from 'src/app/custom-services/common/cesium-function.service';
import { environment } from 'src/environments/environment';
declare var Cesium: any;

@Component({
  selector: 'app-flight-radar-dashboard',
  templateUrl: './flight-radar-dashboard.component.html',
  styleUrls: ['./flight-radar-dashboard.component.scss']
})
export class FlightRadarDashboardComponent implements OnInit, OnDestroy {
  viewer: any;
  // overlay container for animated DOM icons
  private overlayContainer: HTMLDivElement | null = null;
  private postRenderListener: any;
  isView: boolean = false;
  entityDescription: any;
  toggleFlag: boolean = false;
  private unSubscribe = new Subject<void>();
  droneEntities: { [flightId: string]: { entity: any, positionProperty: any } } = {};
  droneList: any[] = [];
  searchText: string = '';
  hoveredDrone: any;
  hoverPosition = { x: 0, y: 0 };
  clickHandler: any;
  selectedFlightId: string | null = null;

  get filteredDroneList() {
    if (!this.searchText) {
      return this.droneList;
    }
    return this.droneList.filter(drone => 
      drone.flightId.toLowerCase().includes(this.searchText.toLowerCase()) ||
      drone.operator.toLowerCase().includes(this.searchText.toLowerCase()) ||
      drone.type.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get stats() {
    return {
      active: this.droneList.length,
      manned: this.droneList.filter(d => d.operator === 'Manned Aircraft').length,
      skyeAir: this.droneList.filter(d => d.operator === 'Skye Air').length,
      remoteId: this.droneList.filter(d => d.operator === 'Remote ID').length
    };
  }

  currentTime: Date = new Date();
  clockInterval: any;

  constructor(
    private maplayerService: MapLayersService,
    private websocketFlightRadarService: WebsocketFlightRadarService,
    private cesiumFunction: CesiumFunctionService
  ) {}

  ngOnInit(): void {
    this.initialFunction();
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    let authorityId = '';
    if (localStorage.getItem('AdminDetails')) {
      const decrypt = CryptoJS.AES.decrypt(
        localStorage.getItem('AdminDetails').toString(),
        environment.authorityKey
      );
      const profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      console.log('profileDetails', profileDetails);
      if (profileDetails && profileDetails.UserId) {
        authorityId = profileDetails.UserId;
      }
    }

    if (authorityId) {
      // this.websocketFlightRadarService.connect(environment.websocketFlightRadar + 'AuthorityId=' + authorityId);
      this.websocketFlightRadarService.connect('ws://localhost:8080');
    }

    this.websocketFlightRadarService.getMessages()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((data: any) => {
        if (data?.action === 'drone_batch_update' && this.viewer) {
          const drones = data.drones || [];
          
          drones.forEach((drone: any) => {
            const flightId = drone.UIN;
            const lat = drone.Latitude;
            const lng = drone.Longitude;
            const alt = drone.Altitude || 0;
            const nav_bearing = drone.Heading || 0;
            const nav_pitch = drone.NavPitch || 0;
            const nav_roll = drone.NavRoll || 0;
            const speed = drone.Groundspeed || 0;

            if (lat && lng && flightId) {
              this.updateDroneList(flightId, alt, speed, nav_bearing, drone);

              if (this.droneEntities[flightId]) {
                this.cesiumFunction.updateDroneImage3D(
                  lat, lng, alt, nav_bearing, nav_pitch, nav_roll,
                  this.droneEntities[flightId].entity, this.viewer, this.droneEntities[flightId].positionProperty
                );
                // ensure billboard rotation reflects heading for 2D icon
                try {
                  if (this.droneEntities[flightId].entity?.billboard) {
                    this.droneEntities[flightId].entity.billboard.rotation = Cesium.Math.toRadians(-nav_bearing || 0);
                  }
                } catch (e) {}
              } else {
                const [entity, positionProperty] = this.createDroneEntity(
                  flightId, lat, lng, alt, nav_bearing, nav_pitch, nav_roll
                );
                this.droneEntities[flightId] = { entity, positionProperty };
                if (Object.keys(this.droneEntities).length === 1) {
                  this.viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lng, lat, 2000),
                    duration: 2.0
                  });
                }
              }
              this.viewer.scene.requestRender();
            }
          });
        }
      });
  }

  updateDroneList(flightId: string, alt: number, speed: number, heading: number, telemetry: any) {
    let drone = this.droneList.find(d => d.flightId === flightId);
    if (!drone) {
      // Extract operator and type if available, otherwise set defaults based on ID prefix
      let operator = 'Skye Air';
      let type = telemetry?.Vehicle_kind || 'Unknown';
      
      if (flightId.startsWith('RID')) {
        operator = 'Remote ID';
        type = 'Unknown';
      } else if (flightId.startsWith('MANNED')) {
        operator = 'Manned Aircraft';
        type = 'IndiGo Airlines';
      } else if (flightId.startsWith('TEST') || flightId.startsWith('PROD')) {
         operator = 'Skye Air';
      }

      drone = { 
        flightId: flightId, 
        operator: operator, 
        type: type,
        status: telemetry?.State || 'live' 
      };
      this.droneList.unshift(drone); // Add to top
    }
    
    // Update dynamic properties
    drone.alt = alt;
    drone.speed = speed;
    drone.heading = heading;
    drone.mode = telemetry?.Mode;
    drone.lat = telemetry?.Latitude;
    drone.lng = telemetry?.Longitude;
    drone.lastUpdated = new Date();
  }

  listenForMapSelection(): void {
    if (this.clickHandler) {
      this.clickHandler.destroy();
    }
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    
    this.clickHandler.setInputAction((movement: any) => {
      const picked = this.viewer.scene.pick(movement.endPosition);
      const entityId = picked?.id?.id || picked?.id || '';
      const stringEntityId = typeof entityId === 'string' ? entityId : String(entityId?.id || '');
      
      const hovered = this.droneList.find(d => d.flightId === stringEntityId);
      if (hovered) {
        this.hoveredDrone = hovered;
        this.hoverPosition = {
          x: movement.endPosition.x + 14,
          y: movement.endPosition.y + 14,
        };
      } else {
        this.hoveredDrone = undefined;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  onSearch(event: any) {
    this.searchText = event.target.value;
  }

  focusDrone(drone: any): void {
    if (!this.viewer || !drone?.flightId) {
      return;
    }

    this.selectedFlightId = drone.flightId;
    const entityData = this.droneEntities[drone.flightId];

    if (entityData?.entity) {
      this.viewer.zoomTo(entityData.entity, new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-35),
        1200
      ));
      return;
    }

    if (drone.lat !== undefined && drone.lng !== undefined) {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(drone.lng, drone.lat, 1800),
        duration: 1.2,
      });
    }
  }

  createDroneEntity(flightId: string, lat: number, lng: number, alt: number, nav_bearing: number, nav_pitch: number, nav_roll: number) {
    let scale = 0.2;
    var heading = Cesium.Math.toRadians(nav_bearing - 90);
    var pitch = Cesium.Math.toRadians(nav_pitch);
    var roll = Cesium.Math.toRadians(nav_roll);
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

    const positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    const time = Cesium.JulianDate.now();
    const position = Cesium.Cartesian3.fromDegrees(lng, lat, alt);
    positionProperty.addSample(time, position);
    
    // determine operator (if available) so we can choose a 2D billboard for manned flights
    const droneMeta = this.droneList.find(d => d.flightId === flightId) || { operator: '' };
    const isManned = droneMeta.operator === 'Manned Aircraft';

    // create only a 2D billboard (no 3D model required)
    let droneEntity = this.viewer.entities.add({
      id: flightId,
      position: positionProperty,
      billboard: {
        image: 'assets/common-layout/drone2D.gif',
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scale: 0.9,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        // hide Cesium billboard when DOM overlay is used to avoid duplicate icons
        show: new Cesium.CallbackProperty(() => {
          try { return !this.overlayContainer; } catch (e) { return true; }
        }, false),
        rotation: Cesium.Math.toRadians(-nav_bearing || 0),
      }
    });

    return [droneEntity, positionProperty];
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.clickHandler) {
      this.clickHandler.destroy();
    }
    if (this.postRenderListener && this.viewer?.scene) {
      try { this.viewer.scene.postRender.removeEventListener(this.postRenderListener); } catch (e) {}
    }
    if (this.overlayContainer) {
      try {
        // remove event listeners if present
        try { this.overlayContainer.removeEventListener('mousemove', () => {}); } catch (e) {}
        try { this.overlayContainer.removeEventListener('mouseleave', () => {}); } catch (e) {}
        this.overlayContainer.remove();
      } catch (e) {}
      this.overlayContainer = null;
    }
    if (this.viewer && this.viewer.entities) {
      Object.keys(this.droneEntities).forEach(flightId => {
        if (this.droneEntities[flightId]?.entity) {
          this.viewer.entities.remove(this.droneEntities[flightId].entity);
        }
        this.viewer.entities.removeById(flightId);
      });
    }
    this.droneEntities = {};
    this.unSubscribe.next();
    this.unSubscribe.complete();
    this.websocketFlightRadarService.closeConnection();
  }

  initialFunction() {
    this.maplayerService.initialized
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((viewer) => {
        if (viewer) {
          this.viewer = viewer;
          // create DOM overlay for animated GIFs
          try {
            this.overlayContainer = document.createElement('div');
            this.overlayContainer.style.position = 'absolute';
            this.overlayContainer.style.left = '0';
            this.overlayContainer.style.top = '0';
            this.overlayContainer.style.pointerEvents = 'none';
            this.overlayContainer.style.width = '100%';
            this.overlayContainer.style.height = '100%';
            this.overlayContainer.className = 'cesium-gif-overlay';
            const parent = this.viewer.container || this.viewer.scene.canvas.parentElement;
            parent && parent.appendChild(this.overlayContainer);
              // register render loop to update positions
              this.postRenderListener = () => this.updateOverlayPositions();
              this.viewer.scene.postRender.addEventListener(this.postRenderListener);
              // overlay mouse handlers to show hover details for DOM icons
              try {
                this.overlayContainer.addEventListener('mousemove', (ev: MouseEvent) => {
                  const target = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
                  const img = target && target.closest && target.closest('img[data-flight]') as HTMLImageElement | null;
                  if (img) {
                    const fid = img.getAttribute('data-flight') || '';
                    const drone = this.droneList.find(d => d.flightId === fid);
                    if (drone) {
                      this.hoveredDrone = drone;
                      // position hover slightly offset from cursor
                      const rect = (this.viewer && this.viewer.container) ? (this.viewer.container.getBoundingClientRect()) : { left: 0, top: 0 };
                      this.hoverPosition = { x: ev.clientX - rect.left + 14, y: ev.clientY - rect.top + 14 };
                    }
                  } else {
                    this.hoveredDrone = undefined;
                  }
                });
                this.overlayContainer.addEventListener('mouseleave', () => { this.hoveredDrone = undefined; });
              } catch (e) {}
          } catch (e) {
            this.overlayContainer = null;
          }
          if (this.viewer.entities) {
            this.viewer.entities.removeAll();
            this.droneEntities = {};
            this.droneList = [];
            this.viewer.scene.requestRender();
          }
          this.listenForMapSelection();
        }
      });
  }

  private ensureOverlayImage(flightId: string): HTMLImageElement | null {
    if (!this.overlayContainer) return null;
    let existing = this.overlayContainer.querySelector<HTMLImageElement>(`img[data-flight="${flightId}"]`);
    if (existing) return existing;
    const img = document.createElement('img');
    img.setAttribute('data-flight', flightId);
    img.src = 'assets/common-layout/drone2D.gif';
    // store a base pixel size on the element so we can scale it with camera distance
    // increase default base size so the drone image appears a bit larger
    img.dataset.baseWidth = '120';
    img.style.width = img.dataset.baseWidth + 'px';
    img.style.height = 'auto';
    img.style.position = 'absolute';
    img.style.transform = 'translate(-50%,-50%)';
    img.style.pointerEvents = 'auto';
    this.overlayContainer.appendChild(img);
    return img;
  }

  private updateOverlayPositions() {
    if (!this.viewer || !this.overlayContainer) return;
    try {
      Object.keys(this.droneEntities).forEach((flightId) => {
        const holder = this.droneEntities[flightId];
        const entity = holder?.entity;
        if (!entity || !holder?.positionProperty) return;
        const pos = holder.positionProperty.getValue(Cesium.JulianDate.now());
        if (!pos) return;
        const windowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, pos);
        if (!windowPos) return;
        const img = this.ensureOverlayImage(flightId);
        if (!img) return;
        img.style.left = `${Math.round(windowPos.x)}px`;
        img.style.top = `${Math.round(windowPos.y)}px`;
        // rotate based on latest drone heading if available
        const droneMeta = this.droneList.find(d => d.flightId === flightId);
        const heading = droneMeta?.heading || 0;
          // compute a distance-based scale so the icon appears smaller when zoomed out
          try {
            const baseWidth = parseFloat(img.dataset.baseWidth || '80');
            const cameraPos = this.viewer.camera.position;
            let distance = 1;
            if (cameraPos) {
              distance = Cesium.Cartesian3.distance(cameraPos, pos) || 1;
            }
            // simple heuristic: size = base * (k / distance)
            // tune k to get reasonable on-screen sizes; clamp to min/max
            const k = 1500; // larger k => larger icons at same distance
            let size = Math.round(baseWidth * (k / distance));
            const minSize = 34; // px
            const maxSize = 220; // px
            if (size < minSize) size = minSize;
            if (size > maxSize) size = maxSize;
            img.style.width = `${size}px`;
          } catch (e) {}
          img.style.transform = `translate(-50%,-50%) rotate(${heading}deg)`;
      });
    } catch (e) {}
  }

  close(val: any) {
    this.isView = val;
  }

  toggle2D3D(val: any) {
    this.toggleFlag = val;
    this.toggleFlag = !this.toggleFlag;
    if (this.toggleFlag) {
      this.viewer.scene.mode = Cesium?.SceneMode?.SCENE2D;
    } else {
      this.viewer.scene.mode = Cesium?.SceneMode?.SCENE3D;
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
    }
    this.viewer.scene.requestRender();
  }
}
