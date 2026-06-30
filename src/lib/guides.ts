export interface Guide {
  slug: string
  name: string
  role: string
  image: string
  years: string
  bio: string
  funFact: string
  specialty: string
  quote: string
}

export const GUIDES: Guide[] = [
  {
    slug: 'erald',
    name: 'Erald',
    role: 'Head River Guide',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    years: '8 years',
    bio: 'Grew up in Përmet, twenty minutes from the put-in point. Erald started as a safety kayaker at 19 and has run the canyon more times than he can count.',
    funFact: 'Can name every rapid on the Përmet stretch — there are 14 — without looking at the river.',
    specialty: 'Reading water levels and adjusting routes on the fly',
    quote: "The river is never the same river twice. That's the whole job.",
  },
  {
    slug: 'luka',
    name: 'Luka',
    role: 'Rafting Guide',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    years: '6 years',
    bio: 'Swiftwater rescue certified and the unofficial camp DJ. Luka came to rafting from competitive swimming and never left the water.',
    funFact: 'Plays guitar around the fire on every overnight trip — bring requests.',
    specialty: 'First-timer groups and nervous paddlers',
    quote: "Most people are more scared before the first rapid than during it.",
  },
  {
    slug: 'megi',
    name: 'Megi',
    role: 'Safety & Rescue Lead',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    years: '5 years',
    bio: 'Former member of the Albanian national kayak team. Megi designs and leads every safety briefing our guests get before launch.',
    funFact: 'Once paddled the full 272km of the Vjosa solo over six days.',
    specialty: 'Swiftwater rescue and risk assessment',
    quote: "Good safety prep means nobody notices it happened.",
  },
  {
    slug: 'klausjo',
    name: 'Klausjo',
    role: 'Photography Guide',
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    years: '4 years',
    bio: 'Shoots every trip from a support kayak and edits the gallery the same evening. Studied photography in Tirana before moving to Përmet full-time.',
    funFact: 'Has a personal archive of over 40,000 river photos.',
    specialty: 'Action photography from the water',
    quote: "The best shot is always the one right before someone falls in.",
  },
  {
    slug: 'sara',
    name: 'Sara',
    role: 'Kayak Instructor',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    years: '7 years',
    bio: 'Teaches first-timers to roll a kayak in a single afternoon. Sara also coaches the youth paddling club in Përmet on weekends.',
    funFact: 'Taught her grandmother to kayak at age 68.',
    specialty: 'One-on-one kayak coaching',
    quote: "Anyone can learn this. It just takes one good fall to stop being afraid of it.",
  },
]
