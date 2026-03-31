export interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  description: string
  image: string
  registrationUrl?: string
}

export const upcomingEvents: Event[] = [
  {
    id: 1,
    title: 'Good Friday Worship Night',
    date: 'April 3rd, 2026',
    time: '7:30pm – 9:00pm',
    location: 'SDA Church, Duluth, GA',
    description:
      'A special worship night with music, scripture reading, and reflection to remember the crucifixion of Jesus Christ and the hope we have in Him.',
    image:
      'https://images.pexels.com/photos/1615776/pexels-photo-1615776.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Easter Sunday Celebration',
    date: 'April 5th, 2026',
    time: '11:00am – 12:15pm',
    location: 'SDA Church, Duluth, GA',
    description:
      "Celebrate the resurrection of Jesus Christ with a special worship service, scripture, a message of hope, and children's activities.",
    image: './images/risen2.jpg',
  },
  {
    id: 3,
    title: 'Youth Sunday School',
    date: 'Every Sunday',
    time: '11:00am – 12:15pm',
    location: 'SDA Church, Duluth, GA',
    description:
      'Every Sunday, we welcome students in grades 6–12 to join our Sunday School class! We will explore the Bible together, discuss relevant topics, and grow in faith step by step.',
    image: './images/IMG_5440.jpg',
  },
  {
    id: 4,
    title: 'Salt n Light (SnL) Fellowship',
    date: '1st & 3rd Fridays',
    time: '7:30pm – 9:15pm',
    location: 'SDA Church, Duluth, GA',
    description:
      'Starting a video series on "Basics of Faith" by Life Church Open Network. Each session includes a short video and group discussion. Come grow spiritually together!',
    image:
      'https://images.pexels.com/photos/5206051/pexels-photo-5206051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
  {
    id: 5,
    title: 'Youth Friday Night Fellowship',
    date: '1st, 2nd & 3rd Fridays',
    time: '7:30pm – 9:15pm',
    location: 'SDA Church, Duluth, GA',
    description:
      'A fun and welcoming space for students in grades 6–12 to hang out, strengthen faith, and build meaningful friendships through activities, Bible message, and prayer.',
    image: './images/cny.jpg',
  },
  {
    id: 7,
    title: 'April Volunteering & Lunch Outing',
    date: 'April 11th, 2026',
    time: '10:00am – Noon',
    location: 'Powers Island Unit, Chattahoochee River NRA',
    description:
      'Join us for a cleanup along the Chattahoochee River. Wear closed-toed shoes and bring a reusable water bottle. All ages 10+ welcome. Optional lunch after!',
    image: './images/river.jpg',
    registrationUrl:
      'https://chattahoocheeparks.app.neoncrm.com/nx/portal/neonevents/events?path=%2Fportal%2Fevents%2F36703',
  },
  {
    id: 8,
    title: 'April Buffet Lunch Outing',
    date: 'April 11th, 2026',
    time: '12:30pm – 1:30pm',
    location: 'Golden Corral, 2211 Cobb Pkwy, Smyrna, GA',
    description: 'Simple buffet lunch at Golden Corral. Everyone welcome!',
    image: './images/corral.jpg',
  },
]
