import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { WebsocketFlightRadarService } from 'src/app/custom-services/authority/websocketFlightRadar';
import { AuthorityApplicationComponent } from '../authority-application.component';
import { environment } from 'src/environments/environment';

interface MannedFlight {
  adshex?: string;
  icao24?: string;
  callsign?: string;
  flightNo?: string;
  aircraftType?: string;
  airline?: string;
  manufacturer?: string;
  owner?: string;
  originCountry?: string;
  origin?: string;
  destination?: string;
  route?: string;
  photoUrl?: string;
  photoThumbnailUrl?: string;
  lat?: number;
  lon?: number;
  rawLat?: number;
  rawLon?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  verticalRate?: number;
  squawk?: string;
  lastUpdate?: string;
  status?: string;
  updatedAtMs?: number;
  source?: string;
  registration?: string;
}

interface AnimatedPlaneEntity {
  entity: any;
  from: MannedFlight;
  to: MannedFlight;
  startedAt: number;
}

@Component({
  selector: 'app-authority-manned-flight',
  templateUrl: './authority-manned-flight.component.html',
  styleUrls: ['./authority-manned-flight.component.scss'],
})
export class AuthorityMannedFlightComponent implements OnInit, OnDestroy {
  profileDetails: any;
  viewer: any;
  planes: MannedFlight[] = [];
  filteredPlanes: MannedFlight[] = [];
  droneList: any[] = [];
  filteredDroneList: any[] = [];
  droneEntities: { [flightId: string]: any } = {};
  hoveredDrone: any;
  hoverPositionDrone = { x: 0, y: 0 };
  selectedDroneId: string | null = null;
  // overlay container for animated DOM icons
  private overlayContainer: HTMLDivElement | null = null;
  private postRenderListener: any;
  selectedPlane: MannedFlight;
  searchText = '';
  private destroy$ = new Subject<void>();
  isDestroyed = false;
  selectedAltitude = 'all';
  selectedStatus = 'all';
  selectedLayer = 'Map';
  activeTab = 'flights';
  jumpText = '';
  locationSearchMessage = '';
  isSearchingLocation = false;
  isLoading = false;
  isWithinFetchZoom = false;
  lastUpdated = new Date();
  refreshInterval: any;
  renderInterval: any;
  movementInterval: any;
  cameraDebounce: any;
  cameraMoveListener: any;
  clickHandler: any;
  currentPosition: { lat: number; lon: number };
  readonly refreshMs = 60000;
  readonly positionUpdateMs = 1000;
  readonly stalePlaneMs = 60000;
  readonly maxPlaneFetchHeight = 750000;
  readonly minPlaneFetchHeight = 500;
  readonly entityPrefix = 'Manned Flight ';
  readonly openSkyApiPath = '/opensky/api/states/all';
  readonly adsbdbApiPath = '/adsbdb/v0';
  readonly maxEnrichmentRequests = 24;
  liveDataMessage = 'Zoom closer to load OpenSky traffic for the current map area.';
  hoveredPlane: MannedFlight;
  hoverPosition = { x: 0, y: 0 };
  toggleFlag = false;
  private animatedPlaneEntities = new Map<string, AnimatedPlaneEntity>();
  private planeCache = new Map<string, MannedFlight>();
  private planeIconCache = new Map<string, string>();
  private enrichmentCache = new Map<string, Partial<MannedFlight>>();
  private pendingEnrichment = new Map<string, Promise<Partial<MannedFlight>>>();
  hasCenteredOnCurrentLocation = false;
  private lastOpenSkyFetchTime = 0;
  private openSkyAbortController: AbortController | null = null;
  private openSkyCooldownMs = 10500;

  layerOptions = ['Map', 'Satellite', 'Terrain'];
  statusOptions = ['all', 'Cruising', 'Climbing', 'Descending'];
  altitudeOptions = [
    { label: 'All Altitudes', value: 'all' },
    { label: 'Below 10,000 ft', value: 'low' },
    { label: '10,000 - 30,000 ft', value: 'mid' },
    { label: 'Above 30,000 ft', value: 'high' },
  ];
  altitudeLegend = [
    { color: '#ff6d00' },
    { color: '#ff9f00' },
    { color: '#ffd000' },
    { color: '#b9df00' },
    { color: '#65d600' },
    { color: '#00c853' },
    { color: '#00bfa5' },
    { color: '#00a8f3' },
    { color: '#246bfe' },
    { color: '#7347ff' },
    { color: '#db3fff' },
  ];
  // UI state for filters
  filterPanelOpen = false;
  trafficFilter = { manned: true, unmanned: true };
  // Temporary filters used in the popup; changes here don't apply until user clicks Apply
  tempTrafficFilter = { manned: true, unmanned: true };

  constructor(
    private mapLayerService: MapLayersService,
    private authorityApplicationComponent: AuthorityApplicationComponent,
    private websocketFlightRadarService: WebsocketFlightRadarService
  ) {}

  ngOnInit(): void {
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();
    const authorityId = this.profileDetails?.UserId || '';
    if (authorityId) {
      this.websocketFlightRadarService.connect(environment.websocketFlightRadar + 'AuthorityId=' + authorityId);
      // this.websocketFlightRadarService.connect('ws://localhost:8080');
    }
    this.listenForDroneFeed();
    this.waitForViewer();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.refreshInterval);
    clearInterval(this.renderInterval);
    clearInterval(this.movementInterval);
    clearTimeout(this.cameraDebounce);
    if (this.viewer && this.cameraMoveListener) {
      this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveListener);
    }
    if (this.clickHandler) {
      this.clickHandler.destroy();
    }
    this.clearPlaneEntities();
    Object.keys(this.droneEntities).forEach((flightId) => {
      if (this.droneEntities[flightId]?.entity) {
        this.viewer?.entities.remove(this.droneEntities[flightId].entity);
      }
      this.viewer?.entities.removeById(`Drone ${flightId}`);
    });
    this.droneEntities = {};
    if (this.postRenderListener && this.viewer?.scene) {
      try { this.viewer.scene.postRender.removeEventListener(this.postRenderListener); } catch (e) {}
    }
    if (this.overlayContainer) {
      try {
        this.overlayContainer.remove();
      } catch (e) {}
      this.overlayContainer = null;
    }
    this.websocketFlightRadarService.closeConnection();
  }

  waitForViewer(): void {
    this.mapLayerService.initialized
      .pipe(takeUntil(this.destroy$))
      .subscribe((viewer) => {
        if (viewer && !this.viewer) {
          this.viewer = viewer;
          this.initialiseOpenSkyView();
        }
      });
  }

  initialiseOpenSkyView(): void {
    if (!this.viewer) {
      return;
    }
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;

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
              this.hoverPositionDrone = { x: ev.clientX - rect.left + 14, y: ev.clientY - rect.top + 14 };
              this.hoveredPlane = undefined;
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

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.zoomToCurrentLocation();
      }
    }, 500);
    this.cameraMoveListener = () => this.onCameraChanged();
    this.viewer.camera.moveEnd.addEventListener(this.cameraMoveListener);
    this.listenForMapSelection();
    this.getLiveMannedFlightData(true);
    this.refreshInterval = setInterval(() => this.getLiveMannedFlightData(), this.refreshMs);
    this.movementInterval = setInterval(() => this.advanceCachedPlanes(), this.positionUpdateMs);
    this.renderInterval = setInterval(() => this.viewer.scene.requestRender(), 50);
  }

  onCameraChanged(): void {
    clearTimeout(this.cameraDebounce);
    this.cameraDebounce = setTimeout(() => this.getLiveMannedFlightData(), 1000);
  }

  listenForMapSelection(): void {
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.clickHandler.setInputAction((click: any) => {
      const picked = this.viewer.scene.pick(click.position);
      const entityId = this.getPickedEntityId(picked);
      if (entityId.startsWith(this.entityPrefix)) {
        const planeId = entityId.replace(this.entityPrefix, '');
        const plane = this.planes.find((item) => this.getPlaneId(item) === planeId);
        if (plane) {
          this.selectedPlane = plane;
          this.activeTab = 'details';
        }
        return;
      }
      if (entityId.startsWith('Drone ')) {
        const droneId = entityId.replace('Drone ', '');
        const drone = this.droneList.find((d) => d.flightId === droneId);
        if (drone) {
          this.selectedDroneId = drone.flightId;
          this.flyToDrone(drone);
        }
        return;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.clickHandler.setInputAction((movement: any) => {
      const picked = this.viewer.scene.pick(movement.endPosition);
      const entityId = this.getPickedEntityId(picked);
      if (entityId.startsWith(this.entityPrefix)) {
        const planeId = entityId.replace(this.entityPrefix, '');
        this.hoveredPlane = this.getPlaneById(planeId);
        this.hoverPosition = {
          x: movement.endPosition.x + 14,
          y: movement.endPosition.y + 14,
        };
        this.hoveredDrone = undefined;
        return;
      }
      if (entityId.startsWith('Drone ')) {
        const droneId = entityId.replace('Drone ', '');
        this.hoveredDrone = this.droneList.find((d) => d.flightId === droneId);
        this.hoverPositionDrone = {
          x: movement.endPosition.x + 14,
          y: movement.endPosition.y + 14,
        };
        this.hoveredPlane = undefined;
        return;
      }
      this.hoveredPlane = undefined;
      this.hoveredDrone = undefined;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  getPickedEntityId(picked: any): string {
    const rawId = picked?.id?.id || picked?.id || '';
    return typeof rawId === 'string' ? rawId : String(rawId?.id || '');
  }

  zoomToCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.focusRegion();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        this.hasCenteredOnCurrentLocation = true;
        if (this.viewer && this.viewer.camera) {
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              this.currentPosition.lon,
              this.currentPosition.lat,
              90000
            ),
            duration: 0.8,
          });
        }
      },
      () => this.focusRegion(),
      { enableHighAccuracy: false, maximumAge: 60000 }
    );
  }

  getLiveMannedFlightData(forceRefresh = false): void {
    if (!this.viewer) {
      return;
    }
    const bounds = this.getVisibleBounds();
    this.isWithinFetchZoom = this.canFetchPlanesAtCurrentZoom();
    if (!this.isWithinFetchZoom) {
      this.planes = [];
      this.filteredPlanes = [];
      this.selectedPlane = undefined;
      this.hoveredPlane = undefined;
      this.isLoading = false;
      this.liveDataMessage = 'Zoom closer to load OpenSky traffic for the current map area.';
      this.clearPlaneEntities();
      return;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - this.lastOpenSkyFetchTime;

    if (timeSinceLastFetch < this.openSkyCooldownMs) {
      clearTimeout(this.cameraDebounce);
      this.cameraDebounce = setTimeout(() => {
        this.getLiveMannedFlightData(forceRefresh);
      }, this.openSkyCooldownMs - timeSinceLastFetch);
      return;
    }
    this.lastOpenSkyFetchTime = now;

    if (forceRefresh) {
      this.planeCache.clear();
      this.clearPlaneEntities(false);
    }

    this.isLoading = true;
    this.loadRealMannedFlightData(bounds).then(
      async (planes) => {
        if (this.isDestroyed) return;
        const normalizedPlanes = this.normalizePlanes(planes);
        if (forceRefresh) {
          this.planeCache.clear();
          this.clearPlaneEntities(false);
        }
        if (!normalizedPlanes.length) {
          this.planes = [];
          this.filteredPlanes = [];
          this.selectedPlane = undefined;
          this.hoveredPlane = undefined;
          this.liveDataMessage = planes.length
            ? 'Live source returned aircraft without usable positions.'
            : 'No OpenSky aircraft returned for this map area.';
          this.clearPlaneEntities();
          this.afterPlanesLoaded();
          return;
        }
        const enrichedPlanes = await this.enrichPlanes(normalizedPlanes);
        if (this.isDestroyed) return;
        this.mergePlaneResponse(enrichedPlanes);
        this.liveDataMessage = '';
        this.afterPlanesLoaded();
      },
      (error) => {
        if (error === 'aborted' || this.isDestroyed) return;
        this.planes = [];
        this.filteredPlanes = [];
        this.selectedPlane = undefined;
        this.hoveredPlane = undefined;
        this.liveDataMessage = 'OpenSky traffic source is unavailable.';
        this.clearPlaneEntities();
        this.afterPlanesLoaded();
      }
    );
  }

  loadRealMannedFlightData(bounds: any): Promise<MannedFlight[]> {
    if (this.openSkyAbortController) {
      this.openSkyAbortController.abort();
    }
    this.openSkyAbortController = new AbortController();

    const endpoint =
      `${this.openSkyApiPath}?lamin=${this.clamp(bounds.latMin, -90, 90).toFixed(5)}` +
      `&lomin=${this.normalizeLongitude(bounds.lngMin).toFixed(5)}` +
      `&lamax=${this.clamp(bounds.latMax, -90, 90).toFixed(5)}` +
      `&lomax=${this.normalizeLongitude(bounds.lngMax).toFixed(5)}`;

    return fetch(endpoint, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
      signal: this.openSkyAbortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`OpenSky request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => data?.states || [])
      .catch((error) => {
        if (error.name === 'AbortError') {
          return Promise.reject('aborted');
        }
        throw error;
      });
  }

  enrichPlanes(planes: MannedFlight[]): Promise<MannedFlight[]> {
    const enrichablePlanes = planes
      .filter((plane) => this.getEnrichmentKey(plane))
      .slice(0, this.maxEnrichmentRequests);
    const enrichableIds = new Set(enrichablePlanes.map((plane) => this.getPlaneId(plane)));

    return Promise.all(
      enrichablePlanes.map((plane) =>
        this.getPlaneEnrichment(plane).then((enrichment) => ({
          id: this.getPlaneId(plane),
          enrichment,
        }))
      )
    ).then((results) =>
      planes.map((plane) => {
        const result = results.find((item) => item.id === this.getPlaneId(plane));
        if (!enrichableIds.has(this.getPlaneId(plane)) || !result?.enrichment) {
          return plane;
        }
        return {
          ...plane,
          ...result.enrichment,
          airline: result.enrichment.airline || plane.airline,
          aircraftType: result.enrichment.aircraftType || plane.aircraftType,
          registration: result.enrichment.registration || plane.registration,
          originCountry: plane.originCountry || result.enrichment.originCountry,
        };
      })
    );
  }

  getPlaneEnrichment(plane: MannedFlight): Promise<Partial<MannedFlight>> {
    const key = this.getEnrichmentKey(plane);
    if (!key) {
      return Promise.resolve({});
    }
    if (this.enrichmentCache.has(key)) {
      return Promise.resolve(this.enrichmentCache.get(key) || {});
    }
    if (this.pendingEnrichment.has(key)) {
      return this.pendingEnrichment.get(key);
    }

    const icao24 = (plane.icao24 || plane.adshex || '').trim().toLowerCase();
    const callsign = (plane.callsign || '').trim();
    const requests: Promise<Partial<MannedFlight>>[] = [
      callsign
        ? this.fetchAdsbdbEnrichment(`${this.adsbdbApiPath}/callsign/${encodeURIComponent(callsign)}`)
        : Promise.resolve({} as Partial<MannedFlight>),
      icao24
        ? this.fetchAdsbdbEnrichment(`${this.adsbdbApiPath}/aircraft/${encodeURIComponent(icao24)}`)
        : Promise.resolve({} as Partial<MannedFlight>),
    ];

    const request = Promise.all(requests)
      .then(([routeEnrichment, aircraftEnrichment]) => ({
        ...routeEnrichment,
        ...aircraftEnrichment,
        airline: aircraftEnrichment.airline || routeEnrichment.airline,
        origin: routeEnrichment.origin || aircraftEnrichment.origin,
        destination: routeEnrichment.destination || aircraftEnrichment.destination,
        route: routeEnrichment.route || aircraftEnrichment.route,
      }))
      .catch(() => ({}))
      .then((enrichment) => {
        this.enrichmentCache.set(key, enrichment);
        this.pendingEnrichment.delete(key);
        return enrichment;
      });

    this.pendingEnrichment.set(key, request);
    return request;
  }

  fetchAdsbdbEnrichment(endpoint: string): Promise<Partial<MannedFlight>> {
    return fetch(endpoint, {
      cache: 'force-cache',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          return {};
        }
        return response.json();
      })
      .then((data: any) => this.normalizeEnrichment(data?.response))
      .catch(() => ({}));
  }

  getEnrichmentKey(plane: MannedFlight): string {
    const icao24 = (plane.icao24 || plane.adshex || '').trim().toLowerCase();
    const callsign = (plane.callsign || '').trim().toUpperCase();
    if (!icao24 && !callsign) {
      return '';
    }
    return `${icao24}:${callsign}`;
  }

  normalizeEnrichment(response: any): Partial<MannedFlight> {
    if (!response || typeof response === 'string') {
      return {};
    }

    const aircraft = response.aircraft || response;
    const flightRoute = response.flightroute || response.route;
    const airline = flightRoute?.airline || response.airline;
    const origin = flightRoute?.origin || response.origin;
    const destination = flightRoute?.destination || response.destination;
    const originLabel = this.getAirportLabel(origin);
    const destinationLabel = this.getAirportLabel(destination);

    return {
      airline: airline?.name,
      aircraftType: aircraft?.type || aircraft?.icao_type,
      manufacturer: aircraft?.manufacturer,
      owner: aircraft?.registered_owner,
      registration: aircraft?.registration,
      originCountry: aircraft?.registered_owner_country_name,
      origin: originLabel,
      destination: destinationLabel,
      route: originLabel && destinationLabel ? `${originLabel} - ${destinationLabel}` : undefined,
      photoUrl: aircraft?.url_photo,
      photoThumbnailUrl: aircraft?.url_photo_thumbnail,
    };
  }

  getAirportLabel(airport: any): string {
    if (!airport || typeof airport === 'string') {
      return airport || '';
    }
    return airport.iata_code || airport.icao_code || airport.name || '';
  }

  mergePlaneResponse(planes: MannedFlight[]): void {
    const now = Date.now();
    const liveIds = new Set<string>();

    planes.forEach((plane) => {
      const id = this.getPlaneId(plane);
      liveIds.add(id);
      const previous = this.planeCache.get(id);
      const derivedMotion = this.getDerivedMotion(previous, plane, now);
      const rawLat = plane.rawLat ?? plane.lat;
      const rawLon = plane.rawLon ?? plane.lon;
      const displayedPlane = previous && this.hasPosition(previous) ? previous : plane;

      this.planeCache.set(id, {
        ...previous,
        ...plane,
        lat: displayedPlane.lat,
        lon: displayedPlane.lon,
        rawLat,
        rawLon,
        route: plane.route || previous?.route,
        originCountry: plane.originCountry || previous?.originCountry,
        origin: plane.origin || previous?.origin,
        destination: plane.destination || previous?.destination,
        aircraftType: plane.aircraftType || previous?.aircraftType,
        manufacturer: plane.manufacturer || previous?.manufacturer,
        owner: plane.owner || previous?.owner,
        registration: plane.registration || previous?.registration,
        photoUrl: plane.photoUrl || previous?.photoUrl,
        photoThumbnailUrl: plane.photoThumbnailUrl || previous?.photoThumbnailUrl,
        airline: plane.airline || previous?.airline || this.getAirlineFromCallsign(plane.callsign),
        speed: this.useKnownNumber(plane.speed) ? plane.speed : derivedMotion.speed || previous?.speed,
        heading: this.useKnownNumber(plane.heading) ? plane.heading : derivedMotion.heading || previous?.heading,
        verticalRate: this.useKnownNumber(plane.verticalRate) ? plane.verticalRate : previous?.verticalRate,
        altitude: this.useKnownNumber(plane.altitude) ? plane.altitude : previous?.altitude,
        updatedAtMs: now,
      });
    });
    this.planeCache.forEach((_plane, id) => {
      if (!liveIds.has(id)) {
        this.planeCache.delete(id);
      }
    });
    this.planes = this.getCachedPlanes();
  }

  advanceCachedPlanes(): void {
    if (!this.isWithinFetchZoom || !this.planeCache.size) {
      return;
    }
    this.planeCache.forEach((plane, id) => {
      if (!this.hasPosition(plane) || !plane.speed) {
        return;
      }
      const projected = this.projectPlane(plane, this.positionUpdateMs / 1000);
      this.planeCache.set(id, {
        ...plane,
        lat: projected.lat,
        lon: projected.lon,
      });
    });
    this.planes = this.getCachedPlanes();
    this.applyFilters();
    this.syncPlaneEntities();
    this.refreshSelectedAndHoveredPlanes();
  }

  refreshSelectedAndHoveredPlanes(): void {
    if (this.selectedPlane) {
      this.selectedPlane = this.getPlaneById(this.getPlaneId(this.selectedPlane)) || this.selectedPlane;
    }
    if (this.hoveredPlane) {
      this.hoveredPlane = this.getPlaneById(this.getPlaneId(this.hoveredPlane));
    }
  }

  getCachedPlanes(): MannedFlight[] {
    const now = Date.now();
    this.planeCache.forEach((plane, id) => {
      if (now - (plane.updatedAtMs || 0) > this.stalePlaneMs) {
        this.planeCache.delete(id);
      }
    });
    return Array.from(this.planeCache.values());
  }

  afterPlanesLoaded(): void {
    this.lastUpdated = new Date();
    this.applyFilters();
    this.isLoading = false;
    this.syncPlaneEntities();
  }

  applyFilters(): void {
    const text = this.searchText.trim().toLowerCase();
    this.filteredPlanes = this.planes.filter((plane) => {
      const matchesSearch =
        !text ||
        this.getPlaneTitle(plane).toLowerCase().includes(text) ||
        (plane.adshex || '').toLowerCase().includes(text) ||
        (plane.originCountry || '').toLowerCase().includes(text) ||
        (plane.origin || '').toLowerCase().includes(text) ||
        (plane.destination || '').toLowerCase().includes(text);
      const matchesStatus =
        this.selectedStatus === 'all' || plane.status === this.selectedStatus;
      const altitude = this.toFeet(plane.altitude);
      const matchesAltitude =
        this.selectedAltitude === 'all' ||
        (this.selectedAltitude === 'low' && altitude < 10000) ||
        (this.selectedAltitude === 'mid' && altitude >= 10000 && altitude <= 30000) ||
        (this.selectedAltitude === 'high' && altitude > 30000);

      return matchesSearch && matchesStatus && matchesAltitude;
    });

    this.filteredDroneList = this.droneList.filter((drone) => {
      if (!text) {
        return true;
      }
      return (
        (drone.flightId || '').toLowerCase().includes(text) ||
        (drone.operator || '').toLowerCase().includes(text) ||
        (drone.type || '').toLowerCase().includes(text)
      );
    });

    // Apply traffic type filters: hide manned or unmanned lists when unchecked
    if (!this.trafficFilter.manned) {
      this.filteredPlanes = [];
    }
    if (!this.trafficFilter.unmanned) {
      this.filteredDroneList = [];
    }

    if (!this.filteredPlanes.length) {
      if (this.selectedPlane) {
        const selectedId = this.getPlaneId(this.selectedPlane);
        this.selectedPlane = this.planes.find((plane) => this.getPlaneId(plane) === selectedId);
      }
      return;
    }
    if (this.selectedPlane) {
      const selectedId = this.getPlaneId(this.selectedPlane);
      this.selectedPlane =
        this.filteredPlanes.find((plane) => this.getPlaneId(plane) === selectedId) ||
        this.selectedPlane;
    }
  }

  onFiltersChange(): void {
    this.applyFilters();
    this.syncPlaneEntities();
    this.syncDroneEntities();
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
    if (this.filterPanelOpen) {
      // copy current active filters into the temp object so changes are staged
      this.tempTrafficFilter = { ...this.trafficFilter };
    }
  }

  applyTrafficFilters(): void {
    // commit staged temp filters to active filters and apply
    this.trafficFilter = { ...this.tempTrafficFilter };
    this.filterPanelOpen = false;
    this.applyFilters();
    this.syncPlaneEntities();
    this.syncDroneEntities();
  }

  resetFilters(): void {
    // reset staged filters in the popup only; user must click Apply to commit
    this.tempTrafficFilter = { manned: true, unmanned: true };
  }

  listenForDroneFeed(): void {
    this.websocketFlightRadarService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data?.action !== 'drone_batch_update') {
          return;
        }

        const drones = data.drones || [];
        drones.forEach((drone: any) => {
          if (!drone?.UIN) {
            return;
          }

          const current = this.droneList.find((item) => item.flightId === drone.UIN);
          const item = {
            flightId: drone.UIN,
            operator: drone.Vehicle_kind === 'Manned' ? 'Manned Aircraft' : 'Drones',
            type: drone.Vehicle_kind || 'Unknown',
            alt: Number(drone.Altitude || 0),
            speed: Number(drone.Groundspeed || 0),
            heading: Number(drone.Heading || 0),
            lat: Number(drone.Latitude),
            lng: Number(drone.Longitude),
            lastUpdated: new Date(),
          };

          if (current) {
            Object.assign(current, item);
          } else {
            this.droneList.unshift(item);
          }
        });

        this.applyFilters();
        this.syncDroneEntities();
      });
  }

  syncDroneEntities(): void {
    if (!this.viewer) {
      return;
    }

    const activeIds = new Set<string>();

    this.filteredDroneList.forEach((drone) => {
      const flightId = drone.flightId;
      if (!flightId || !Number.isFinite(drone.lat) || !Number.isFinite(drone.lng)) {
        return;
      }

      activeIds.add(flightId);

      if (this.droneEntities[flightId]) {
        const time = Cesium.JulianDate.now();
        const position = Cesium.Cartesian3.fromDegrees(drone.lng, drone.lat, drone.alt || 0);
        this.droneEntities[flightId].positionProperty.addSample(time, position);
        
        if (this.droneEntities[flightId].entity.billboard) {
          this.droneEntities[flightId].entity.billboard.rotation = Cesium.Math.toRadians(-(drone.heading || 0));
        }
        return;
      }

      const positionProperty = new Cesium.SampledPositionProperty();
      positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
      const time = Cesium.JulianDate.now();
      const position = Cesium.Cartesian3.fromDegrees(drone.lng, drone.lat, drone.alt || 0);
      positionProperty.addSample(time, position);

      const entity = this.viewer.entities.add({
        id: `Drone ${flightId}`,
        position: positionProperty,
        billboard: {
          image: 'assets/common-layout/drone2D1.svg',
          scale: 0.9,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          rotation: Cesium.Math.toRadians(-(drone.heading || 0)),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(2000.0, 1.0, 800000.0, 0.25),
          show: new Cesium.CallbackProperty(() => {
            try { return !this.overlayContainer; } catch (e) { return true; }
          }, false),
        },
      });

      this.droneEntities[flightId] = { entity, positionProperty };
    });

    Object.keys(this.droneEntities).forEach((flightId) => {
      if (!activeIds.has(flightId)) {
        this.viewer.entities.remove(this.droneEntities[flightId].entity);
        delete this.droneEntities[flightId];
        if (this.overlayContainer) {
          const img = this.overlayContainer.querySelector(`img[data-flight="${flightId}"]`);
          if (img) img.remove();
        }
      }
    });
  }

  private ensureOverlayImage(flightId: string): HTMLImageElement | null {
    if (!this.overlayContainer) return null;
    let existing = this.overlayContainer.querySelector<HTMLImageElement>(`img[data-flight="${flightId}"]`);
    if (existing) return existing;
    const img = document.createElement('img');
    img.setAttribute('data-flight', flightId);
    img.src = 'assets/common-layout/drone2D1.svg';
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
        const droneMeta = this.droneList.find(d => d.flightId === flightId);
        const heading = droneMeta?.heading || 0;
          try {
            const baseWidth = parseFloat(img.dataset.baseWidth || '80');
            const cameraPos = this.viewer.camera.position;
            let distance = 1;
            if (cameraPos) {
              distance = Cesium.Cartesian3.distance(cameraPos, pos) || 1;
            }
            const k = 1500;
            let size = Math.round(baseWidth * (k / distance));
            const minSize = 34;
            const maxSize = 220;
            if (size < minSize) size = minSize;
            if (size > maxSize) size = maxSize;
            img.style.width = `${size}px`;
          } catch (e) {}
          img.style.transform = `translate(-50%,-50%) rotate(${heading}deg)`;
      });
    } catch (e) {}
  }

  selectPlane(plane: MannedFlight): void {
    this.selectedPlane = plane;
    this.flyToPlane(plane);
  }

  selectDrone(drone: any): void {
    this.selectedDroneId = drone.flightId;
    this.flyToDrone(drone);
  }

  flyToDrone(drone: any): void {
    if (!this.viewer || !Number.isFinite(drone.lat) || !Number.isFinite(drone.lng)) return;
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(drone.lng, drone.lat, 1800),
      duration: 1.0,
    });
  }

  copySelectedLink(): void {
    if (!this.selectedPlane) {
      return;
    }
    const id = this.getPlaneId(this.selectedPlane);
    const url = `${window.location.origin}${window.location.pathname}?aircraft=${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  }

  jumpToSearchLocation(): void {
    if (!this.viewer || !this.jumpText.trim()) {
      return;
    }
    this.locationSearchMessage = '';
    const searchText = this.jumpText.trim();
    const coordinates = searchText
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));
    if (coordinates.length >= 2) {
      this.flyToLocation(coordinates[0], coordinates[1]);
      return;
    }

    this.searchLocationByName(searchText);
  }

  searchLocationByName(searchText: string): void {
    this.isSearchingLocation = true;
    const country = (this.profileDetails?.Country || '').toLowerCase();
    const countryQuery = country ? `, ${country}` : '';
    const endpoint =
      'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
      encodeURIComponent(searchText + countryQuery);

    fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Location search failed');
        }
        return response.json();
      })
      .then((results) => {
        const place = results?.[0];
        if (!place) {
          this.locationSearchMessage = 'Location not found';
          return;
        }
        this.flyToLocation(Number(place.lat), Number(place.lon));
      })
      .catch(() => {
        this.locationSearchMessage = 'Unable to search location';
      })
      .finally(() => {
        this.isSearchingLocation = false;
      });
  }

  flyToLocation(lat: number, lon: number): void {
    if (!this.viewer || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      this.locationSearchMessage = 'Enter a valid location';
      return;
    }
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 65000),
      duration: 0.8,
      complete: () => this.getLiveMannedFlightData(true),
    });
  }

  syncPlaneEntities(): void {
    if (!this.viewer) {
      return;
    }
    const activeIds = new Set<string>();

    this.filteredPlanes.forEach((plane) => {
      if (!this.hasPosition(plane)) {
        return;
      }
      const id = this.getPlaneId(plane);
      activeIds.add(id);
      const existing = this.animatedPlaneEntities.get(id);
      const projectedPlane = this.projectPlane(plane, this.positionUpdateMs / 1000);

      if (existing) {
        existing.from = this.getCurrentPlaneState(existing);
        existing.to = projectedPlane;
        existing.startedAt = Date.now();
        existing.entity.billboard.rotation = this.getHeadingRadians(plane);
        existing.entity.billboard.image = this.getPlaneIcon(plane);
        if (existing.entity.label) {
          existing.entity.label.text = this.getMapLabel(plane);
          existing.entity.label.fillColor = Cesium.Color.fromCssColorString(this.getAltitudeColor(plane));
        }
        existing.entity.description = this.getDescriptionHtml(plane);
      } else {
        const holder: AnimatedPlaneEntity = {
          entity: null,
          from: plane,
          to: projectedPlane,
          startedAt: Date.now(),
        };
        const entity = this.viewer.entities.add({
          id: this.entityPrefix + id,
          position: new Cesium.CallbackProperty(() => {
            return this.getInterpolatedPosition(holder);
          }, false),
          billboard: {
            image: this.getPlaneIcon(plane),
            scale: 0.76,
            scaleByDistance: new Cesium.NearFarScalar(0, 1.28, 90000.0, 0.9),
            rotation: this.getHeadingRadians(plane),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: this.getMapLabel(plane),
            font: '600 13px monospace',
            fillColor: Cesium.Color.fromCssColorString(this.getAltitudeColor(plane)),
            outlineColor: Cesium.Color.fromCssColorString('#0b1020'),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(18, 0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 160000.0),
          },
          description: this.getDescriptionHtml(plane),
        });
        holder.entity = entity;
        this.animatedPlaneEntities.set(id, holder);
      }
    });

    this.animatedPlaneEntities.forEach((holder, id) => {
      if (!activeIds.has(id)) {
        this.viewer.entities.remove(holder.entity);
        this.animatedPlaneEntities.delete(id);
      }
    });
  }

  clearPlaneEntities(clearCache = true): void {
    if (!this.viewer) {
      return;
    }
    this.animatedPlaneEntities.forEach((holder) => {
      this.viewer.entities.remove(holder.entity);
    });
    this.animatedPlaneEntities.clear();
    if (clearCache) {
      this.planeCache.clear();
    }
  }

  flyToPlane(plane: MannedFlight): void {
    if (!this.viewer || !this.hasPosition(plane)) {
      return;
    }
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(plane.lon, plane.lat, 65000),
      duration: 0.8,
    });
  }

  focusRegion(): void {
    if (!this.viewer) {
      return;
    }
    const bounds = this.getCountryBounds();
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        (bounds.lngMin + bounds.lngMax) / 2,
        (bounds.latMin + bounds.latMax) / 2,
        2400000
      ),
      duration: 0.8,
    });
  }

  getCountryBounds(): any {
    const country = (this.profileDetails?.Country || 'INDIA').toUpperCase();
    if (country === 'IRELAND') {
      return {
        country: 'IRELAND',
        latMin: 51.29143611559805,
        lngMin: -10.561891103258741,
        latMax: 55.58117283181593,
        lngMax: -5.301994459203987,
      };
    }
    return {
      country: 'INDIA',
      latMin: 8.465020978452927,
      lngMin: 69.46937307226474,
      latMax: 42.17477643444698,
      lngMax: 98.39193134978791,
    };
  }

  getVisibleBounds(): any {
    const fallback = this.getCountryBounds();
    if (!this.viewer) {
      return fallback;
    }

    const ellipsoid = this.viewer.scene.globe.ellipsoid;
    const canvas = this.viewer.scene.canvas;
    const corners = [
      new Cesium.Cartesian2(0, 0),
      new Cesium.Cartesian2(canvas.clientWidth, 0),
      new Cesium.Cartesian2(0, canvas.clientHeight),
      new Cesium.Cartesian2(canvas.clientWidth, canvas.clientHeight),
    ];
    const points = corners
      .map((corner) => this.viewer.camera.pickEllipsoid(corner, ellipsoid))
      .filter((point) => !!point)
      .map((point) => ellipsoid.cartesianToCartographic(point));

    if (!points.length) {
      return fallback;
    }

    const latitudes = points.map((point) => Cesium.Math.toDegrees(point.latitude));
    const longitudes = points.map((point) => Cesium.Math.toDegrees(point.longitude));
    const country = this.detectCountryFromBounds(
      Math.min(...latitudes),
      Math.min(...longitudes),
      Math.max(...latitudes),
      Math.max(...longitudes)
    );

    return {
      country,
      latMin: Math.min(...latitudes),
      lngMin: Math.min(...longitudes),
      latMax: Math.max(...latitudes),
      lngMax: Math.max(...longitudes),
    };
  }

  canFetchPlanesAtCurrentZoom(): boolean {
    const height = this.viewer?.scene?.camera?.positionCartographic?.height || Infinity;
    return height <= this.maxPlaneFetchHeight && height >= this.minPlaneFetchHeight;
  }

  detectCountryFromBounds(latMin: number, lngMin: number, latMax: number, lngMax: number): string {
    const india = latMax < 42.17477643444698 && latMin > 8.465020978452927 &&
      lngMax < 98.39193134978791 && lngMin > 69.46937307226474;
    const ireland = latMax < 55.58117283181593 && latMin > 51.29143611559805 &&
      lngMax < -5.301994459203987 && lngMin > -10.561891103258741;
    if (ireland) {
      return 'IRELAND';
    }
    if (india) {
      return 'INDIA';
    }
    return (this.profileDetails?.Country || 'INDIA').toUpperCase();
  }

  normalizePlanes(planes: MannedFlight[]): MannedFlight[] {
    return planes
      .map((plane: any) => this.normalizePlane(plane))
      .filter((plane) => this.hasPosition(plane));
  }

  normalizePlane(plane: any): MannedFlight {
    if (Array.isArray(plane)) {
      const altitude = plane[13] ?? plane[7];
      const verticalRate = plane[11] !== null && plane[11] !== undefined
        ? Math.round(Number(plane[11]) * 196.85)
        : undefined;
      return {
        adshex: plane[0],
        icao24: plane[0],
        callsign: (plane[1] || '').trim(),
        originCountry: plane[2],
        lon: plane[5],
        lat: plane[6],
        rawLon: plane[5],
        rawLat: plane[6],
        altitude: altitude || 0,
        speed: plane[9] ? Math.round(Number(plane[9]) * 1.94384) : 0,
        heading: plane[10] || 0,
        verticalRate,
        squawk: plane[14],
        status: plane[8] ? 'Ground' : this.getFlightStatus({ verticalRate, altitude }),
        source: 'OpenSky',
        lastUpdate: plane[4]
          ? new Date(Number(plane[4]) * 1000).toLocaleTimeString()
          : new Date().toLocaleTimeString(),
        updatedAtMs: Date.now(),
      };
    }

    const altitude = this.getAltitudeMeters(plane);
    const verticalRate = this.firstNumber(
      plane.verticalRate,
      plane.vertical_rate,
      plane.vertRate,
      plane.baro_rate,
      plane.geom_rate
    );

    return {
      ...plane,
      adshex: plane.adshex || plane.icao24 || plane.hex,
      originCountry: plane.originCountry || plane.origin_country || plane.country,
      route: plane.route || plane.Route || plane.routeName || plane.flightRoute,
      airline:
        plane.airline ||
        plane.Airline ||
        plane.operator ||
        plane.operatorName ||
        plane.owner ||
        plane.aircraftOwner,
      callsign: plane.callsign || plane.flight,
      aircraftType: plane.aircraftType || plane.t || plane.type || plane.desc,
      registration: plane.registration || plane.r,
      origin:
        plane.origin ||
        plane.from ||
        plane.departure ||
        plane.departureAirport ||
        plane.estDepartureAirport ||
        plane.sourceAirport,
      destination:
        plane.destination ||
        plane.to ||
        plane.arrival ||
        plane.arrivalAirport ||
        plane.estArrivalAirport ||
        plane.destinationAirport,
      altitude,
      speed: this.getSpeedKnots(plane),
      heading: this.firstNumber(
        plane.heading,
        plane.trueTrack,
        plane.true_track,
        plane.track,
        plane.trk,
        plane.nav_heading,
        plane.course,
        plane.bearing
      ),
      verticalRate,
      lat: this.firstNumber(plane.lat, plane.latitude),
      lon: this.firstNumber(plane.lon, plane.longitude, plane.lng),
      rawLat: this.firstNumber(plane.lat, plane.latitude),
      rawLon: this.firstNumber(plane.lon, plane.longitude, plane.lng),
      status:
        plane.status ||
        (plane.alt_baro === 'ground'
          ? 'Ground'
          : this.getFlightStatus({ verticalRate, altitude })),
      squawk: plane.squawk,
      source: 'OpenSky',
      lastUpdate:
        plane.lastUpdate ||
        (plane.seen !== undefined ? `${plane.seen}s ago` : new Date().toLocaleTimeString()),
      updatedAtMs: Date.now(),
    };
  }

  getFlightStatus(plane: MannedFlight): string {
    if ((plane.verticalRate || 0) > 300) {
      return 'Climbing';
    }
    if ((plane.verticalRate || 0) < -300) {
      return 'Descending';
    }
    return 'Cruising';
  }

  getPlaneTitle(plane: MannedFlight): string {
    return plane.callsign || plane.flightNo || plane.adshex || 'Unknown';
  }

  getAirlineName(plane: MannedFlight): string {
    return plane.airline || this.getAirlineFromCallsign(plane.callsign) || 'Manned Aircraft';
  }

  getAirlineFromCallsign(callsign: string): string {
    if (!callsign) {
      return '';
    }
    const prefix = callsign.trim().slice(0, 3).toUpperCase();
    const airlineMap = {
      AIC: 'Air India',
      AXB: 'Air India Express',
      IGO: 'IndiGo',
      VTI: 'Vistara',
      SEJ: 'SpiceJet',
      GOW: 'Go First',
      AKJ: 'Akasa Air',
      QFA: 'Qantas',
      UAE: 'Emirates',
      ETD: 'Etihad Airways',
      QTR: 'Qatar Airways',
      SIA: 'Singapore Airlines',
      THA: 'Thai Airways',
      BAW: 'British Airways',
      DLH: 'Lufthansa',
      AFR: 'Air France',
      KLM: 'KLM',
      UAL: 'United Airlines',
      AAL: 'American Airlines',
      DAL: 'Delta Air Lines',
    };
    return airlineMap[prefix] || '';
  }

  getPlaneId(plane: MannedFlight): string {
    return String(plane.adshex || plane.icao24 || plane.callsign || plane.flightNo || 'unknown').trim();
  }

  toggle2D3D(val: any): void {
    if (!this.viewer) {
      return;
    }

    const is2D = !!val;
    this.toggleFlag = is2D;

    if (is2D) {
      this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    } else {
      this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      this.viewer.camera.lookUp(Cesium.Math.toRadians(10.0));
    }

    this.viewer.scene.requestRender();
  }

  getRoute(plane: MannedFlight): string {
    if (plane.route) {
      return plane.route;
    }
    if (plane.origin && plane.destination && plane.destination !== 'n/a') {
      return `${plane.origin} - ${plane.destination}`;
    }
    return 'Route unavailable';
  }

  getOriginCountry(plane: MannedFlight): string {
    return plane.originCountry || 'Unknown';
  }

  getDataSource(plane: MannedFlight): string {
    return plane.registration || plane.route || plane.photoUrl ? 'OpenSky + ADSBDB' : plane.source || 'OpenSky';
  }

  getPlaneById(id: string): MannedFlight {
    return this.planes.find((plane) => this.getPlaneId(plane) === id);
  }

  getRouteStatus(plane: MannedFlight): string {
    if (this.getRoute(plane) === 'Route unavailable') {
      return 'Route enrichment not present in live feed';
    }
    return `${plane.origin || 'N/A'} - ${plane.destination || 'N/A'}`;
  }

  getMapLabel(plane: MannedFlight): string {
    return this.getPlaneTitle(plane);
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(Number(value) || 0, min), max);
  }

  normalizeLongitude(value: number): number {
    const numberValue = Number(value) || 0;
    if (numberValue > 180) {
      return 180;
    }
    if (numberValue < -180) {
      return -180;
    }
    return numberValue;
  }

  getPlaneIcon(plane: MannedFlight): string {
    const fill = this.getAltitudeColor(plane);
    if (this.planeIconCache.has(fill)) {
      return this.planeIconCache.get(fill) || '';
    }
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.2" flood-color="#020617" flood-opacity="0.72"/>
        </filter>
        <g filter="url(#shadow)">
          <path d="M36 4 C39.1 4 41.2 6.6 40.8 9.8 L38.7 27.7 L66.1 43.4 C67.7 44.3 68.5 46.2 68.1 48 L67.3 52.4 L38.4 43.3 L37.5 57.2 L46.5 62.9 L45.8 67.4 L36 64.4 L26.2 67.4 L25.5 62.9 L34.5 57.2 L33.6 43.3 L4.7 52.4 L3.9 48 C3.5 46.2 4.3 44.3 5.9 43.4 L33.3 27.7 L31.2 9.8 C30.8 6.6 32.9 4 36 4 Z" fill="${fill}" stroke="#07111f" stroke-width="3.8" stroke-linejoin="round"/>
          <path d="M36 6.5 C38.1 13.5 38 23.6 36 35.2 C34 23.6 33.9 13.5 36 6.5 Z" fill="#ffffff" opacity="0.38"/>
          <path d="M35 41.5 L6.6 50.3 L7.1 47.1 L34.1 31.6 Z" fill="#ffffff" opacity="0.18"/>
          <path d="M37 41.5 L65.4 50.3 L64.9 47.1 L37.9 31.6 Z" fill="#000000" opacity="0.16"/>
          <circle cx="36" cy="17" r="2.2" fill="#e2e8f0" opacity="0.92"/>
        </g>
      </svg>
    `;
    const icon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    this.planeIconCache.set(fill, icon);
    return icon;
  }

  getAltitudeColor(plane: MannedFlight): string {
    const altitude = this.toFeet(plane.altitude);
    if (altitude < 1000) {
      return '#ff9f00';
    }
    if (altitude < 5000) {
      return '#ffc400';
    }
    if (altitude < 10000) {
      return '#80d927';
    }
    if (altitude < 20000) {
      return '#00c853';
    }
    if (altitude < 30000) {
      return '#00a8f3';
    }
    if (altitude < 40000) {
      return '#2867ff';
    }
    return '#8f46ff';
  }

  getVerticalDirection(plane: MannedFlight): string {
    if ((plane.verticalRate || 0) < -100) {
      return 'v';
    }
    if ((plane.verticalRate || 0) > 100) {
      return '^';
    }
    return '';
  }

  getHeadingRadians(plane: MannedFlight): number {
    return Cesium.Math.toRadians(-(plane.heading || 0));
  }

  hasPosition(plane: MannedFlight): boolean {
    return Number.isFinite(plane?.lat) && Number.isFinite(plane?.lon);
  }

  getInterpolatedPosition(holder: AnimatedPlaneEntity): any {
    const elapsedMs = Date.now() - holder.startedAt;
    const progress = Math.min(elapsedMs / this.positionUpdateMs, 1);
    if (elapsedMs > this.positionUpdateMs) {
      const projected = this.projectPlane(holder.to, (elapsedMs - this.positionUpdateMs) / 1000);
      return Cesium.Cartesian3.fromDegrees(projected.lon, projected.lat, projected.altitude || 0);
    }
    const lat = this.interpolate(holder.from.lat, holder.to.lat, progress);
    const lon = this.interpolate(holder.from.lon, holder.to.lon, progress);
    const altitude = this.interpolate(holder.from.altitude || 0, holder.to.altitude || 0, progress);
    return Cesium.Cartesian3.fromDegrees(lon, lat, altitude);
  }

  getCurrentPlaneState(holder: AnimatedPlaneEntity): MannedFlight {
    const elapsedMs = Date.now() - holder.startedAt;
    const progress = Math.min(elapsedMs / this.positionUpdateMs, 1);
    if (elapsedMs > this.positionUpdateMs) {
      return this.projectPlane(holder.to, (elapsedMs - this.positionUpdateMs) / 1000);
    }
    return {
      ...holder.to,
      lat: this.interpolate(holder.from.lat, holder.to.lat, progress),
      lon: this.interpolate(holder.from.lon, holder.to.lon, progress),
      altitude: this.interpolate(holder.from.altitude || 0, holder.to.altitude || 0, progress),
    };
  }

  interpolate(from = 0, to = 0, progress = 1): number {
    return from + (to - from) * progress;
  }

  projectPlane(plane: MannedFlight, seconds: number): MannedFlight {
    if (!this.hasPosition(plane) || !plane.speed) {
      return { ...plane };
    }
    const earthRadiusKm = 6371;
    const distanceKm = (plane.speed * 1.852 * seconds) / 3600;
    const bearing = Cesium.Math.toRadians(plane.heading || 0);
    const lat1 = Cesium.Math.toRadians(plane.lat);
    const lon1 = Cesium.Math.toRadians(plane.lon);
    const angularDistance = distanceKm / earthRadiusKm;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
      );

    return {
      ...plane,
      lat: Cesium.Math.toDegrees(lat2),
      lon: Cesium.Math.toDegrees(lon2),
    };
  }

  firstNumber(...values: any[]): number {
    const found = values.find((value) => value !== undefined && value !== null && value !== '');
    if (found === undefined) {
      return undefined;
    }
    const numberValue = Number(found);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  }

  getSpeedKnots(plane: any): number {
    const speedKnots = this.firstNumber(
      plane.speed,
      plane.groundSpeed,
      plane.groundspeed,
      plane.gs,
      plane.speedKts,
      plane.velocityKts
    );
    if (speedKnots !== undefined) {
      return speedKnots;
    }
    const speedMetersPerSecond = this.firstNumber(plane.velocity, plane.speedMps);
    return speedMetersPerSecond !== undefined
      ? Math.round(speedMetersPerSecond * 1.94384)
      : undefined;
  }

  getAltitudeMeters(plane: any): number {
    if (plane.alt_baro === 'ground') {
      return 0;
    }
    const altitudeMeters = this.firstNumber(
      plane.altitudeMeters,
      plane.geoAltitude,
      plane.baroAltitude,
      plane.geo_altitude,
      plane.baro_altitude
    );
    if (altitudeMeters !== undefined) {
      return altitudeMeters;
    }
    const altitudeFeet = this.firstNumber(
      plane.altitudeFeet,
      plane.altitudeFt,
      plane.alt_baro,
      plane.alt_geom,
      plane.altitude,
      plane.alt
    );
    return altitudeFeet !== undefined ? altitudeFeet / 3.28084 : undefined;
  }

  useKnownNumber(value: number): boolean {
    return Number.isFinite(value);
  }

  getDerivedMotion(previous: MannedFlight, current: MannedFlight, now: number): any {
    if (!previous || !this.hasPosition(previous) || !this.hasPosition(current)) {
      return {};
    }
    const elapsedSeconds = Math.max((now - (previous.updatedAtMs || now)) / 1000, 1);
    const distanceKm = this.getDistanceKm(previous, current);
    if (distanceKm < 0.01) {
      return {};
    }
    return {
      speed: Math.round((distanceKm / elapsedSeconds) * 3600 / 1.852),
      heading: this.getBearingDegrees(previous, current),
    };
  }

  getDistanceKm(from: MannedFlight, to: MannedFlight): number {
    const earthRadiusKm = 6371;
    const lat1 = Cesium.Math.toRadians(from.lat);
    const lat2 = Cesium.Math.toRadians(to.lat);
    const deltaLat = Cesium.Math.toRadians(to.lat - from.lat);
    const deltaLon = Cesium.Math.toRadians(to.lon - from.lon);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  getBearingDegrees(from: MannedFlight, to: MannedFlight): number {
    const lat1 = Cesium.Math.toRadians(from.lat);
    const lat2 = Cesium.Math.toRadians(to.lat);
    const deltaLon = Cesium.Math.toRadians(to.lon - from.lon);
    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    return (Cesium.Math.toDegrees(Math.atan2(y, x)) + 360) % 360;
  }

  getDescriptionHtml(plane: MannedFlight): string {
    return `
      <p>Callsign: ${this.getPlaneTitle(plane)}</p>
      <p>Route: ${this.getRoute(plane)}</p>
      <p>Origin Country: ${this.getOriginCountry(plane)}</p>
      <p>Operator: ${this.getAirlineName(plane)}</p>
      <p>Registration: ${plane.registration || 'N/A'}</p>
      <p>Aircraft Type: ${plane.aircraftType || 'N/A'}</p>
      <p>Altitude: ${this.toFeet(plane.altitude).toLocaleString()} ft</p>
      <p>Speed: ${plane.speed || 0} kt</p>
      <p>Heading: ${plane.heading || 0} deg</p>
    `;
  }

  toFeet(value: number): number {
    return Math.round((value || 0) * 3.28084);
  }

  toMeters(value: number): number {
    return Math.round(value || 0);
  }

  toMps(knots: number): number {
    return Number(((knots || 0) * 0.514444).toFixed(1));
  }

  getLastUpdatedAgo(): string {
    const seconds = Math.max(0, Math.floor((Date.now() - this.lastUpdated.getTime()) / 1000));
    return `${seconds} sec ago`;
  }

  trackByPlane(index: number, plane: MannedFlight): string {
    return plane.adshex || plane.callsign || String(index);
  }

  trackByDrone(index: number, drone: any): string {
    return drone.flightId || String(index);
  }

  getStatusClass(item: any): string {
    if (!item) {
      return 'other';
    }
    // Drones list items usually have `flightId` (from websocket drone feed)
    if (item.flightId) {
      return 'drones';
    }
    // Manned planes: identified by aircraft fields
    if (item.adshex || item.icao24 || item.callsign || item.flightNo) {
      return 'manned';
    }
    const op = (item.operator || '').toString().toLowerCase();
    if (op.includes('skye') || op.includes('drone') || op.includes('uas')) {
      return 'drones';
    }
    return 'other';
  }
}
