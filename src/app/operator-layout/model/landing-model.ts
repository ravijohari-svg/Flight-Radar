export interface InfoCard {
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  backgroundColor: string;
}

export interface FeatureCarsoulInterface {
  title: string;
  icon: string;
}

export const INFO_CARDS: InfoCard[] = [
  {
    title: 'Skye Pod',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    buttonText: 'Request a Demo',
    imageUrl: 'assets/landing-img/map-img.png',
    backgroundColor: '#90caf9'
  },
  {
    title: 'Smart City Pod',
    description: 'Integrated urban delivery.',
    buttonText: 'Explore Now',
    imageUrl: 'assets/landing-img/map-img.png',
    backgroundColor: '#ffcc80'
  },
  {
    title: 'Eco Node',
    description: 'Sustainable logistics.',
    buttonText: 'Get Started',
    imageUrl: 'assets/landing-img/map-img.png',
    backgroundColor: '#ce93d8'
  },
  {
    title: 'Express Pod',
    description: 'Fast and reliable.',
    buttonText: 'Book a Demo',
    imageUrl: 'assets/landing-img/map-img.png',
    backgroundColor: '#f48fb1'
  }
];

export const FeatureCarsoul: FeatureCarsoulInterface[] = [
  {
    "title": "Mission Creation",
    "icon": "assets/icons/active-flight.svg",
  },
  {
    "title": "3D Map",
    "icon": "assets/icons/active-flight.svg",
  },
  {
    "title": "Terrain",
    "icon": "assets/icons/active-flight.svg",
  },
  {
    "title": "Skyepods",
    "icon": "assets/icons/active-flight.svg",
  },
  {
    "title": "Weather   Information",
    "icon": "assets/icons/active-flight.svg",
  }
];