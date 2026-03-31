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
}

export const upcomingEvents: Event[] = [
  {
    id: 1,
    title: 'Good Friday Worship Night',
    date: 'April 3rd, 2026',
    time: '7:30pm – 9:00pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
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
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
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
      'Starting a video series on "Basics of Faith" by Life Church Open Network. Each session includes a short video and group discussion. Join as we grow spiritually together!',
    image:
      'https://images.pexels.com/photos/5206051/pexels-photo-5206051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
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
    date: 'April 12 Sunday',
    time: '11:00am – 12:30pm',
    location: 'SDA Church, Duluth, GA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2965+Duluth+Hwy+Duluth+GA+30096',
    description:
      'Come join us for a special Sunday worship and celebration opportunity for those who have committed their lives to Jesus Christ.',
    image:
      'https://images.pexels.com/photos/34594548/pexels-photo-34594548.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  },
  {
    id: 7,
    title: 'April Volunteering & Lunch Outing',
    date: 'April 11th, 2026',
    time: '9:50am – Noon',
    location: 'Powers Island Unit, Chattahoochee River NRA',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=5450+Interstate+N+Pkwy+Sandy+Springs+GA+30328',
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
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=2211+Cobb+Pkwy+Smyrna+GA',
    description: 'Simple buffet lunch at Golden Corral. Everyone welcome!',
    image: './images/corral.jpg',
  },
]
