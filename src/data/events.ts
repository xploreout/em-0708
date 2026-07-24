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
  note?: string
  alert?: string
}

export const upcomingEvents: Event[] = [
  {
    id: 1,
    title: 'Sunday Worship Service',
    date: 'Every Sunday',
    time: '11:00am – 12:30pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'We warmly invite you to join us for Sunday worship. Come experience a time of praise, a meaningful message, and genuine community. No matter where you are in your journey, you are welcome here—we look forward to seeing you!',
    image: './images/worship1.jpeg',
    note: 'English translation available',
  },
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
    title: 'Salt n Light (SnL) ',
    date: '1st & 3rd Fridays, August',
    time: '7:30pm – 9:15pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      ' Our fellowship consists of sharing live with testimonies, prayers and study the bible. We are studying the book of Philippians, a letter from apostle Paul on joy, unity and living as citizens of heaven. ',
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
    title: 'Sunday Luncheon Fellowship',
    date: 'Every Sunday',
    time: '12:30pm – 1:30pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'Stick around after service and share a meal and fellowship with us. The meals are catered from local restaurants and serve with love by our volunteers!  Everyone is welcome to join, free for first time visitors.',
    image:
      'https://images.pexels.com/photos/14164040/pexels-photo-14164040.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
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
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      "This summer, we're excited to invite children to join our Summer Kids Fellowship, a fun and meaningful time designed to help children grow in faith, build friendships, and enjoy a safe, joyful community. ",
    image: '',
    video:
      'https://res.cloudinary.com/dz2zqnf2q/video/upload/video/fridaykids.mp4',
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
