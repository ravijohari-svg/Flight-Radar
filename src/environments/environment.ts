// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseHref: '/',
  environmentName: 'Local',
  envmode: 'local',

  //Operator Configurations
  // apiOperatorUrl: 'https://0k7xsn04fl.execute-api.eu-west-1.amazonaws.com/dev/',
  apiOperatorUrl: 'https://wo3o3t4fw6.execute-api.eu-west-1.amazonaws.com/dev/',
  OperatorUserPoolID: 'eu-west-1_kpljniyKW',
  OperatorClientId: '3hfdbe16nprkc39qkile33mbd',
  // Operatorauthorization: 'NBvTypth6B4d4yBNVtpTX5akbazIyFnR24uMXni5',
  //new x-api-key
  Operatorauthorization:'AdUgMuaXnaHGi26RpBhl5T0IijSaJ0H7fBXL2c7b',
  cognitoOperatorRegion: 'eu-west-1',
  stadimapKey: 'ea35c951-82a2-4026-8add-2272add4b7a2',
  // stadimapKey: 'ab88bf62-c386-4e6e-8186-dccc119dbeaa',
  stadiamapURL:
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png?api_key=',

  //Razorpay Credentials
  razorPayKeyID: 'rzp_test_AxRJMijOqSljAm',
  //Sara credentials
  // razorPayKeyID: 'rzp_test_mwyPxg76UQyT7G',
  //@Saroj - Report
  reportBaseURL: 'https://i0gafzwmv9.execute-api.eu-west-1.amazonaws.com/dev/',
  //@SL - CC avenue
  ccAvenueURL:
    'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  ccAvenueAccessToken: 'AVLD30KC00BJ98DLJB',

  //Authority Configurations
  apiAuthorityUrl:
    'https://cb91y14aga.execute-api.eu-west-1.amazonaws.com/dev/',
  AuthorityUserPoolID: 'eu-west-1_3ma3aKglC',
  AuthorityClientId: '1heootc59uggbfhprl1fvej9j8',
  Authorityauthorization: 'AdUgMuaXnaHGi26RpBhl5T0IijSaJ0H7fBXL2c7b',
  cognitoAuthorityRegion: 'eu-west-1',
  //Websocket
  websocketKey: 'wss://1qkrobw2oi.execute-api.eu-west-1.amazonaws.com/dev?',
  websocket4GKey: 'wss://d6y83xqne6.execute-api.eu-west-1.amazonaws.com/testing?',
  websocketFlightRadar: 'wss://kjl5txzy1m.execute-api.eu-west-1.amazonaws.com/dev/?',

  elsightUrl: 'https://wcfbolcwd5.execute-api.ap-south-1.amazonaws.com/prod/',

  // oneLapUrl: 'https://webtest.onelap.in/api/positions/latest?deviceId=154',
  // oneLapAuth: 'OTEwODgxNzExMDpBc2hpc2hAMTIz',

  oneLapUrl: 'https://web.onelap.in/api/positions/latest?deviceId=91260',
  // 'https://web.onelap.in/api/positions/latest?deviceId=91264', 91758
  oneLapDynamicUrl: 'https://web.onelap.in/api/positions/latest?deviceId=',
  // 'https://web.onelap.in/api/positions/latest?deviceId=91264',
  // oneLapAuth: 'NzAwNzcyOTAwMjo3MDA3NzI5MDAy',
  oneLapAuth: 'OTU5OTQ4NDIyNDpTYWtpYkAxMjM=',

  // Customer Configurations
  apiCustomerUrl:
    'https://2fxsoqc6ae.execute-api.ap-south-1.amazonaws.com/prod/',
  customerAuthorization: 'noyiOlma9uaHbBeSsWu6h5ffuFJv0ESg28ilBI2i',

  //Client configurations
  apiClientUrl: 'https://2fxsoqc6ae.execute-api.ap-south-1.amazonaws.com/prod/',

  //OpenWeather
  openWeatherUrl: 'https://api.openweathermap.org/data/2.5',
  openWeatherapiKey: '4a1b9575b2b9ca49add38e38bc27b5e5',

  //OpenWeather-getCityNameByLatLong()/getLatLongByCityName()
  getCityAndLatLong: 'http://api.openweathermap.org/geo/1.0',

  //tommorow.io
  tommorowWeatherUrl: 'https://data.climacell.co/v4/timelines',
  tommorowWeatherAPIKey: 'smreFfbIbOVmaviU8Bba623wFZrbjSy3',

  //Cesium -Bing Maps Key
  bingKey: 'AjvekXFV3SFSzBrZl-BR61_RKyGfkyXCiQiXhk3dJw8UV-V99vc_Xz6sBti6S24U',

  //Cesium - mapbox key
  mapBoxKey:
    'pk.eyJ1Ijoic3VicmF0MDA3IiwiYSI6ImNrYjNyMjJxYjBibnIyem55d2NhcTdzM2IifQ.-NnMzrAAlykYciP4RP9zYQ',
  // maptilerkey: 'DxQut6ym1SoW23Vs5cFi',
  // maptilerkey: 'WGJlMz0slMaQhCQokb0J',
  maptilerkey: 'oUA4KcyikgENNKvJNnIA',
  maptilerUrl: 'https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=',

  //AES Encrypt key
  AESEncrypt: 'SkWhye@!RyOUTeaM',
  openWeatherState: 'http://api.openweathermap.org/geo/1.0',
  //localStorage Encrypt Decrypt
  operatorKey: 'N@v!@Tc2395738261',
  authorityKey: 'N@v!ATcAutH1271242',
  reportKey: '$kye@A!r@Rep0Rt8364',
// OPENSKY_CLIENT_ID:'animesh@skyeair.tech-api-client',
// OPENSKY_CLIENT_SECRET:'DSvbu7TIbjYzGx5kt8UZQnHzXmwrOcND',

  OPENSKY_CLIENT_ID:'manpreetskyeairopensky123-api-client',
  OPENSKY_CLIENT_SECRET:'ELBfwlHOHtLCY0RC0raNPfWYMmk0N8WR',

  baseApi: 'https://0u7tdvmqj1.execute-api.eu-west-1.amazonaws.com/',

  uploadBaseUrl: 'https://a1nq13ldv7.execute-api.eu-west-1.amazonaws.com/',

  //Encrypt Decrypt
  publickey: `-----BEGIN RSA PUBLIC KEY-----
MIICCgKCAgEA6U4sLfJVjUFvYDeARb1YC/f6jMAmm7oOkVOL+a5xxJhX8jI9VEos
pLCaoh6+yhkn0nS08BxbM0xT83ZRuGaWPWfxltAWlK1wrNX8loyLB32K8s9r9FDF
CVsRq/8GG3eGDHnz538H/PSgDSt7MDmQX+5x8N/YW3ge9babRDr9AkerzlMIEpXo
SWaK+QRdh3JhGLG20KKG1ljP/fRV5jV69tL5mWNrv4UpaGP+xxjiTRGJOzZmAJg1
vmKpYrEH4guHfp/+YeqK9KLMWJEBQq64QaWqKMxuIgBlobKZUbKUk4e5nxNLPXws
HnljTtZG4Pwdu2izsa4hwxP1xzG4JEtlV45s10hDOimSQ5+KXu+aXwu/rDNTFAAo
XyS7qAbE7ue/64RjjTHrPnBjxmAqLRDTFPw3sAPpbyWJtWmhWmv0eu6VliID/LYy
ho/qGzTZoFLM8dJY5CmZtt0a/ANiu+vR/McVZhzP2LSSz0fB3I1FkwPMuzQc4bpW
BSPKh/pdhdk+H/P+85u6GCnaJJ20mlxJsUZ+kqVEoYEaSKefxt8o1pHfSg71xL71
QRH0bLR+2VTnguRtlW+GVaeUc3NscRjXqGaumBLSlgF0qLOtL5SoKB1/y93c1hHm
98r96uBPnMwRy3ZWedQ5GsKLrhQlwVRWVzObWopaqnrVHsZkNfAQ/AcCAwEAAQ==
-----END RSA PUBLIC KEY-----`,
  privatekey: `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`,
  serverPublickey: `-----BEGIN RSA PUBLIC KEY-----
MIICCgKCAgEAxjJv3CGiyRXBRtVtucSxcNlfshBiOBFXM//2yDI2d58vy7rtrVjt
oWGDOjdQYGZTAcggv9oFvhzXjTQfTcul3gyj389lzp6vWPLdoqXNBJXXQrOsmvsH
wX+B1eoEFkRSFm/CtXLFjP2xc8FomCDEgP5AOxPwNxnQNwqbUTThMe7zi7krT/gw
aMk55xRpSXWszHWk6dGEqlqRdRpIn3ujrhm6vMQIus5RZJnGp9Yu+r8ODKZBSWfR
6u/GKPa8jSP4XJK0fojwnjb6x349oR86eE+btuQH2fXKbv8+FqnkqFybqmP4dZgX
xbB65eCX2k5bC14Gi19nrZIGsWsQdpMs7QywZnwZ/kx914VWrrDyEBrVr8F3W9CV
92Gesj/zlLwmWYVxtRixGHvNZNXm5Os+4wrE0XxBuPNeYPRTsSo6kVUyPehU5+j4
3qUcaq1bngq5przx+LchPvVGOp5X/aqsmNMjn6429NrLrsM/WilfbDpxqd8lTlGf
whDyyanmQO7VRMMRzF05Aq11LI6oDsSi7tw5eNP2O9v0DabMqMo0W1MzM9JO5AGT
bBEvnu7GyoqNWCYNqXBjA6nCpF75C82W1T8aGRCdxSCvn0PUzNjWCo/hjDYekAkm
EqPQ592MCFEokc6YvrCZyxmiRDxdyCRC+4Bsu8SvQBFpYx9NgEOB42MCAwEAAQ==
-----END RSA PUBLIC KEY-----`,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
