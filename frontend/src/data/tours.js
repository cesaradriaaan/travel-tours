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
      "https://images.pexels.com/photos/31533418/pexels-photo-31533418.jpeg?_gl=1*pojdxg*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDM2MTkkajUxJGwwJGgw",
      "https://images.pexels.com/photos/38986251/pexels-photo-38986251.jpeg?_gl=1*mhldsb*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5MzY5MDEkbzEkZzEkdDE3ODg5MzcxMTYkajM3JGwwJGgw",
      "https://images.pexels.com/photos/35646946/pexels-photo-35646946.jpeg?_gl=1*10515a5*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5MzY5MDEkbzEkZzEkdDE3ODg5MzcxNjgkajU0JGwwJGgw",
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
      "https://i.pinimg.com/1200x/d0/c9/1a/d0c91af0bc467be04ced0aabe291b8c7.jpg",
      "https://images.pexels.com/photos/9639922/pexels-photo-9639922.jpeg?_gl=1*8sj5t7*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDE3MzEkajQ3JGwwJGgw",
      "https://images.pexels.com/photos/16654512/pexels-photo-16654512.jpeg?_gl=1*15qnzg7*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDAyNzgkajM2JGwwJGgw",
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
      "https://images.pexels.com/photos/38370423/pexels-photo-38370423.jpeg?_gl=1*j1msbh*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDE1NjIkajkkbDAkaDA.",
      "https://plus.unsplash.com/premium_photo-1672510003630-18d2535419ef?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.pexels.com/photos/31337963/pexels-photo-31337963.jpeg?_gl=1*1fw2o3u*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDE0NzQkajE0JGwwJGgw",
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
      "https://images.pexels.com/photos/32091983/pexels-photo-32091983.jpeg?_gl=1*1ka8p4i*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDMxNTMkajU2JGwwJGgw",
      "https://images.pexels.com/photos/8086901/pexels-photo-8086901.jpeg?_gl=1*9meqwn*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDMwMjgkajYwJGwwJGgw",
      "https://images.pexels.com/photos/37879531/pexels-photo-37879531.jpeg?_gl=1*1n8n2g1*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDMxNzAkajM5JGwwJGgw",
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
      "https://images.pexels.com/photos/2532088/pexels-photo-2532088.jpeg?_gl=1*1o4iuuj*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDI3NTAkajQzJGwwJGgw",
      "https://images.pexels.com/photos/37754801/pexels-photo-37754801.jpeg?_gl=1*3ijw9k*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDI4MjkkajU1JGwwJGgw",
      "https://images.pexels.com/photos/9871205/pexels-photo-9871205.jpeg?_gl=1*14h0blp*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDI1NDQkajQzJGwwJGgw",
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
      "https://images.pexels.com/photos/22041232/pexels-photo-22041232.jpeg?_gl=1*eosgkd*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDMyODYkajEzJGwwJGgw",
      "https://images.pexels.com/photos/2467670/pexels-photo-2467670.jpeg?_gl=1*1adv0li*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDMzNjckajE3JGwwJGgw",
      "https://images.pexels.com/photos/13874308/pexels-photo-13874308.jpeg?_gl=1*176yngc*_ga*MzMwMjg2NjE0LjE3ODg5MzY5MDI.*_ga_8JE65Q40S6*czE3ODg5Mzk2OTkkbzIkZzEkdDE3ODg5NDQwNzckajkkbDAkaDA.",
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
