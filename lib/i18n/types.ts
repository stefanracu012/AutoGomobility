export type Locale = "en" | "de" | "fr" | "it" | "ru";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export interface Dict {
  nav: { home: string; fleet: string; services: string; bookNow: string };
  hero: { line1: string; accent: string; line2: string };
  fleet: {
    subtitle: string; title: string; titleAccent: string;
    description: string; bookVehicle: string; viewFleet: string;
  };
  fleetPage: { subtitle: string; title: string; description: string };
  services: {
    subtitle: string; title: string; titleAccent: string; description: string;
  };
  servicesPage: {
    subtitle: string; title: string; description: string; cta: string;
  };
  dest: {
    subtitle: string; title: string; titleAccent: string; description: string;
    from: string; to: string; businessClass: string; bookRoute: string; off: string;
  };
  about: {
    subtitle: string; title: string; titleAccent: string; description: string;
    feat1: string; feat2: string; feat3: string; feat4: string; cta: string;
  };
  bookingPage: { subtitle: string; title: string; description: string };
  form: {
    heading: string; transfer: string; byTheHour: string;
    estPrice: string; distance: string; estDuration: string;
    duration: string; hour: string; hours: string;
    priceNote: string; finalOffer: string;
    fullName: string; namePh: string;
    email: string; emailPh: string;
    phone: string; phonePh: string;
    pickupDateTime: string; vehicle: string;
    economyEClass: string; businessSClass: string; luxuryVClass: string;
    passengers: string; passenger: string; passengersWord: string;
    pickupLocation: string; startLocation: string; searchPh: string;
    destination: string; durationHours: string; minMaxHours: string;
    notes: string; notesPh: string;
    submitting: string; confirmBooking: string; submitError: string;
    successTitle: string; successMsg: string; successNote: string;
  };
  calc: {
    heading: string; pickupLocation: string; destination: string; searchPh: string;
    vehicleType: string;
    economy: string; eClass: string; business: string; sClass: string;
    luxury: string; vClass: string;
    hoursLabel: string; hoursPh: string;
    passengersLabel: string; passengersPh: string;
    calculating: string; calculatePrice: string;
    estimatedPrice: string; priceNote: string; proceedToBooking: string;
    errBoth: string; errSelect: string; errRoute: string; errCalc: string;
  };
  datePicker: {
    selectDate: string; selectTime: string; pickTime: string;
    months: string[]; days: string[];
  };
  track: {
    pending: string; offerSent: string; confirmed: string;
    rejected: string; cancelled: string; completed: string;
    notFoundTitle: string; notFoundDesc: string;
    headerSubtitle: string; headerTitle: string;
    bookingNum: string; updated: string;
    yourResponse: string; offerDesc: string;
    alreadyProcessed: string; confirmError: string; networkError: string;
    confirming: string; confirmBooking: string;
    declining: string; declineOffer: string; declineError: string;
    driverLocation: string; live: string; offline: string;
    shareLocation: string; optional: string;
    shareMyLocation: string; stopSharing: string;
    locationSent: string; driverNotSharing: string; autoRefresh: string;
    yourJourney: string; pickup: string; destination: string; openInMaps: string;
  };
  driver: {
    notFoundTitle: string; notFoundDesc: string;
    panel: string; bookingNum: string; bookingDetails: string;
    client: string; phone: string; pickup: string;
    duration: string; destination: string;
    date: string; time: string; vehicle: string;
    passengers: string; notes: string; total: string;
    quickActions: string; navigatePickup: string;
    waze: string; whatsapp: string; whatsappMsg: string;
    liveLocation: string; gpsSubtitle: string;
    sharing: string; offline: string;
    startSharing: string; stopSharing: string;
    gps: string; sent: string;
    liveMap: string; clientSharing: string; clientLocation: string; live: string;
  };
  geo: {
    notSupported: string; unavailable: string; timeout: string;
    denied: string;
    iphoneLabel: string; iphoneInstr: string;
    androidLabel: string; androidInstr: string;
    desktopLabel: string; desktopInstr: string;
    tryAgain: string;
  };
  footer: {
    description: string; quickLinks: string;
    home: string; ourFleet: string; services: string; bookNow: string;
    contact: string; rights: string;
  };
}
