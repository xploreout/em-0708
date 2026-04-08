export interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  mapUrl?: string
  description: string
  image: string
  registrationUrl?: string
  link?: string
  video?: string
}

export const upcomingEvents: Event[] = [
 
  
  {
    id: 3,
    title: 'Youth Sunday School',
    date: 'Every Sunday',
    time: '11:00am – 12:15pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'Every Sunday, we welcome students in grades 6–12 to join our Sunday School class! We will explore the Bible together, discuss relevant topics, and grow in faith step by step.',
    image: './images/IMG_5440.jpg',
  },
  {
    id: 4,
    title: 'Salt n Light (SnL) Fellowship',
    date: 'Fridays, April 10th & 17th',
    time: '7:30pm – 9:15pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'We started a video series on "Basics of Faith" by Life Church Open Network. Each session includes a short video and group discussion. Join as we grow spiritually together!',
    image:
      'https://images.pexels.com/photos/5206051/pexels-photo-5206051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    link: '/resources/basicoffaith',
  },
  {
    id: 5,
    title: 'Youth Friday Night Fellowship',
    date: '1st, 2nd & 3rd Fridays',
    time: '7:30pm – 9:15pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'A fun and welcoming space for students in grades 6–12 to hang out, strengthen faith, and build meaningful friendships through activities, Bible message, and prayer.',
    image: './images/cny.jpg',
  },
  {
    id: 6,
    title: 'Worship & Baptism Celebration',
    date: 'April 19 Sunday',
    time: '11:00am – 12:30pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'Come join us for a special Sunday worship and celebration opportunity for those who have committed their lives to Jesus Christ.',
    image: './images/baptism.jpg',
  },
  {
    id: 7,
    title: 'April Volunteering & Lunch Outing',
    date: 'April 11th, 2026',
    time: '9:50am – Noon',
    location: 'TBD',
    mapUrl:
      '',
    description:
      'Join us for a cleanup along the Chattahoochee River. Wear closed-toed shoes and bring a reusable water bottle. All ages 10+ welcome. Optional lunch after!',
    image: './images/river.jpg',
    registrationUrl:
      '',
  },
  {
    id: 8,
    title: 'April Buffet Lunch Outing',
    date: 'April 11th, 2026',
    time: '12:30pm – 1:30pm',
    location: 'Golden Corral, 2211 Cobb Pkwy, Smyrna, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2211+Cobb+Pkwy+Smyrna+GA',
    description: 'Simple buffet lunch at Golden Corral. Everyone welcome!',
    image: './images/corral.jpg',
  },
  {
    id: 9,
    title: 'Children Friday Awana',
    date: '1st, 2nd & 3rd Fridays, Sept – May',
    time: '7:30pm – 9:30pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'Children are nurtured to know, love, and serve Jesus through memorizing Bible verses, completing Bible-based activities, playing games, and building friendships.',
    image: './images/IMG_5814.jpg',
  },
  {
    id: 11,
    title: 'Summer Kids',
    date: '1st, 2nd & 3rd Fridays, June – August',
    time: '7:30pm – 9:30pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description: "This summer, we're excited to invite children to join our Summer Kids Fellowship, a fun and meaningful time designed to help children grow in faith, build friendships, and enjoy a safe, joyful community. ",
    image: '',
    video: '/images/fridaykids.mp4',
  },
  {
    id: 10,
    title: 'Children Sunday School',
    date: 'Every Sunday',
    time: '11:00am – 12:15pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'Every Sunday, children join our Sunday School class for engaging and fun Bible learning experiences focused on knowing, loving and serving Jesus.',
    image: './images/ch.jpg',
  },
]
