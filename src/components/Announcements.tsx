import React from 'react';
import { Calendar, MapPin, Users, Clock, Camera, Heart } from 'lucide-react';
import { useState } from 'react';
import EventRegistrationModal from './EventRegistrationModal';

const Announcements = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventCounts, setEventCounts] = useState<{ [key: number]: number }>({
    1: 25,
    2: 18,
    3: 32
  });

  // Heart likes functionality
  const [heartLikes, setHeartLikes] = useState<{ [key: number]: number }>({
    1: 42, 2: 38, 3: 55, 4: 67, 5: 29, 6: 84, 7: 51, 8: 33
  });
  const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());

  const handleHeartClick = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (likedEvents.has(eventId)) {
      return; // Already liked, prevent multiple clicks
    }
    
    setLikedEvents(prev => new Set([...prev, eventId]));
    setHeartLikes(prev => ({
      ...prev,
      [eventId]: (prev[eventId] || 0) + 1
    }));
  };

  const upcomingEvents = [
    // {
    //   id: 1,
    //   title: "English Ministry Open Hosue",
    //   date: "Saturday, August 9",
    //   time: "3:30pm",
    //   location: "Alpharetta, GA",
    //   description: "Join us for a dumpling making and eating fest. Get to know each other. Praise and worship God together. Celebrate the kickoff of the English ministry.",
    //   image: "./images/poster8-9.jpg",
    //   color: "from-blue-400 to-green-400"
    // },
    // {
    //   id: 2,
    //   title: "Ministry Kickoff Celebration",
    //   date: "Sunday, August 10",
    //   time: "11:30am",
    //   location: "Duluth, GA",
    //   description: "Come celebrate a new ministry kickoff with delicious bao-zi and much more. Get to know coworkers and review program materials,from children, youth, and adult ministries. Will you come join us?",
    //   image: "./images/aug10.png",
    //   color: "from-blue-400 to-green-400"
    // },
    {
      id: 2,
      title: "Youth Sunday School",
      date: "Every Sunday",
      time: "11:00am - 12:15pm",
      location: "SDA Church, Duluth, GA",
      description: "Welcome students in grades 6–12 to join our Sunday School class! We will explore the Bible together, discuss relevant topics, and grow in faith step by step. Our Sunday School class is a great place to connect with other students, ask questions about faith, and deepen your relationship with God. Come join us for a fun and meaningful time of learning and fellowship!",
      image: "./images/IMG_5440.jpg",
      color: "from-blue-400 to-green-400"
    },
    
    {
      id: 3,
      title: "Youth Friday Night Fellowship",
      date: "1st, 2nd and 3rd Fridays of the month",
      time: "7:30pm - 9:15pm",
      location: "SDA Church, Duluth, GA",
      description: "Our Friday Night Fellowship is a fun and welcoming space for students in grades 6–12 to hang out, strengthen faith and build meaningful friendships. Each week includes engaging activities, a relevant Bible message and discussion, and a time of prayer to help students grow in their faith and encourage one another!",
      image: "./images/cny.jpg",
      color: "from-green-400 to-blue-400"

      
    },
    {
      id: 4,
      title: "Salt n Light (SnL) Fellowship",
      date: "1st and 3rd Fridays of the month  ",
      time: "7:30pm - 9:15pm",
      location: "SDA Church, Duluth, GA",
      description: "We have finished the book study of 'Purpose Driven Life' and scripture study on the book James. We are starting a video series on 'Basics of Faith' by Life Church Open Network. Each session includes a short video and group discussion. Come join us for fellowship, explore faith and grow spiritually together!",
      image: "https://images.pexels.com/photos/5206051/pexels-photo-5206051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      color: "from-blue-400 to-green-400"
    },
     {
      id: 5,
      title: "Good Friday Worship Night",
      date: "April 3rd, 2026",
      time: "7:30pm - 9:00pm",
      location: "SDA Church, Duluth, GA",
      description: "Join us on Good Friday to remember the cruxfiction of Jesus Christ and what it means for us. We will have a special worship night with music, scripture reading and reflection. Let's come together to reflect on the sacrifice of Jesus and the hope we have in Him!",
      image: "https://images.pexels.com/photos/1615776/pexels-photo-1615776.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop",
      color: "from-green-400 to-blue-400"
    },
    {
      id: 6,
      title: "Easter Sunday Celebration",
      date: "April 5th, 2026",
      time: "11am - 12:15pm",
      location: "SDA Church, Duluth, GA",
      description: "Join us on Easter Sunday to celebrate the resurrection of Jesus Christ! We will have a special worship service, scripture with message of hope along with children activities. Let's come together to rejoice in the victory of Jesus over sin and death and the new life we have in Him!",
      image: "./images/risen2.jpg",
      color: "from-green-400 to-blue-400"
    },
    {
      id: 7,
      title: "April Volunteering and Lunch Outing",
      date: "April 11th, 2026",
      time: "10am - Noon",
      location: "Powers Island Unit, Chattahoochee River National Recreation Area",
      description: "Join us to cleanup at one of the park units along Chattahoochee River National Recreation Area.  We will meet at the parking lot next to the trail map sign. Things to bring/wear: reususable water bottle, closed-toed shoes, and recommended for long sleeve shirt and pants. Welcome all ages 10 and up.  Optional lunch gathering afterwards at a restaurant, details later. Welcome all to join for one or both events!",
      image: "./images/river.jpg",
      color: "from-green-400 to-blue-400"
    },
    // {
    //   id: 6,
    //   title: "Calling Actors / Helpers for CNY Silent Skit",
    //   date: "Rehearsal Dates: 2/6, 2/8, 2/20",
    //   time: "varied times",
    //   location: "SDA Church, Duluth, GA",
    //   description: "Celebrate Chinse New Year with a silent skit performance! The short silent skit will explore the joy of receiving red pockets and the true meaning of joy and redemption. We are looking for actors and helpers to make this event a success. Join us for rehearsals and be part of the fun!",
    //   image: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    //   color: "from-purple-400 to-green-400"
    // }
  ];

  const pastEvents = [
    {
      id: 1,
      title: "Youth Summer Open House",
      date: "August",
      // location: "Club House",
      description: "",
      images: [
          "./images/IMG_0179.jpg",
          "./images/IMG_5482.jpg",
          "./images/IMG_5431.jpg",
          "./images/IMG_5440.jpg",
          
      ],
      
      // attendees: 20
    },
     {
      id: 2,
      title: "Awana Award Ceremony",
      date: "August",
      // location: "Club House",
      description: "",
      images: [
        "./images/IMG_5814.jpg",
        "./images/awanacollage.png",
          "./images/IMG_5815.jpg",
          "./images/awanayouth.jpg",
      ]
      
      // attendees: 20
    },
     {
      id: 3,
      title: "English Ministry Open House",
      date: "August",
      // location: "Club House",
      description: "",
      images: [
          "./images/pic2.JPG",
          "./images/pic3.JPG",
          "./images/pic4.JPG",
          "./images/pic5.JPG"
      ],
      
      // attendees: 20
    },
  ];

  const handleEventInterest = (event: any) => {
    // setSelectedEvent(event);
    // setIsModalOpen(true);
  };

  const handleRegistration = (eventIds: number[], contactInfo: any) => {
    // Update the interested count for each selected event
    setEventCounts(prev => {
      const updated = { ...prev };
      eventIds.forEach(id => {
        updated[id] = (updated[id] || 0) + 1;
      });
      return updated;
    });

  };

  return (
    <section id="announcements" className="py-20 bg-gray-20 ">
      
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {/* <span className="bg-gradient-to-r from-blue-600 to-green-600  bg-clip-text text-transparent"> */}
            <span>
              Announcements
            </span>
          </h2>
         
        </div>

        {/* Upcoming Events */}
        <div className="m-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
            {upcomingEvents.map((event) => (
              <div onClick={() => handleEventInterest(event)} key={event.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl ">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-6" >
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                 {
                    event.id === 7 ? (<p style={{ cursor: "pointer" }}
                        onClick={() => window.open("https://chattahoocheeparks.app.neoncrm.com/nx/portal/neonevents/events?path=%2Fportal%2Fevents%2F36703", "_blank")} className="text-sm text-blue-400  mb-4">Registration & Event Information</p>)
                    : null}
                  {/* <button 
                    onClick={() => handleEventInterest(event)}
                    className="pt-2 w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
                  >
                    I'm Interested! 🙋‍♀️
                  </button> */}
                </div>
              </div>
            ))}

        </div>
 
          
          <div className="flex justify-center">
          <h5 className="text-2xl mt-10
           md:text-2xl font-bold text-blue-900 ">
          
            <a
              href="/#/past-events"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-400 transition-colors duration-200 font-semibold flex items-center space-x-1 "
            >
              <span> 📸 View Past Events</span>
            </a>
          </h5>
         
        </div>

      </div>

      <EventRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedEvent={selectedEvent}
        allEvents={upcomingEvents}
        onRegister={handleRegistration}
      />
    </section>
  );
};

export default Announcements;