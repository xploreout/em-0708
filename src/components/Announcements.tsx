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
    {
      id: 1,
      title: "Book Study Fellowship",
      date: "2nd and 4th Sunday of each month ",
      time: "12:45 - 2:30 PM",
      location: "varies",
      description: "Did you ever wonder what exactly the purpose of your life is? Does it matter what you do and live your life? Join us to explore a 6 sessions book study by Pastor Rick Warren on Purpose Driven Life.",
      image: "https://images.pexels.com/photos/7652241/pexels-photo-7652241.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      color: "from-orange-400 to-pink-400"
    },
    {
      id: 2,
      title: "Nov Outing",
      date: "Mid November",
      time: "8AM",
      location: "Tbd",
      description: "Adventure awaits! Join us for a day of hiking and outdoor worship. We will finish with optional lunch together. All skill levels welcome!",
      image: "https://images.pexels.com/photos/531857/pexels-photo-531857.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      color: "from-green-400 to-blue-400"

      
    },
    {
      id: 3,
      title: "Operation Christmas Child",
      date: "Early December",
      time: "2-4 hours",
      location: "Operation Christmas Child Warehouse",
      description: "Make a difference in our community! We'll be at warehouse handling donated shoe boxes to be shipped to children all over the world, sharing the joy of Jesus love and His gift of salvation!",
      image: "https://images.pexels.com/photos/1666069/pexels-photo-1666069.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      color: "from-purple-400 to-pink-400"
    }
  ];

  const pastEvents = [
    // {
    //   id: 4,
    //   title: "AI and Career Opportunities Panel",
    //   date: "February 5, 2024",
    //   location: "Church Conference Room",
    //   description: "Insightful panel discussion on how AI is shaping career paths and opportunities for the future.",
    //   images: [
    //     "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    //     "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    //     "https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    //   ],
    //   attendees: 42
    // },
    {
      id: 5,
      title: "Adults Open House",
      date: "Aug 9, 2025",
      location: "Alpharetta",
      description: "A wonderful start to our new book study, filled with dumpling-making fun, games, meaningful conversation and fellowship!",
      images: [
        "https://images.pexels.com/photos/7652241/pexels-photo-7652241.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        "https://images.pexels.com/photos/6646201/pexels-photo-6646201.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
      ],
      // attendees: 38
    },
    {
      id: 6,
      title: "Youth Open House",
      date: "Aug 2025",
      location: "Club House",
      description: "What an amazing Saturday to kick off a new year of youth group! We enjoyed great games and fellowship to warmly welcome everyone back after the summer.",
      images: [
        "https://images.pexels.com/photos/5384585/pexels-photo-5384585.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        "https://images.pexels.com/photos/7429625/pexels-photo-7429625.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
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
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
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
            Stay connected with all the exciting events and activities happening in our adult community! 🎉
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔥 Upcoming Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <div
                      onClick={(e) => handleHeartClick(event.id, e)}
                      className={`transition-colors duration-200 ${
                        likedEvents.has(event.id) 
                          ? 'text-red-500' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      disabled={likedEvents.has(event.id)}
                    >
                      <Heart className={`h-4 w-4 ${likedEvents.has(event.id) ? 'fill-current' : ''}`} />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {heartLikes[event.id] || 0} ❤️
                  </div>
                </div>
                
                <div className="p-6">
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
                  
                  <button 
                    onClick={() => handleEventInterest(event)}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                  >
                    I'm Interested! 🙋‍♀️
                  </button>
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
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <div
                      onClick={(e) => handleHeartClick(event.id, e)}
                      className={`transition-colors duration-200 ${
                        likedEvents.has(event.id) 
                          ? 'text-red-500' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      // disabled={likedEvents.has(event.id)}
                    >
                      <Heart className={`h-4 w-4 ${likedEvents.has(event.id) ? 'fill-current' : ''}`} />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {heartLikes[event.id] || 0} ❤️
                  </div>
                  
                  {/* Event Details Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <h4 className="text-lg font-bold text-white mb-1">
                      {event.title}
                    </h4>
                    <div className="flex items-center text-white/90 text-sm mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-white/90 text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{event.location}</span>
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