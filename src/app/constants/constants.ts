export class Constants {
  public static missionBuffer = 0.05;
  public static droneBuffer = 0.5;
  public static levelArr = ['L1', 'L2', 'L3', 'L4'];
  public static filterLevel = ['L1', 'L2', 'L3', 'L4'];
  public static DroneUnits = {
    UAVInfoClass: 'kg',
    UAVInfoEndurance: 'min',
    UAVInfoMaxSpeed: 'km/hr',
    UAVMakeMaxDimension: 'm',
    CommsRange: 'm',
  };
  public static kmlFileDocumentType = 'KML_FILE';
  public static operationsPlanDocumentType = 'OPERATIONS_PLAN';
  public static uinOfDronesDocumentType = 'UIN_OF_DRONES';
  public static dgcaCertificateDocumentType = 'DGCA_CERTIFICATE';
  public static insuranceDocumentType = 'INSURANCE_DOCUMENT';
  public static incorporationDocumentType = 'INCORPORATION_DOCUMENT';
  public static companyProfileDocumentType = 'COMPANY_PROFILE';
  public static document1DocumentType = 'DOCUMENT_1';
  public static document2DocumentType = 'DOCUMENT_2';
  public static document3DocumentType = 'DOCUMENT_3';
  public static document4DocumentType = 'DOCUMENT_4';
  public static maxRetryAttempts = 2;
  public static checkLiveStream = 'check-live-stream';
  public static ReuseAddress_droneParameters = 'drone-parameters';
  public static ReuseAddress_missionParamters = 'mission-parameters';
  public static ReuseAddress_blackbox = 'missionlist';
  public static frame = 0;
  public static homeFrame = 1;
  public static commandRelative=3;
  public static commandAbsolute=0;
  public static takeOff = 22;
  public static land = 21;
  public static loiter = 16;
  public static autocontinue= 1;
  public static StreamModes = {
    MP: 'GCS',
    Onelap: 'N-Tracker',
    Elsight: 'Remote-ID',
  };

  public static BVLOSDroneTrailingValues = {
    LatLng: 0.05,
    Alt: 15,
    TimeDiff: 90000,
    HeadingDiff: 50,
  };
  public static landingPageData = [
    {
      "title": "Deconfliction",
      "src": "../../../assets/icons/Deconfliction.svg",
      "data": "The platform manages aerial traffic of Unmanned and manned aircrafts and ensures safety of the entire airspace through its deconfliction engine. The engine continuously verifies the vertical and horizontal separation across a 3D plane between all the aerial vehicles and offers alerts/suggestions for the best course of action."
    },
    {
      "title": "Compliance",
      "src": "../../../assets/icons/comliance.svg",
      "data": "UTM platforms adhere to industry and regulatory standards to ensure that the system meets security requirements set by relevant authorities. Compliance with established standards adds an additional layer of assurance to the state regarding the security of the UTM ecosystem."
    },
    {
      "title": "Real-time Monitoring and Tracking",
      "src": "../../../assets/icons/live_tracking_real_time.svg",
      "data": "UTM platforms continuously monitor and track drone operations in real-time. This enables authorities to have a comprehensive view of all drone activities within the state's airspace, facilitating timely intervention if any suspicious or unauthorized drone operations are detected."
    },
    {
      "title": "RPTO",
      "src" : "../../../assets/icons/rpto.svg",
      "data": "The RPTO Skye UTM portal is an Enterprise resource management portal designed for single and multi-branch training organizations. The portal provides access to Administration, tracking, and analytics across all your RPTO locations, the batches, the pilots and drones, and the organization's planning. The platform provides performance and analytics of the RPTO and stores all information on the cloud for anytime, anywhere, and forever access to the organization's stakeholders."
    },
    {
      "title": "Airspace Maps",
      "src": "../../../assets/icons/aerospace.svg",
      "data": "Airspace advisories provide drone operators with essential information about controlled and restricted airspace. This includes details about different classes of airspace (Class M, T, R, etc.), Temporary Flight Restrictions (TFRs), and other restricted areas. By accessing airspace advisories, drone operators can plan their flights in compliance with airspace regulations, ensuring safe and legal operations."
    },
    {
      "title": "WhatsApp UTM",
      "src": "../../../assets/icons/whatsapp_utm.svg",
      "data": "Our service offers a streamlined process for managing flight plans through WhatsApp. Users can easily submit their flight plans and will receive timely notifications regarding approvals or rejections, as well as important alerts and warnings for all missions. Additionally, users will be provided with comprehensive pre-flight and post-flight reports, ensuring they stay informed at every stage of their journey, all through the convenience of WhatsApp."
    },
    {
      "title": "Blackbox",
      "src": "../../../assets/icons/Blackbox.png",
      "data": "In Blackbox, users can access comprehensive information about all live and completed missions. They have the ability to download both Pre-flight and Post-flight reports directly from the platform. Additionally, users can view drone trails and check flight history, which includes various alerts and warnings."
    }
  ];
  public static LOSDroneTrailingValues = {
    LatLng: 0.03,
    Alt: 5,
    TimeDiff: 60000,
    HeadingDiff: 50,
  };

  public static subscriptionPlan = {
    free: 'Free',
    basic: 'Basic',
    advanced: 'Advanced',
  };
  public static swal_bg_color = '#1b1f27';
  public static pilotAccess = 'pilot';
  public static authorityAcess = 'authority';

  public static activeURLArr = [
    {
      name: 'Dashboard',
      url: 'dashboard',
      img: '../../../assets/common-layout/DashboardIcon.svg',
    },
    {
      name: 'Mission',
      url: 'mission',
      img: '../../../assets/common-layout/MissionIcon.svg',
    },
    {
      name: 'Drones & Gears',
      url: 'drones-gears',
      img: '../../../assets/common-layout/DronesAndGear.svg',
    },
    {
      name: 'Profile',
      url: 'operators-setting',
      img: '../../../assets/common-layout/Settings.svg',
    },
  ];

  public static activeURLArr_Authority = [
    {
      name: 'Dashboard',
      url: 'dashboard',
      img: '../../../assets/common-layout/DashboardIcon.svg',
      level: ['L1', 'L2', 'L3', 'L4'],
    },
    {
      name: 'Drones',
      url: 'manned-flight',
      img: '../../../assets/common-layout/Drone - Live - 1.svg',
      level: ['L1', 'L2', 'L3', 'L4'],
    },
    {
      name: 'Blackbox',
      url: 'blackbox',
      img: '../../../assets/common-layout/Blackbox.svg',
      level: ['L1', 'L2', 'L3'],
    },
    // {
    //   name: 'Skyeair Flights',
    //   url: 'flight-radar',
    //   img: '../../../assets/common-layout/Drone - Live - 1.svg',
    //   level: ['L1', 'L2', 'L3', 'L4'],
    // },
    {
      name: 'Rule Engine',
      url: 'rule-engine',
      img: '../../../assets/common-layout/RuleEngine.svg',
      level: ['L1'],
    },
    
    // {
    //   name: 'Remote ID Portal',
    //   url: 'remote-id',
    //   // Drone - Live - 1
    //   img: '../../../assets/common-layout/Drone - Live - 1.svg',
    //   level: ['L1', 'L2', 'L3', 'L4']
    // },
    // {
    //   name: 'Onelap Tracker',
    //   url: 'onelap',
    //   // Drone - Live - 1
    //   img: '../../../assets/common-layout/Drone - Live - 1.svg',
    //   level: ['L1', 'L2', 'L3', 'L4'],
    // },

    {
      name: 'Administrator',
      url: 'admin',
      // img:'../../../assets/common-layout/users-icon.svg',
      img: '../../../assets/common-layout/user-square.svg',
      level: ['L1'],
    },
  ];

  public static verfictaionCodeUIConfig = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: true,
    placeholder: '',
    inputStyles: {
      width: '40px',
      height: '30px',
      'border-radius': '5px',
      border: '1px solid #ced4da',
      'font-size': '17px',
    },
  };
}
export const flyabilityConditions = {
  VTOL: {
    goodToFly: {
      wind: 5,
      temperature: { min: 273.15, max: 313.15 },
      gustWind: 5,
      visibility: 5,
      precipitation: 30,
    },
    flyWithCautions: {
      wind: 8,
      temperature: { min: 253.15, max: 319.15 },
      gustWind: 8,
      visibility: 5,
      precipitation: 45,
    },
  },
  Hexa: {
    goodToFly: {
      wind: 10,
      temperature: { min: 273.15, max: 313.15 },
      gustWind: 10,
      visibility: 5,
      precipitation: 30,
    },
    flyWithCautions: {
      wind: 14,
      temperature: { min: 253.15, max: 319.15 },
      gustWind: 14,
      visibility: 5,
      precipitation: 30,
    },
  },
};
export const assets = [
  {
    path: 'file.svg',
    label: 'Airspace Permissions',
    key: 'getCoRelation',
  },
  {
    path: 'file.svg',
    label: 'Mission Details',
    key: 'getMissionDetail',
  },
  {
    path: 'direct-flight.svg',
    label: 'Drone Details',
    key: 'getDroneDetail',
  },
  {
    path: 'rain.svg',
    label: 'Weather',
    key: 'getWeather',
  },
  {
    path: 'traffic-jam.svg',
    label: 'Date & Time',
    key: 'getDateTime',
  },
  {
    path: 'direct-flight.svg',
    label: 'Activity Type',
    key: 'getActivityType',
  },
  {
    path: 'stamp.svg',
    label: 'Flight Purpose',
    key: 'getPurposeFlight',
  },
  {
    path: 'stamp.svg',
    label: 'Drone Parameters',
    key: 'getDroneParameter',
  },
  {
    path: 'stamp.svg',
    label: 'Mission List',
    key: 'getMissionList',
  },
  {
    path: 'stamp.svg',
    label: 'Waypoints',
    key: 'checkingWaypoint',
  },
  {
    path: 'file.svg',
    label: 'Mission Parameters',
    key: 'createMission',
  },
  {
    path: 'rain.svg',
    label: 'Mission Environments',
    key: 'setMissionEnvironment',
  },
];
