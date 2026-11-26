/* ------------------------------------------------------------------
   MS-CAR: site content. Everything client-specific lives here.
------------------------------------------------------------------ */
window.SITE = {
  name: "MS-CAR",
  whatsapp: "8801711363397",          // assumed same as phone: confirm
  phoneDisplay: "+880 1711-363397",
  phoneTel: "+8801711363397",
  email: "mscarscenter75@gmail.com",
  website: "mscarcenter.com",
  address: "House #85, Road #07, Block H, Banani, Dhaka 1213",
  addressNote: "Beside Golden Tulip Hotel, Banani",
  // Matches their Google Maps listing ("M S cars center"), so the map shows a pin
  mapQuery: "M S cars center, Block-H, House-85 Road No.7, Dhaka 1213",
  hours: "Sat–Thu 10:00–20:00 · Fri 15:00–20:00", // TODO: confirm
  facebook: "https://www.facebook.com/share/19pnb3vHr9/",
  financing: "Financing available up to 70%",
};

/* ------------------------------------------------------------------
   CARS
   id       → URL: car.html?id=<id>
   status   → "Brand new" | "Reconditioned" | "Pre-owned"
   price    → BDT (0 = "Contact for price")
   gallery  → slug (assets/img/cars/web/<slug>-800/1600.webp)
              or a path (studio cut-outs etc.)
   specs    → shown in the specification table (only what the client gave)
------------------------------------------------------------------ */
window.CARS = [
  {
    id: "toyota-gr-supra-mk5-2019",
    name: "Toyota GR Supra MK5", make: "Toyota", year: 2019,
    status: "Reconditioned", price: 11700000, negotiable: true,
    card: "350 HP · Stage 2+ · Auction grade 5",
    quick: { mileage: "12,600 km", engine: "2,000 cc turbo", fuel: "Octane (95 RON)", power: "350 HP" },
    intro: "The iconic Toyota GR Supra MK5, where aggressive design meets pure performance. Built for speed, style and true driving excitement.",
    notes: [
      "Never run on Bangladeshi octane: 95 RON only since it arrived in Bangladesh.",
      "Japan auction grade 5.",
    ],
    specs: {
      "Make": "Toyota", "Model": "GR Supra MK5", "Manufacturing year": "2019", "Condition": "Reconditioned",
      "Mileage": "12,600 km", "Engine": "2,000 cc turbo", "Power": "350 HP (250 HP stock)", "Torque": "500 Nm (400 Nm stock)",
      "Exterior": "Black (satin PPF)", "Body style": "Coupé", "Auction grade": "5",
    },
    features: {
      "Performance upgrades": [
        "ECU tune Stage 2 PLUS with pops, bangs and flames", "RK titanium single-exit track-spec exhaust",
        "Fi Exhaust catless downpipe", "ARMASPEED carbon-fibre intake",
        "RAYS forged TE37SL Black Edition III (50th anniversary)", "Street Hunter V2 spoiler",
        "Advan Neova tyres", "HKS Super Fire Racing iridium spark plugs",
      ],
      "Comfort & convenience": ["Power seats", "Heated seats", "Rear-view camera", "Parking sensors", "Dual-zone climate control"],
    },
    gallery: ["toyota-supra-2019-1", "toyota-supra-2019-2", "assets/img/cutouts/toyota-supra-2019.webp"],
  },
  {
    id: "range-rover-p400-autobiography-2021",
    name: "Range Rover P400 Autobiography", make: "Land Rover", year: 2021,
    status: "Pre-owned", price: 39000000, negotiable: true,
    card: "Comfort+ · 8,000 km · Gloss Black",
    quick: { mileage: "8,000 km", engine: "3,000 cc", fuel: "Octane", reg: "2021" },
    intro: "Range Rover P400 Autobiography with a refined 3,000 cc engine delivering smooth performance and unmatched luxury. Like a brand-new unit: not just an SUV, a lifestyle statement for city drives and long journeys alike.",
    notes: [],
    specs: {
      "Make": "Land Rover", "Model": "Range Rover P400 Autobiography", "Manufacturing year": "2021", "Registration year": "2021",
      "Condition": "Pre-owned", "Mileage": "8,000 km", "Engine": "3,000 cc", "Fuel": "Octane", "Package": "Comfort+", "Exterior": "Gloss Black",
    },
    features: {
      "Highlights": ["Panoramic sunroof", "21\" OEM rims with run-flat tyres", "Meridian premium surround sound", "360° camera", "Head-up display"],
      "Comfort": ["All-way massage seats", "All-way memory seats", "Reclining rear passenger seats", "Ambient lighting", "Auto-deployable footstep"],
      "Convenience": ["Multifunction steering wheel", "Adjustable driving modes", "Dynamic LED headlamps", "Auto-dimming rear-view mirror",
                      "Centre console controller", "Touch-emblem power tailgate", "Tyre pressure monitor", "All-round parking sensors"],
    },
    gallery: ["range-rover-2021-1", "range-rover-2021-2", "range-rover-2021-in-1", "range-rover-2021-in-2",
              "range-rover-2021-in-3", "range-rover-2021-in-4", "range-rover-2021-in-5"],
  },
  {
    id: "toyota-land-cruiser-250-2024",
    name: "Toyota Land Cruiser 250", make: "Toyota", year: 2024,
    status: "Pre-owned", price: 23000000, negotiable: true, negotiableNote: "Slightly negotiable",
    card: "Only 1,000 km · Full-time 4WD · Pearl",
    quick: { mileage: "1,000 km", engine: "2,700 cc petrol", fuel: "Petrol", reg: "Oct 2026" },
    intro: "The all-new Toyota Land Cruiser 250: iconic Land Cruiser heritage, powerful petrol performance, premium comfort and advanced technology.",
    notes: [],
    specs: {
      "Make": "Toyota", "Model": "Land Cruiser 250", "Manufacturing year": "2024", "Registration": "October 2026", "Condition": "Pre-owned",
      "Mileage": "1,000 km", "Engine": "2,700 cc 4-cylinder petrol", "Power": "163 HP", "Torque": "430 Nm",
      "Transmission": "6-speed automatic", "Drive": "Full-time 4WD", "Exterior": "Pearl", "Platform": "TNGA-F ladder frame",
    },
    features: {
      "Technology": ["12.3\" infotainment touchscreen", "12.3\" digital instrument cluster", "Wireless Apple CarPlay & Android Auto",
                     "Wireless phone charging", "USB-C charging front & rear", "360° surround-view camera"],
      "Comfort": ["Sunroof", "Black leather seats with front ventilation", "Heated multimedia steering wheel"],
      "Safety (Toyota Safety Sense 3.0)": ["Pre-Collision System", "Dynamic Radar Cruise Control", "Lane Tracing Assist", "Blind Spot Monitor"],
      "Capability": ["Advanced 4WD with multi-terrain driving", "Signature LED headlamps", "Iconic boxy, rugged design"],
    },
    gallery: ["toyota-lc250-1"],
  },
  {
    id: "bmw-x7-xdrive40i-2023",
    name: "BMW X7 xDrive40i", make: "BMW", year: 2023,
    status: "Pre-owned", price: 0, // TODO: condition, mileage & price not supplied
    card: "BMW's flagship SUV",
    quick: { engine: "xDrive40i", body: "SUV" },
    intro: "A perfect combination of luxury, performance and commanding presence. The BMW X7 delivers premium comfort, powerful driving dynamics and an unmistakable road presence. Where luxury has no limits.",
    notes: ["Call us for full details on this car."],
    specs: { "Make": "BMW", "Model": "X7 xDrive40i", "Manufacturing year": "2023", "Body style": "SUV" },
    features: {},
    gallery: ["bmw-x7-2023", "assets/img/cutouts/bmw-x7-2023.webp"],
  },
  {
    id: "bmw-x7-m-sport-2022",
    name: "BMW X7 M Sport", make: "BMW", year: 2022,
    status: "Pre-owned", price: 0, // TODO: condition, mileage & price not supplied
    card: "M Sport · BMW's flagship SUV",
    quick: { engine: "M Sport", body: "SUV" },
    intro: "Bold design, commanding road presence, exceptional comfort and the prestige of BMW's flagship SUV line-up.",
    notes: ["Call us for full details on this car."],
    specs: { "Make": "BMW", "Model": "X7 M Sport", "Manufacturing year": "2022", "Body style": "SUV" },
    features: {},
    gallery: ["bmw-x7-msport-2022"],
  },
  {
    id: "bmw-530e-2020",
    name: "BMW 530e", make: "BMW", year: 2020,
    status: "Pre-owned", price: 10900000, negotiable: true,
    card: "Plug-in hybrid · 8,000 km · Tan leather",
    quick: { mileage: "8,000 km", engine: "2,000 cc PHEV", fuel: "Plug-in hybrid", reg: "2022" },
    intro: "The BMW 5 Series has long been synonymous with luxury, performance and innovative technology. This 2020 530e is in excellent condition with extremely low mileage: carefully maintained, close to new and ready for immediate transfer.",
    notes: [],
    specs: {
      "Make": "BMW", "Model": "530e", "Manufacturing year": "2020", "Registration year": "2022", "Condition": "Pre-owned",
      "Mileage": "8,000 km", "Engine": "2,000 cc plug-in hybrid", "Transmission": "8-speed automatic",
      "Exterior": "Blue", "Interior": "Tan leather",
    },
    features: {},
    gallery: ["bmw-530e-2020-1", "bmw-530e-2020-2"],
  },
  {
    id: "mercedes-benz-glb-200-2023",
    name: "Mercedes-Benz GLB 200", make: "Mercedes-Benz", year: 2023,
    status: "Pre-owned", price: 10400000, negotiable: true,
    card: "163 HP · 8,000 km · 5 seats",
    quick: { mileage: "8,000 km", engine: "1,332 cc", fuel: "Premium petrol", reg: "2025" },
    intro: "Mercedes-Benz GLB 200: where luxury meets versatility. Bold design, premium comfort and a drive that feels effortless.",
    notes: [],
    specs: {
      "Make": "Mercedes-Benz", "Model": "GLB 200", "Manufacturing year": "2023", "Registration year": "2025", "Condition": "Pre-owned",
      "Mileage": "8,000 km", "Engine": "4-cylinder, 1,332 cc", "Fuel": "Premium petrol", "Power": "163 HP", "Torque": "250 Nm",
      "Transmission": "Automatic", "Exterior": "Satin Metallic Blue", "Seats": "5",
    },
    features: {
      "Comfort & convenience": [
        "Comfort suspension", "DYNAMIC SELECT driving modes (Eco, Comfort, Sport, Individual)", "THERMOTRONIC two-zone climate control",
        "KEYLESS-GO start", "Cruise control with limiter", "Nappa leather multifunction sports steering wheel",
        "ARTICO / DINAMICA upholstery, black", "ECO start/stop",
      ],
      "Safety": [
        "Active Brake Assist", "Active Lane Keeping Assist", "Speed Limit Assist", "ESP with ASR", "ABS with Brake Assist",
        "Brake Assist with HOLD", "Front, side & window airbags", "Tyre pressure monitoring",
      ],
      "Lighting": ["High-Performance LED headlamps with LED DRLs", "Automatic headlamps", "LED third brake light"],
    },
    gallery: ["mercedes-glb200-2023-1", "mercedes-glb200-2023-2", "assets/img/cutouts/mercedes-glb-200-2023.webp"],
  },
  {
    id: "toyota-alphard-executive-lounge-2022",
    name: "Toyota Alphard Executive Lounge", make: "Toyota", year: 2022,
    status: "Pre-owned", price: 9800000, negotiable: true, negotiableNote: "Slightly negotiable",
    card: "Hybrid · Executive Lounge · 34,000 km",
    quick: { mileage: "34,000 km", engine: "2,500 cc hybrid", fuel: "Octane / hybrid", reg: "2022" },
    intro: "The perfect blend of elegance, comfort and sophistication. A premium MPV for those who appreciate first-class comfort, a luxurious interior and an exceptional driving experience.",
    notes: [],
    specs: {
      "Make": "Toyota", "Model": "Alphard", "Package": "Executive Lounge", "Manufacturing year": "2022", "Registration year": "2022",
      "Condition": "Pre-owned", "Mileage": "34,000 km", "Engine": "2,500 cc", "Fuel": "Octane / hybrid", "Power": "185 HP @ 5,000 rpm",
      "Exterior": "Pearl", "Interior": "Premium beige leather, silver wood trim", "Wheels": "17\" OEM Toyota",
    },
    features: {
      "Rear lounge": ["Business-class rear seats with leg rests", "All-way power rear seats", "Heated & cooled passenger seats", "Rear A/C with controller"],
      "Comfort": ["Sunroof & moonroof", "JBL sound system", "All-way power front seats", "Heated front seats", "Memory seat package", "Ambient lighting"],
      "Convenience & safety": ["Surround-view cameras", "All-round parking sensors", "Smart entry & start", "Hands-free access",
                               "Adjustable driving modes", "Auto-dimming mirrors", "Tyre pressure monitor", "LED headlamps with DRL"],
    },
    gallery: ["toyota-alphard-2022-1", "assets/img/cutouts/toyota-alphard-2020.webp"],
  },
];

window.BRANDS = [ // logo files in assets/img/brands/<slug>.svg; w = display width in px
  { name: "Toyota", slug: "toyota", w: 64 },        { name: "Lexus", slug: "lexus", w: 150 },
  { name: "Mercedes-Benz", slug: "mercedes", w: 52 }, { name: "BMW", slug: "bmw", w: 52 },
  { name: "Land Rover", slug: "landrover", w: 90 },  { name: "Porsche", slug: "porsche", w: 42 },
  { name: "Audi", slug: "audi", w: 100 },            { name: "Honda", slug: "honda", w: 56 },
  { name: "Nissan", slug: "nissan", w: 60 },         { name: "Mitsubishi", slug: "mitsubishi", w: 52 },
  { name: "Mazda", slug: "mazda", w: 62 },           { name: "Hyundai", slug: "hyundai", w: 76 },
  { name: "Volvo", slug: "volvo", w: 52 },           { name: "Jaguar", slug: "jaguar", w: 100 },
  { name: "MG", slug: "mg", w: 52 },                 { name: "BYD", slug: "byd", w: 110 },
  { name: "Kia", slug: "kia", w: 80 },               { name: "Volkswagen", slug: "volkswagen", w: 52 },
  { name: "Subaru", slug: "subaru", w: 76 },         { name: "Suzuki", slug: "suzuki", w: 48 },
];

/* Social grid tiles. url: link to the Facebook post (empty = page link). */
window.SOCIAL = [ // TODO: add direct post/reel links
  { thumb: "assets/img/social-1.webp", url: "", video: true, alt: "GR Supra instrument cluster" },
  { thumb: "assets/img/social-2.webp", url: "", video: true, alt: "Aerial shot of a Land Cruiser convoy" },
  { thumb: "assets/img/social-3.webp", url: "", video: true, alt: "GR Supra exhaust detail" },
  { thumb: "assets/img/social-4.webp", url: "", video: true, alt: "Land Cruiser on a Dhaka flyover at night" },
  { thumb: "assets/img/social-5.webp", url: "", video: true, alt: "GR Supra bucket seats" },
  { thumb: "assets/img/social-6.webp", url: "", video: true, alt: "Land Cruiser lineup" },
];
