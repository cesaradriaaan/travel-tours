// Mock tour data. In Phase 2 this file is replaced by real API calls,
// but every consumer of this data (components/pages) expects this exact
// shape, so the swap should be a drop-in.

export const tours = [
  {
    id: "el-nido-island-hop",
    title: "El Nido Island Hopping & Lagoons",
    region: "Palawan",
    tags: ["Islands", "Snorkeling", "Adventure"],
    durationDays: 3,
    price: 8500,
    images: [
      "https://images.unsplash.com/photo-1695051702427-1c24ce3682e7?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1746260948448-d741c5838c16?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1697135756100-7b610c8fe92e?auto=format&fit=crop&w=1800&q=88",
    ],
    summary:
      "Cross lagoons by kayak, snorkel over coral gardens, and island-hop through El Nido's limestone cliffs.",
    highlights: [
      "Big & Small Lagoon kayaking",
      "Secret Beach snorkeling",
      "Sunset at Las Cabanas",
    ],
    sampleItinerary: [
      { day: 1, title: "Arrival & Town", description: "Settle in, sunset at Las Cabanas Beach." },
      { day: 2, title: "Tour A: Lagoons", description: "Big Lagoon, Small Lagoon, Secret Lagoon, Shimizu Island." },
      { day: 3, title: "Tour C: Outer Islands", description: "Hidden Beach, Matinloc Shrine, Secret Beach." },
    ],
  },
  {
    id: "bohol-countryside",
    title: "Bohol Countryside & Chocolate Hills",
    region: "Bohol",
    tags: ["Culture", "Nature", "Family-friendly"],
    durationDays: 2,
    price: 6200,
    images: [
      "https://images.unsplash.com/photo-1728042743743-e2a2abf35c47?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1591506557489-e8ca407063e7?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1591506578484-d496b18a6908?auto=format&fit=crop&w=1800&q=88",
    ],
    summary:
      "Meet tarsiers, cruise the Loboc River, and watch the Chocolate Hills turn gold at sunset.",
    highlights: [
      "Tarsier Sanctuary visit",
      "Loboc River lunch cruise",
      "Chocolate Hills viewpoint",
    ],
    sampleItinerary: [
      { day: 1, title: "Loboc & Tarsiers", description: "Tarsier Sanctuary, Loboc River cruise, hanging bridge." },
      { day: 2, title: "Chocolate Hills", description: "Chocolate Hills viewpoint, Bilar man-made forest." },
    ],
  },
  {
    id: "siargao-surf",
    title: "Siargao Surf & Lagoon Escape",
    region: "Surigao del Norte",
    tags: ["Surfing", "Islands", "Adventure"],
    durationDays: 4,
    price: 11200,
    images: [
      "https://images.unsplash.com/photo-1565565915331-293fd8113954?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1601000234047-d9308ea1ed51?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1565340076637-825894a74ca6?auto=format&fit=crop&w=1800&q=88",
    ],
    summary:
      "Surf lessons at Cloud 9, island-hop to Naked Island, and swim in Sugba Lagoon's turquoise water.",
    highlights: [
      "Cloud 9 surf lesson",
      "Naked & Daku Island hop",
      "Sugba Lagoon paddleboarding",
    ],
    sampleItinerary: [
      { day: 1, title: "Arrival & Cloud 9", description: "Check-in, sunset at Cloud 9 boardwalk." },
      { day: 2, title: "Island Hopping", description: "Naked Island, Daku Island, Guyam Island." },
      { day: 3, title: "Sugba Lagoon", description: "Paddleboarding and cliff jumping at the lagoon." },
      { day: 4, title: "Surf Lesson & Departure", description: "Morning surf lesson, free time, departure." },
    ],
  },
  {
    id: "banaue-batad",
    title: "Banaue & Batad Rice Terraces Trek",
    region: "Ifugao",
    tags: ["Culture", "Trekking", "Heritage"],
    durationDays: 3,
    price: 9800,
    images: [
      "https://images.unsplash.com/photo-1663265159301-b9be59237e5f?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1714746093593-a4e9b4f72b6b?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1714746093239-4277ac0f1a48?auto=format&fit=crop&w=1800&q=88",
    ],
    summary:
      "Trek through the UNESCO-listed Batad rice terraces and stay in a traditional Ifugao village.",
    highlights: [
      "Batad amphitheater terraces",
      "Tappiya Falls trek",
      "Ifugao village homestay",
    ],
    sampleItinerary: [
      { day: 1, title: "Travel to Banaue", description: "Overnight travel, arrival and rest." },
      { day: 2, title: "Batad Trek", description: "Trek to Batad viewpoint and Tappiya Falls." },
      { day: 3, title: "Village & Departure", description: "Morning village walk, travel back." },
    ],
  },
  {
    id: "vigan-heritage",
    title: "Vigan Heritage Walk",
    region: "Ilocos Sur",
    tags: ["Heritage", "Culture", "Family-friendly"],
    durationDays: 2,
    price: 5400,
    images: [
      "https://images.unsplash.com/photo-1587659584959-fb5849fb6d26?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1648025125660-aaae6b420d25?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1589812635389-bba67781b7dd?auto=format&fit=crop&w=1800&q=88",
    ],
    summary:
      "Walk the cobblestone streets of Calle Crisologo and ride a kalesa through Spanish-era Vigan.",
    highlights: [
      "Calle Crisologo at golden hour",
      "Kalesa (horse-cart) city tour",
      "Pottery-making at Pagburnayan",
    ],
    sampleItinerary: [
      { day: 1, title: "Old Town", description: "Calle Crisologo, Vigan Cathedral, kalesa ride." },
      { day: 2, title: "Crafts & Departure", description: "Pagburnayan pottery, souvenir shopping." },
    ],
  },
  {
    id: "coron-wreck-diving",
    title: "Coron Wreck Diving & Kayangan Lake",
    region: "Palawan",
    tags: ["Diving", "Islands", "Adventure"],
    durationDays: 3,
    price: 13500,
    images: [
      "https://images.unsplash.com/photo-1637401637454-dc64f49a38ce?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1690462758002-d976200d4ada?auto=format&fit=crop&w=1800&q=88",
      "https://images.unsplash.com/photo-1697558647054-e857470e2998?auto=format&fit=crop&w=1800&q=88",
    ],
    summary:
      "Dive WWII Japanese shipwrecks and swim in the Philippines' cleanest lake, Kayangan.",
    highlights: [
      "WWII wreck diving",
      "Kayangan Lake swim",
      "Twin Lagoon",
    ],
    sampleItinerary: [
      { day: 1, title: "Arrival", description: "Check-in, Maquinit hot springs in the evening." },
      { day: 2, title: "Wreck Diving", description: "Two-tank wreck dive for certified divers." },
      { day: 3, title: "Island Tour", description: "Kayangan Lake, Twin Lagoon, Barracuda Lake." },
    ],
  },
];

export function getTourById(id) {
  return tours.find((t) => t.id === id);
}
