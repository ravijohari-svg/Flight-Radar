import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OperatorapisService } from './operatorapis.service';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OperatorService implements OnInit {
  //Profile Details
  operatorEmailId;
  profileDetails;
  //Drones and Gears
  dronesAndGearList;
  //Operators List
  operatorsList;

  private messageSource = new BehaviorSubject<string>('initial');
  message$ = this.messageSource.asObservable();

  updateMessage(msg: string) {
    this.messageSource.next(msg);
  }

  constructor(
    private operatorApi: OperatorapisService,
    private router: Router
  ) {}

  ngOnInit() {}
  test(val) {
    this.operatorApi.test();
  }
  EmailId(emailId) {
    this.operatorEmailId = emailId;
  }
  getProfileDetails() {
    let payload = {
      EmailId: this.operatorEmailId,
      UserId: this.operatorEmailId,
    };
    this.operatorApi.getProfileDetails(payload).then((res: any) => {
      this.profileDetails = res.data.MainData;
      // this.profileDetails.SubscriptionPlan = 'Free';
      // this.operatorApi.getCountryCode()
      //   .then((res : any) => {
      //     let country = res.find((val) => val.name == this.profileDetails.Country);
      //     this.profileDetails.CountryCode = country.code;
      let encryData = CryptoJS.AES.encrypt(
        JSON.stringify(this.profileDetails),
        environment.operatorKey
      );
      localStorage.setItem('UserDetails', encryData);
      this.router.navigateByUrl('operator/operator-app');
      //  })
    });
  }
  returnProfileDetails() {
    if (localStorage.getItem('UserDetails') != null) {
      let decrypt = CryptoJS.AES.decrypt(
        localStorage.getItem('UserDetails').toString(),
        environment.operatorKey
      );
      this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    }
    return this.profileDetails;
  }
  //Drones and Gears
  getDronesAndGearList(): any {
    // this.returnProfileDetails();
    let payload = {
      OperatorId: this.profileDetails.UserId,
    };
    this.operatorApi.getDronesAndGearsList(payload).then((res: any) => {
      this.dronesAndGearList = res['data'].MainData;
      //  this.profileDetails = res.Main
    });
  }
  returnDronesAndGearList() {
    return this.dronesAndGearList;
  }
  //Operators
  getOperatorsList() {
    let payload = {
      OperatorId: this.profileDetails.UserId,
    };
    this.operatorApi.getOperatorsList(payload).then((res: any) => {
      this.operatorsList = res.data.MainData;
      //  this.profileDetails = res.Main
    });
  }
  returnOperatorsList() {
    return this.operatorsList;
  }

  finalwaypointVal = [];
  waypoint;

  async waypointsFetch() {
    const waypointURL = this.profileDetails?.GeoFence?.FileURL;
    const waypointType = this.profileDetails?.GeoFence?.FileType;
    const MaxAlt = this.profileDetails?.GeoFence?.MaxAlt || 100;
    const response = await this.operatorApi.fetchGeoZone(waypointURL);

    // covert to waypoints
    const waypointArray = await this.geoFenceUpload(response, waypointType);

    const positions = [];
    for (let i = 0; i < waypointArray.LongitudeArr.length; i++) {
      positions.push(
        waypointArray.LongitudeArr[i],
        waypointArray.LatitudeArr[i],
        MaxAlt
      );
    }

    if (
      !(
        waypointArray.LongitudeArr[0] ==
          waypointArray.LongitudeArr[waypointArray.LongitudeArr?.length] &&
        waypointArray.LatitudeArr[0] ==
          waypointArray.LatitudeArr[waypointArray.LongitudeArr?.length]
      )
    ) {
      positions.push(
        waypointArray.LongitudeArr[0],
        waypointArray.LatitudeArr[0],
        MaxAlt
      );
    }

    return positions;
  }

  // upload File
  geoFenceUpload(
    file,
    type
  ): Promise<{
    LatitudeArr: number[];
    LongitudeArr: number[];
    AltitudeArr: number[];
    initialPos: number[];
  }> {
    return new Promise((resolve, reject) => {
      let waypointArray = {
        LatitudeArr: [],
        LongitudeArr: [],
        AltitudeArr: [],
        initialPos: [],
      };
      let totalLatitude = 0;
      let totalLongitude = 0;
      let validArrCount = 0;

      if (type === 'kml') {
        let fileReader = new FileReader();
        fileReader.onload = async (e: any) => {
          try {
            let result = await this.extractKMLCoords(e.target.result);
            // console.log('kml', result);
            result.forEach((coordinate, index) => {
              waypointArray.LatitudeArr.push(coordinate.lat);
              waypointArray.LongitudeArr.push(coordinate.lng);
              waypointArray.AltitudeArr.push(120);
              waypointArray.initialPos.push(
                Cesium.Cartesian3.fromDegrees(coordinate.lng, coordinate.lat)
              );
            });
            resolve(waypointArray);
          } catch (error) {
            reject(error);
          }
        };
        fileReader.readAsText(file);
      } else if (type === 'waypoints') {
        let fileReader = new FileReader();
        let self = this;
        fileReader.onloadend = async function (x) {
          try {
            self.finalwaypointVal = [];
            self.waypoint = fileReader.result;
            const lines = self.waypoint.split('\n');
            const convertedData = [];
            for (const line of lines) {
              if (line.trim() === '') {
                continue;
              }
              const values = line.split(/\s+/);
              const cleanedValues = values.filter(
                (value) => value.trim() !== ''
              );
              convertedData.push(cleanedValues);
            }
            // console.log('waypoints', convertedData);

            convertedData.forEach((arr, index) => {
              if (arr[8] && arr[9] && arr[10]) {
                if (
                  Number(arr[3]) == 16 ||
                  Number(arr[3]) == 21 ||
                  Number(arr[3]) == 85
                ) {
                  validArrCount += 1;
                  totalLatitude += Number(arr[8]);
                  totalLongitude += Number(arr[9]);

                  if (Number(arr[8]) == 0 || Number(arr[9]) == 0) {
                    if (Number(arr[3]) == 16) {
                      waypointArray.LatitudeArr.push(arr[8]);
                      waypointArray.LongitudeArr.push(arr[9]);
                    } else {
                      waypointArray.LatitudeArr.push(
                        waypointArray.LatitudeArr[
                          waypointArray.LatitudeArr.length - 1
                        ]
                      );
                      waypointArray.LongitudeArr.push(
                        waypointArray.LongitudeArr[
                          waypointArray.LongitudeArr.length - 1
                        ]
                      );
                    }
                  } else {
                    waypointArray.LatitudeArr.push(arr[8]);
                    waypointArray.LongitudeArr.push(arr[9]);
                  }
                  if (Number(arr[3]) == 21) {
                    if (Number(arr[8]) == 0 || Number(arr[9]) == 0) {
                      waypointArray.LatitudeArr.push(
                        waypointArray.LatitudeArr[
                          waypointArray.LatitudeArr.length - 1
                        ]
                      );
                      waypointArray.LongitudeArr.push(
                        waypointArray.LongitudeArr[
                          waypointArray.LongitudeArr.length - 1
                        ]
                      );
                    } else {
                      waypointArray.LatitudeArr.push(arr[8]);
                      waypointArray.LongitudeArr.push(arr[9]);
                    }
                    // waypointArray.WayPointNum.push(String(Number(arr[0]) + 1));
                  }
                  if (waypointArray.LatitudeArr.length == 1) {
                    // Altitude from mean sea level
                    // this.AltitudeArr.push(Number(arr[10]));

                    // Altitude from ground level
                    waypointArray.AltitudeArr.push(0);
                  } else {
                    // this.AltitudeArr.push(
                    //   Number(this.AltitudeArr[0]) +
                    //   Number(this.AltitudeArr[this.AltitudeArr.length - 1])
                    // );
                    waypointArray.AltitudeArr.push(
                      Number(waypointArray.AltitudeArr[0]) + Number(arr[10])
                    );
                    if (Number(arr[3]) == 21) {
                      waypointArray.AltitudeArr.push(0);
                    }
                  }
                  let lat =
                    waypointArray.LatitudeArr[
                      waypointArray.LatitudeArr.length - 1
                    ];
                  let lng =
                    waypointArray.LongitudeArr[
                      waypointArray.LatitudeArr.length - 1
                    ];
                  waypointArray.initialPos.push(
                    Cesium.Cartesian3.fromDegrees(lng, lat)
                  );
                  if (Number(arr[3]) == 21) {
                    waypointArray.initialPos.push(
                      Cesium.Cartesian3.fromDegrees(lng, lat)
                    );
                  }
                } else if (Number(arr[3]) == 22 || Number(arr[3]) == 84) {
                  let lat =
                    waypointArray.LatitudeArr[
                      waypointArray.LatitudeArr.length - 1
                    ];
                  let lng =
                    waypointArray.LongitudeArr[
                      waypointArray.LatitudeArr.length - 1
                    ];
                  waypointArray.LatitudeArr.push(lat);
                  waypointArray.LongitudeArr.push(lng);
                  waypointArray.AltitudeArr.push(Number(arr[10]));
                  //2D Maps
                  waypointArray.initialPos.push(
                    Cesium.Cartesian3.fromDegrees(lng, lat)
                  );
                } else if (Number(arr[3]) == 20) {
                  validArrCount += 1;
                  waypointArray.LatitudeArr.push(waypointArray.LatitudeArr[0]);
                  waypointArray.LongitudeArr.push(
                    waypointArray.LongitudeArr[0]
                  );
                  waypointArray.AltitudeArr.push(
                    Number(waypointArray.AltitudeArr[0])
                  );
                  // , arr[10]  AltitudeArr[0]

                  //2D Maps
                  waypointArray.initialPos.push(
                    Cesium.Cartesian3.fromDegrees(
                      waypointArray.LongitudeArr[0],
                      waypointArray.LatitudeArr[0]
                    )
                  );
                }
              }
            });
            // console.log(waypointArray, initialPos);
            resolve(waypointArray);
          } catch (error) {
            reject(error);
          }
        };
        fileReader.readAsText(file);
      }
    });
  }
  async extractKMLCoords(plainText) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(plainText, 'text/xml');
    let Polygons = [];
    if (xmlDoc.documentElement.nodeName == 'kml') {
      let coordinates: any = xmlDoc.getElementsByTagName('coordinates');
      for (const coords of coordinates) {
        let coord = coords.childNodes[0].nodeValue.trim();
        let points = coord.split(' ');

        let PolygonsPaths = [];
        for (const point of points) {
          let singleCoord = point.split(',');
          Polygons.push({ lat: +singleCoord[1], lng: +singleCoord[0] });
        }
      }
    } else {
      throw 'error while parsing';
    }
    return Polygons;
  }
}
