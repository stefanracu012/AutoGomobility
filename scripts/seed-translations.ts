/* One-time script: populate all fleet/services/destinations with 5-lang translations */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fleet = [
  {
    id: "1",
    name: { en: "Mercedes E-Class", de: "Mercedes E-Klasse", fr: "Mercedes Classe E", it: "Mercedes Classe E", ru: "Mercedes E-Class" },
    category: { en: "Economy", de: "Economy", fr: "Économique", it: "Economy", ru: "Эконом" },
    description: {
      en: "Elegant sedan ideal for city transfers and short trips. Premium comfort at an accessible price point.",
      de: "Elegante Limousine, ideal für Stadttransfers und Kurzstrecken. Premium-Komfort zu einem erschwinglichen Preis.",
      fr: "Berline élégante idéale pour les transferts urbains et les courts trajets. Confort premium à un prix accessible.",
      it: "Berlina elegante ideale per trasferimenti in città e brevi viaggi. Comfort premium a un prezzo accessibile.",
      ru: "Элегантный седан, идеальный для городских трансферов и коротких поездок. Премиум-комфорт по доступной цене."
    },
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    priceLabel: { en: "from 0.80/km", de: "ab 0.80/km", fr: "à partir de 0.80/km", it: "da 0.80/km", ru: "от 0.80/км" },
    passengers: { en: "Up to 3", de: "Bis zu 3", fr: "Jusqu'à 3", it: "Fino a 3", ru: "До 3" },
    luggage: { en: "2 suitcases", de: "2 Koffer", fr: "2 valises", it: "2 valigie", ru: "2 чемодана" },
    features: ["Climate control", "Leather seats", "Wi-Fi", "Phone charger"]
  },
  {
    id: "2",
    name: { en: "Mercedes S-Class", de: "Mercedes S-Klasse", fr: "Mercedes Classe S", it: "Mercedes Classe S", ru: "Mercedes S-Class" },
    category: { en: "Business", de: "Business", fr: "Affaires", it: "Business", ru: "Бизнес" },
    description: {
      en: "The flagship sedan. Unmatched luxury, advanced technology, and a supremely smooth ride.",
      de: "Die Flaggschiff-Limousine. Unvergleichlicher Luxus, modernste Technologie und ein äußerst sanftes Fahrgefühl.",
      fr: "La berline phare. Luxe inégalé, technologie avancée et une conduite d'une douceur suprême.",
      it: "La berlina ammiraglia. Lusso impareggiabile, tecnologia avanzata e una guida estremamente fluida.",
      ru: "Флагманский седан. Непревзойдённая роскошь, передовые технологии и исключительно плавная езда."
    },
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
    priceLabel: { en: "from 1.20/km", de: "ab 1.20/km", fr: "à partir de 1.20/km", it: "da 1.20/km", ru: "от 1.20/км" },
    passengers: { en: "Up to 3", de: "Bis zu 3", fr: "Jusqu'à 3", it: "Fino a 3", ru: "До 3" },
    luggage: { en: "3 suitcases", de: "3 Koffer", fr: "3 valises", it: "3 valigie", ru: "3 чемодана" },
    features: ["Massage seats", "Ambient lighting", "Premium sound", "Rear entertainment"]
  },
  {
    id: "3",
    name: { en: "Mercedes V-Class", de: "Mercedes V-Klasse", fr: "Mercedes Classe V", it: "Mercedes Classe V", ru: "Mercedes V-Class" },
    category: { en: "Luxury", de: "Luxus", fr: "Luxe", it: "Lusso", ru: "Люкс" },
    description: {
      en: "Spacious premium van for groups and families. First-class comfort for up to 7 passengers.",
      de: "Geräumiger Premium-Van für Gruppen und Familien. Erstklassiger Komfort für bis zu 7 Passagiere.",
      fr: "Van premium spacieux pour groupes et familles. Confort première classe pour jusqu'à 7 passagers.",
      it: "Van premium spazioso per gruppi e famiglie. Comfort di prima classe per un massimo di 7 passeggeri.",
      ru: "Просторный премиум-вэн для групп и семей. Комфорт первого класса для 7 пассажиров."
    },
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
    priceLabel: { en: "from 1.80/km", de: "ab 1.80/km", fr: "à partir de 1.80/km", it: "da 1.80/km", ru: "от 1.80/км" },
    passengers: { en: "Up to 7", de: "Bis zu 7", fr: "Jusqu'à 7", it: "Fino a 7", ru: "До 7" },
    luggage: { en: "6 suitcases", de: "6 Koffer", fr: "6 valises", it: "6 valigie", ru: "6 чемоданов" },
    features: ["Captain seats", "Table console", "Privacy glass", "Extra legroom"]
  },
  {
    id: "4",
    name: { en: "BMW X5", de: "BMW X5", fr: "BMW X5", it: "BMW X5", ru: "BMW X5" },
    category: { en: "SUV", de: "SUV", fr: "SUV", it: "SUV", ru: "Внедорожник" },
    description: {
      en: "Commanding presence with superior comfort. Perfect for long-distance travel and VIP transfers.",
      de: "Imposante Erscheinung mit überlegenem Komfort. Perfekt für Langstreckenreisen und VIP-Transfers.",
      fr: "Présence imposante avec un confort supérieur. Parfait pour les longs trajets et les transferts VIP.",
      it: "Presenza imponente con comfort superiore. Perfetto per viaggi a lunga distanza e trasferimenti VIP.",
      ru: "Внушительное присутствие с превосходным комфортом. Идеален для дальних поездок и VIP-трансферов."
    },
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    priceLabel: { en: "from 1.80/km", de: "ab 1.80/km", fr: "à partir de 1.80/km", it: "da 1.80/km", ru: "от 1.80/км" },
    passengers: { en: "Up to 4", de: "Bis zu 4", fr: "Jusqu'à 4", it: "Fino a 4", ru: "До 4" },
    luggage: { en: "4 suitcases", de: "4 Koffer", fr: "4 valises", it: "4 valigie", ru: "4 чемодана" },
    features: ["Panoramic roof", "All-wheel drive", "Heated seats", "Adaptive cruise"]
  }
];

const services = [
  {
    id: "1", number: "01",
    title: { en: "Airport Transfer", de: "Flughafentransfer", fr: "Transfert Aéroport", it: "Trasferimento Aeroporto", ru: "Трансфер из аэропорта" },
    description: {
      en: "Punctual pickups and drop-offs at all major airports. Flight tracking included so we are always on time, regardless of delays.",
      de: "Pünktliche Abholungen und Rückfahrten an allen großen Flughäfen. Flugverfolgung inklusive, damit wir immer pünktlich sind, unabhängig von Verspätungen.",
      fr: "Prises en charge et déposes ponctuelles dans tous les grands aéroports. Suivi de vol inclus pour être toujours à l'heure, quels que soient les retards.",
      it: "Ritiri e consegne puntuali in tutti i principali aeroporti. Tracciamento del volo incluso per essere sempre puntuali, indipendentemente dai ritardi.",
      ru: "Пунктуальная встреча и доставка во всех крупных аэропортах. Отслеживание рейсов включено — мы всегда вовремя, независимо от задержек."
    },
    tag: { en: "Most popular", de: "Am beliebtesten", fr: "Le plus populaire", it: "Più popolare", ru: "Самый популярный" },
    highlights: ["Real-time flight tracking", "Meet & greet with name board", "Free 60 min waiting time", "Fixed prices, no surge"]
  },
  {
    id: "2", number: "02",
    title: { en: "Business Chauffeur", de: "Business-Chauffeur", fr: "Chauffeur d'Affaires", it: "Autista Business", ru: "Бизнес-шофёр" },
    description: {
      en: "Professional chauffeur service for executives and business travelers. Discreet, reliable, and always impeccably presented.",
      de: "Professioneller Chauffeurservice für Führungskräfte und Geschäftsreisende. Diskret, zuverlässig und stets tadellos gekleidet.",
      fr: "Service de chauffeur professionnel pour cadres et voyageurs d'affaires. Discret, fiable et toujours impeccablement présenté.",
      it: "Servizio autista professionale per dirigenti e viaggiatori d'affari. Discreto, affidabile e sempre impeccabilmente presentato.",
      ru: "Профессиональный сервис шофёра для руководителей и деловых путешественников. Сдержанный, надёжный и всегда безупречный."
    },
    tag: { en: "Corporate", de: "Firmen", fr: "Entreprise", it: "Aziendale", ru: "Корпоративный" },
    highlights: ["Professional dress code", "NDA available on request", "Wi-Fi & phone chargers", "Flexible hourly booking"]
  },
  {
    id: "3", number: "03",
    title: { en: "Long Distance Travel", de: "Langstreckenfahrten", fr: "Voyage Longue Distance", it: "Viaggi a Lunga Distanza", ru: "Дальние поездки" },
    description: {
      en: "Comfortable intercity and cross-border rides. Sit back and relax while we handle the journey from door to door.",
      de: "Komfortable Überlandfahrten und grenzüberschreitende Fahrten. Lehnen Sie sich zurück und entspannen Sie sich, während wir die Reise von Tür zu Tür übernehmen.",
      fr: "Trajets interurbains et transfrontaliers confortables. Installez-vous et détendez-vous pendant que nous gérons le voyage de porte à porte.",
      it: "Viaggi interurbani e transfrontalieri comodi. Rilassatevi mentre noi ci occupiamo del viaggio porta a porta.",
      ru: "Комфортные междугородние и трансграничные поездки. Расслабьтесь, пока мы довезём вас от двери до двери."
    },
    tag: { en: "Cross-border", de: "Grenzüberschreitend", fr: "Transfrontalier", it: "Transfrontaliero", ru: "Трансграничный" },
    highlights: ["Door-to-door service", "Cross-border expertise", "Complimentary water & snacks", "Multiple stops available"]
  },
  {
    id: "4", number: "04",
    title: { en: "VIP Service", de: "VIP-Service", fr: "Service VIP", it: "Servizio VIP", ru: "VIP-сервис" },
    description: {
      en: "Exclusive service for special events, weddings, and high-profile occasions. Red-carpet treatment from start to finish.",
      de: "Exklusiver Service für besondere Anlässe, Hochzeiten und hochkarätige Veranstaltungen. Roter-Teppich-Behandlung von Anfang bis Ende.",
      fr: "Service exclusif pour événements spéciaux, mariages et occasions prestigieuses. Traitement tapis rouge du début à la fin.",
      it: "Servizio esclusivo per eventi speciali, matrimoni e occasioni di alto profilo. Trattamento da tappeto rosso dall'inizio alla fine.",
      ru: "Эксклюзивный сервис для особых мероприятий, свадеб и престижных событий. Обслуживание по красной дорожке от начала до конца."
    },
    tag: { en: "Premium", de: "Premium", fr: "Premium", it: "Premium", ru: "Премиум" },
    highlights: ["Red carpet & champagne", "Wedding packages", "Event coordination", "Luxury fleet only"]
  }
];

const destinations = [
  {
    from: { en: "Zurich Airport", de: "Flughafen Zürich", fr: "Aéroport de Zurich", it: "Aeroporto di Zurigo", ru: "Аэропорт Цюриха" },
    to: { en: "Zurich City Centre", de: "Zürcher Stadtzentrum", fr: "Centre-ville de Zurich", it: "Centro città di Zurigo", ru: "Центр Цюриха" },
    distance: 12, discount: 10
  },
  {
    from: { en: "Zurich Airport", de: "Flughafen Zürich", fr: "Aéroport de Zurich", it: "Aeroporto di Zurigo", ru: "Аэропорт Цюриха" },
    to: { en: "Bern", de: "Bern", fr: "Berne", it: "Berna", ru: "Берн" },
    distance: 125
  },
  {
    from: { en: "Zurich Airport", de: "Flughafen Zürich", fr: "Aéroport de Zurich", it: "Aeroporto di Zurigo", ru: "Аэропорт Цюриха" },
    to: { en: "Basel", de: "Basel", fr: "Bâle", it: "Basilea", ru: "Базель" },
    distance: 87, discount: 15
  },
  {
    from: { en: "Zurich City Centre", de: "Zürcher Stadtzentrum", fr: "Centre-ville de Zurich", it: "Centro città di Zurigo", ru: "Центр Цюриха" },
    to: { en: "Lucerne", de: "Luzern", fr: "Lucerne", it: "Lucerna", ru: "Люцерн" },
    distance: 52
  },
  {
    from: { en: "Zurich Airport", de: "Flughafen Zürich", fr: "Aéroport de Zurich", it: "Aeroporto di Zurigo", ru: "Аэропорт Цюриха" },
    to: { en: "St. Gallen", de: "St. Gallen", fr: "Saint-Gall", it: "San Gallo", ru: "Санкт-Галлен" },
    distance: 85, discount: 5
  },
  {
    from: { en: "Zurich City Centre", de: "Zürcher Stadtzentrum", fr: "Centre-ville de Zurich", it: "Centro città di Zurigo", ru: "Центр Цюриха" },
    to: { en: "Interlaken", de: "Interlaken", fr: "Interlaken", it: "Interlaken", ru: "Интерлакен" },
    distance: 120
  }
];

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsert = (key: string, value: any) =>
    prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

  await upsert("fleet", fleet);
  console.log("✅ Fleet updated with 5-language translations");

  await upsert("services", services);
  console.log("✅ Services updated with 5-language translations");

  await upsert("destinations", destinations);
  console.log("✅ Destinations updated with 5-language translations");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
