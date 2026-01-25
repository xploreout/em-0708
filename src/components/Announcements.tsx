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
    //   color: "from-orange-400 to-pink-400"
    // },
    // {
    //   id: 2,
    //   title: "Ministry Kickoff Celebration",
    //   date: "Sunday, August 10",
    //   time: "11:30am",
    //   location: "Duluth, GA",
    //   description: "Come celebrate a new ministry kickoff with delicious bao-zi and much more. Get to know coworkers and review program materials,from children, youth, and adult ministries. Will you come join us?",
    //   image: "./images/aug10.png",
    //   color: "from-orange-400 to-pink-400"
    // },
    {
      id: 3,
      title: "Bible Study & Fellowship",
      date: "Every 1st and 3rd Friday of the month  ",
      time: "7:30pm",
      location: "SDA Church, Duluth, GA",
      description: "We are studying the book of James from the Bible. Join us for a time of fellowship and learning as we dive into the practical wisdom of James. All are welcome to attend!",
      image: "https://images.pexels.com/photos/5206051/pexels-photo-5206051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      color: "from-orange-400 to-pink-400"
    },
    // {
    //   id: 4,
    //   title: "Youth Open House",
    //   date: "August 23",
    //   time: "Saturday 4-7pm",
    //   location: "Club House - details after registration.",
    //   description: "An amazing Saturday to kick off a new year of youth group! We will have great activities and fellowship to warmly welcome everyone back after the summer.",
    //   image: "./images/yopenhse.JPG",
    //   color: "from-green-400 to-blue-400"

      
    // },
     {
      id: 5,
      title: "CNY Gala",
      date: "February 22, Sunday",
      time: "5:30pm Dinner 7:00pm Program",
      location: "SDA Church, Duluth, GA",
      description: "Come join us to celebrate Chinese New Year with good food and entertainment programs.",
      image: "https://images.pexels.com/photos/7364071/pexels-photo-7364071.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      color: "from-green-400 to-blue-400"
    },
    {
      id: 6,
      title: "Calling Actors / Helpers for CNY Silent Skit",
      date: "Rehearsal Dates: 2/6, 2/8, 2/20",
      time: "varied times",
      location: "SDA Church, Duluth, GA",
      description: "Celebrate Chinse New Year with a silent skit performance! The short silent skit will explore the joy of receiving red pockets and the true meaning of joy and redemption. We are looking for actors and helpers to make this event a success. Join us for rehearsals and be part of the fun!",
      image: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      color: "from-purple-400 to-pink-400"
    }
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
    setSelectedEvent(event);
    setIsModalOpen(true);
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

    // Here you would typically send emails to both user and webmaster
    console.log('Registration submitted:', { eventIds, contactInfo });
    console.log('Sending confirmation emails...');
  };

  const PhotoCollage = ({ images, title }: { images: string[], title: string }) => {
    if (images.length === 1) {
      return (
        <img 
          src={images[0]} 
          alt={title}
          className="w-full h-80 object-cover group-hover:scale-101 transition-transform duration-300"
        />
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 h-40">
          {images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`${title} ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 h-40">
          <img 
            src={images[0]} 
            alt={`${title} 1`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="grid grid-rows-2 gap-1">
            <img 
              src={images[1]} 
              alt={`${title} 2`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <img 
              src={images[2]} 
              alt={`${title} 3`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      );
    }

    if (images.length === 4) {
      return (
        <div className="grid grid-cols-2 gap-1 h-80">
          {images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`${title} ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ))}
        </div>
      );
    }

    // 5+ images
    return (
      <div className="grid grid-cols-3 gap-1 h-40">
        <img 
          src={images[0]} 
          alt={`${title} 1`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <img 
          src={images[1]} 
          alt={`${title} 2`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="relative">
          <img 
            src={images[2]} 
            alt={`${title} 3`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {images.length > 3 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">+{images.length - 3}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="announcements" className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Announcements
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔥 Upcoming Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
            {upcomingEvents.map((event) => (
              <div onClick={() => handleEventInterest(event)} key={event.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl cursor-pointer">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <div
                      onClick={(e) => handleHeartClick(event.id, e)}
                      className={`transition-colors duration-200 ${
                        likedEvents.has(event.id) 
                          ? 'text-red-500' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likedEvents.has(event.id) ? 'fill-current' : ''}`} />
                    </div>
                  </div>
                </div>
                
                <div className="p-6" >
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2 text-pink-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                 
                  {/* <button 
                    onClick={() => handleEventInterest(event)}
                    className="pt-2 w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                  >
                    I'm Interested! 🙋‍♀️
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>

         {/* Past Events */}

        <div>

          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">

            📸 Recent Memories

          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {pastEvents.map((event) => (

              <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
                <div className="relative">
                  <PhotoCollage images={event.images} title={event.title} />
                  {/* Event Details Overlay */}
                  <div className="absolute bottom-0 left-0 right-0   p-4">
                    <h4 className="text-lg font-bold text-white mb-1 opacity-70">
                      {event.title}
                    </h4>
                    <div className="flex items-center text-white/90 text-sm mb-1 opacity-70">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-3 text-sm">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {/* <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Don't Miss Out! 🎊</h3>
            <p className="text-lg mb-6 opacity-90">
              Stay updated with all our events and be part of our amazing community
            </p>
            <a 
              href="#newcomer-form" 
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 inline-block"
            >
              Join Our Community Today!
            </a>
          </div>
        </div> */}
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