export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categories: string[];
  linecardSection: "components" | "equipment";
  logo?: string;
  logoWidth?: number;
  website: string;
  shopUrl?: string;
  featured: boolean;
};

export const brands: Brand[] = [
  // ── Component Partners ─────────────────────────────────────────────
  {
    id: "stocko",
    name: "Stocko Contact",
    slug: "stocko",
    logo: "/images/Stocko.png",
    description:
      "Stocko Contact is a German manufacturer of crimp contacts, IDC connectors, and connector systems for automotive, white goods, and industrial electronics. Their product range includes push-in terminals, flat connectors, and high-volume precision crimp contacts used by major OEMs across Europe.",
    shortDescription: "German precision crimp contacts and connector systems for automotive and industrial OEM.",
    categories: ["connectors", "contacts-terminals"],
    linecardSection: "components",
    website: "https://www.stocko-contact.com/",
    shopUrl: "https://www.stocko-contact.com/en/index.php",
    featured: true,
  },
  {
    id: "deutsch",
    name: "DEUTSCH",
    slug: "deutsch",
    logo: "/images/partners/te-connectivity.svg",
    description:
      "DEUTSCH is TE Connectivity's family of sealed connectors, the global benchmark for harsh-environment electrical connections. The DT, DTM, DTP, and AT series are specified in agriculture, construction, marine, and heavy automotive applications where vibration, moisture, and contamination resistance are critical.",
    shortDescription: "DEUTSCH sealed connectors for harsh-environment and off-highway applications.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "https://www.te.com/en/products/brands/deutsch.html",
    shopUrl: "https://www.te.com/en/products/brands/deutsch.html?tab=pgp-story",
    featured: true,
  },
  {
    id: "te-connectivity",
    name: "TE Connectivity",
    slug: "te-connectivity",
    logo: "/images/partners/te-connectivity.svg",
    description:
      "For more than 80 years, TE has partnered with engineers worldwide to develop connectivity and sensing solutions that make a connected world possible. Their unmatched product portfolio, including the AMPSEAL sealed connector family, enables companies of any size to turn ideas into technologies that transform how the world connects, works, and lives.",
    shortDescription: "TE Connectivity sealed connectors including AMPSEAL for harsh-environment applications.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "https://www.te.com/",
    shopUrl: "https://www.te.com/en/home.html",
    featured: false,
  },
  {
    id: "vogt",
    name: "Vogt AG",
    slug: "vogt",
    logo: "/images/Vogt_logo_3.png",
    description:
      "Vogt AG manufactures a comprehensive range of PCB terminals, soldering tags, turret terminals, and connecting elements for professional electronics assembly. Their products are specified in instrumentation, measurement equipment, audio electronics, and industrial control panels.",
    shortDescription: "High-quality PCB terminals, turret contacts, and soldering tags for professional electronics.",
    categories: ["connectors", "pcb-contacts", "contacts-terminals"],
    linecardSection: "components",
    website: "https://www.vogt.ch/",
    shopUrl: "https://www.vogt.ch/en/shop",
    featured: false,
  },
  {
    id: "cvilux",
    name: "CviLux Corporation",
    slug: "cvilux",
    logo: "/images/Cvilux.png",
    description:
      "CviLux Corporation is a Taiwan-based connector manufacturer specialising in wire-to-board, wire-to-wire, board-to-board, and FFC/FPC connectors. Their products are widely used in LED lighting, industrial electronics, consumer appliances, and HVAC systems.",
    shortDescription: "Wire-to-board, wire-to-wire, and FFC/FPC connectors for electronics and appliances.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "https://www.cvilux.com/",
    shopUrl: "https://www.cvilux.com/product",
    featured: false,
  },
  {
    id: "hongshang",
    name: "Hongshang",
    slug: "hongshang",
    logo: "/images/partners/hongshang.gif",
    logoWidth: 168,
    description:
      "Hongshang manufactures a full range of heat-shrinkable products including standard PE tubing, dual-wall adhesive-lined tubing, breakout boots, end caps, and specialty fluoropolymer and PVDF types for demanding chemical and thermal environments.",
    shortDescription: "Full range of heat-shrinkable tubing, boots, end caps, and specialty high-temperature types.",
    categories: ["heat-shrink"],
    linecardSection: "components",
    website: "https://www.hongshang.com/",
    shopUrl: "https://www.hongshang.com/Products_list/1197913681259880448.html",
    featured: false,
  },
  {
    id: "jdd-tech",
    name: "JDD Tech",
    slug: "jdd-tech",
    logo: "/images/partners/jdd-tech.jpg",
    logoWidth: 180,
    description:
      "JDD Tech develops and manufactures cable-protection products for wire harnesses and industrial installations. Its portfolio includes expandable braided sleeving, self-closing wraps, textile sleeves, corrugated conduit, heat-shrink tubing, high-temperature insulation, and cable-management accessories for automotive, rail, telecom, and heavy-equipment applications.",
    shortDescription: "Braided sleeving, protective wraps, conduit, and heat-shrink products for cable and wire harness protection.",
    categories: ["heat-shrink", "connectors"],
    linecardSection: "components",
    website: "https://www.jddsleeve.com/",
    featured: false,
  },
  {
    id: "htp",
    name: "HTP",
    slug: "htp",
    logo: "/images/htp.jpg",
    description:
      "HTP manufactures circular connectors for industrial automation and fieldbus applications. Their range covers M8, M12 (A, B, C, D, S, T, and X-coded), M23, and 7/8\" connectors, as well as EN 175301-803/DIN 43650 valve connectors and ATEX-certified versions for hazardous locations.",
    shortDescription: "M8, M12 (all codings), M23, and 7/8\" circular connectors for automation and ATEX.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "https://www.webhtp.eu/",
    shopUrl: "https://www.webhtp.eu/ProductCategory/GridPage?_gl=1*j9e6gj*_up*MQ..*_ga*MjA3MzE3OTIzNS4xNzgyNTgwMTU3*_ga_89PXX2558Z*czE3ODI1ODAxNTUkbzEkZzAkdDE3ODI1ODAxNTUkajYwJGwwJGgw",
    featured: true,
  },
  {
    id: "jst",
    name: "JST",
    slug: "jst",
    logo: "/images/partners/jst.gif",
    description:
      "JST is a Japanese manufacturer of precision wire-to-board and wire-to-wire connectors. Their miniature and micro-miniature connector series are the standard for PCB interconnects in consumer electronics, automotive infotainment, and industrial instruments.",
    shortDescription: "Precision wire-to-board and miniature wire-to-wire connectors for electronics and automotive.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "https://www.jst.com/",
    featured: false,
  },
  {
    id: "jve",
    name: "JVE Global",
    slug: "jve",
    logo: "/images/partners/jve.png",
    description:
      "JVE Global supplies a broad range of wiring accessories and cable management components for industrial and commercial installations. Their catalogue includes cable ties, mounting bases, conduit fittings, and wiring duct systems.",
    shortDescription: "Cable management and wiring accessories for industrial and commercial installations.",
    categories: ["connectors", "contacts-terminals"],
    linecardSection: "components",
    website: "https://www.jve.com.tw/home.jsp?lang=en",
    featured: false,
  },
  {
    id: "sherwood",
    name: "Sherwood Connector",
    slug: "sherwood",
    logo: "/images/partners/sherwood-clean.png",
    logoWidth: 180,
    description:
      "Sherwood Connector specialises in connector systems and interconnect solutions for power and signal applications. Their products cover a range of industrial and automotive connector formats designed for reliability in demanding environments.",
    shortDescription: "Connector systems for power and signal applications in industrial and automotive markets.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "http://www.sherwood4u.com.tw",
    featured: false,
  },
  {
    id: "colombo",
    name: "CS Colombo",
    slug: "colombo",
    logo: "/images/partners/colombo-clean.png",
    logoWidth: 96,
    description:
      "CS Colombo Sergio & Figli manufactures industrial electrical connectors and wiring accessories with a focus on durability and ease of assembly. Their products are used in control panels, machinery, and industrial equipment across Europe.",
    shortDescription: "Industrial electrical connectors and wiring accessories for control panels and machinery.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "https://csconnectors.com/en",
    featured: false,
  },
  {
    id: "mikropla",
    name: "MIKROPLA",
    slug: "mikropla",
    logo: "/images/partners/mikropla.svg",
    logoWidth: 180,
    description:
      "MIKROPLA is an Italian connector manufacturer founded in 1968, producing connector and terminal solutions for electronic systems. Their portfolio covers wire-to-board connectors (RAST 5, CD, SPX, CTK, CT5), wire-to-wire connectors, electrical terminals (2.8, 4.8, 6.3 mm series), and eyelets and ferrules. They serve automotive, appliances, HVAC-R, and industrial sectors.",
    shortDescription: "Italian connector manufacturer: wire-to-board, RAST 5, wire-to-wire connectors and electrical terminals.",
    categories: ["connectors"],
    linecardSection: "components",
    website: "https://mikropla.com/",
    featured: false,
  },
  {
    id: "dsg-canusa",
    name: "DSG-Canusa",
    slug: "dsg-canusa",
    logo: "/images/partners/dsg-canusa.png",
    description:
      "DSG-Canusa is a specialist manufacturer of heat-shrink products, cable management, and sealing solutions. Their range covers standard PE heat shrink, adhesive-lined dual-wall tubing, wraparound sleeves for field repairs, and cold-applied gel technologies.",
    shortDescription: "Specialist heat-shrink tubing, dual-wall, wraparound sleeves, and cable sealing solutions.",
    categories: ["heat-shrink"],
    linecardSection: "components",
    website: "https://www.dsgcanusa.com/",
    featured: false,
  },
  {
    id: "schneider-gemsa",
    name: "Schneider & Gemsa",
    slug: "schneider-gemsa",
    logo: "/images/partners/schneider-gemsa.svg",
    logoWidth: 180,
    description:
      "Schneider & Gemsa GmbH is an industrial contract manufacturer specialising in cable assembly, stamped components, plastics technology, and complete electromechanical assemblies. Its integrated production capabilities cover product development, tooling, automated and manual manufacturing, testing, and series production for automotive and industrial customers.",
    shortDescription: "Cable assemblies, stamped and plastic components, tooling, and complete electromechanical assembly manufacturing.",
    categories: ["connectors", "contacts-terminals"],
    linecardSection: "components",
    website: "https://schneider-gemsa.com/en/",
    featured: false,
  },

  // ── Production & Test Equipment Partners ────────────────────────────
  {
    id: "mecal",
    name: "Mecal",
    slug: "mecal",
    logo: "/images/partners/mecal.jpg",
    description:
      "Mecal designs and manufactures automatic wire-processing and crimping machines. Their semi-automatic and fully automatic systems are used for high-volume wire harness production, with integrated quality monitoring, applicator change systems, and pull-force testing options.",
    shortDescription: "Automatic wire-processing and crimping machines for high-volume harness production.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://mecal.net/",
    featured: true,
  },
  {
    id: "zoller-frohlich",
    name: "Zoller + Fröhlich",
    slug: "zoller-frohlich",
    logo: "/images/partners/zoller-frohlich.png",
    description:
      "Zoller + Fröhlich (Z+F) manufactures wire-processing machines including fully automatic cutting and stripping machines, crimp presses, and multi-wire processing centers. Their equipment is used in automotive, aerospace, and industrial wire harness production worldwide.",
    shortDescription: "Wire processing machines: fully automatic cutting, stripping, and crimping press systems.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://www.zofre.de/",
    shopUrl: "https://www.zofre.de/en/",
    featured: true,
  },
  {
    id: "metzner",
    name: "Metzner Maschinenbau",
    slug: "metzner",
    logo: "/images/partners/metzner.png",
    logoWidth: 185,
    description:
      "Metzner Maschinenbau develops automated cutting and processing systems for cable, wire, corrugated tubing, rubber, and plastic profiles. Its solutions cover cutting to length, stripping, slitting, marking, feeding, and fully automated production cells, with both standard machines and application-specific systems.",
    shortDescription: "Automated cutting, stripping, slitting, and processing systems for cable, wire, tubing, rubber, and plastics.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://www.metzner.com/",
    featured: false,
  },
  {
    id: "ramatech",
    name: "Ramatech Systems",
    slug: "ramatech",
    logo: "/images/partners/ramatech.png",
    logoWidth: 190,
    description:
      "Ramatech Systems manufactures machines and automation solutions for cable handling and cable processing. Its portfolio includes cable feeding and pay-off systems, reel and drum storage, rewinding equipment, coiling machines, and cut-and-strip systems that can be combined into complete material-flow solutions.",
    shortDescription: "Cable handling and processing systems for feeding, storage, rewinding, coiling, cutting, and stripping.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://www.ramatech.ch/",
    featured: false,
  },
  {
    id: "wezag",
    name: "Wezag",
    slug: "wezag",
    logo: "/images/partners/wezag-hq.png",
    description:
      "Wezag manufactures professional crimping tools and presses for the cable industry. Their range includes hand tools, pneumatic presses, and interchangeable die systems compatible with major terminal brands, meeting requirements for repeatable, controlled crimping in industrial assembly.",
    shortDescription: "Professional crimping tools, presses, and interchangeable die systems for cable assembly.",
    categories: ["tools", "production-equipment"],
    linecardSection: "equipment",
    website: "https://www.wezag.de/",
    featured: false,
  },
  {
    id: "tekuwa",
    name: "Tekuwa GmbH",
    slug: "tekuwa",
    logo: "/images/partners/tekuwa.png",
    description:
      "Tekuwa GmbH develops and manufactures high-precision cutting and cable processing machines for the cable, wire, tube, and medical industries. Their range includes cutting-to-length machines, combined cutting and stripping systems, jacket removal equipment, automatic feeding and rewinding units, and complete production line configurations. Over 30 years of experience with more than 3,100 machines delivered globally.",
    shortDescription: "High-precision cable cutting, stripping, and processing machines for cable, wire, and tube applications.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://tekuwa.de/en/",
    featured: false,
  },
  {
    id: "mav",
    name: "Mav Prüftechnik",
    slug: "mav",
    logo: "/images/partners/mav-pruftechnik.png",
    logoWidth: 132,
    description:
      "Mav Prüftechnik has been manufacturing pull-force and compression testing machines since 1962. Their manual and motorised test stations measure tensile and compressive forces up to 10,000 N, making them the standard for crimp pull-force verification in cable and harness manufacturing. All devices are developed and produced in Germany and include calibration software.",
    shortDescription: "Crimp pull-force and compression testing machines for quality assurance in cable and harness manufacturing.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://www.mav-germany.de/",
    featured: false,
  },
  {
    id: "ulmer",
    name: "Ulmer GmbH",
    slug: "ulmer",
    logo: "/images/partners/ulmer-hq.gif",
    description:
      "Ulmer GmbH develops and manufactures specialised machinery for the processing and handling of flexible materials including cables, corrugated tubing, and hoses. Their product range covers cutting machines, unwinding and reel-handling systems, winding machines, feeding and withdrawal devices, and stacking units, serving sectors including electric mobility, renewable energy, and hybrid vehicle manufacturing.",
    shortDescription: "Cable and corrugated tube processing machinery: cutting, unwinding, winding, and feeding systems.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://www.ulmer-gmbh.net/",
    featured: false,
  },
  {
    id: "branson",
    name: "Branson",
    slug: "branson",
    // Branson is part of the Emerson group and carries the Emerson brand mark.
    logo: "/images/partners/branson.webp",
    description:
      "Delivering proven performance, unequaled expertise and the broadest technology portfolio for plastic and metal welding and cleaning solutions.",
    shortDescription: "Ultrasonic, laser and vibration welding plus precision cleaning for plastics and metals.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://www.branson.emerson.com/en",
    featured: false,
  },
  {
    id: "feintechnik-rittmeyer",
    name: "Feintechnik Rittmeyer",
    slug: "feintechnik-rittmeyer",
    // Promoted under the "be-ri" brand mark.
    logo: "/images/partners/beri.png",
    description:
      "Feintechnik R. Rittmeyer manufactures wire stripping machines for industrial cable processing under the be-ri brand, including pneumatic, rotating and electric strippers, plus high-precision solutions for coaxial cables.",
    shortDescription: "Pneumatic, rotating and electric wire stripping machines (be-ri) for industrial cable processing.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://rittmeyer-beri.de/en/",
    featured: false,
  },
  {
    id: "junquan",
    name: "Junquan",
    slug: "junquan",
    logo: "/images/partners/junquan.gif",
    description:
      "Junquan Automation designs and manufactures computerized wire cutting and stripping machines, fully automatic terminal crimping machines, numerical-control precision presses, and digital cutting machines. With over twenty years of experience, their high-precision, high-speed equipment is widely used in the electronics and electrical appliance industries.",
    shortDescription: "Computerized wire cutting, stripping, crimping and digital cutting machines for wire processing.",
    categories: ["production-equipment"],
    linecardSection: "equipment",
    website: "https://www.cuttingstripping-machine.com/",
    featured: false,
  },
];

export function getBrandBySlug(slug: string): Brand | undefined { // v2
  return brands.find((b) => b.slug === slug);
}

export const componentPartners = brands.filter((b) => b.linecardSection === "components");
export const equipmentPartners = brands.filter((b) => b.linecardSection === "equipment");
export const featuredBrands = brands.filter((b) => b.featured);
