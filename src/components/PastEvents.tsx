import React, { useState } from 'react';
import { Play, BookOpen, Calendar, Clock, User, Search, Filter } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const PastEvents = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sermons = [
    {
      id: 1,
      title: "Faith in Action: Living Out Our Beliefs",
      speaker: "Pastor John Smith",
      date: "January 28, 2025",
      duration: "45 min",
      type: "video",
      description: "Exploring how we can put our faith into practice through daily actions and service to others.",
      thumbnail: "https://images.pexels.com/photos/8468060/pexels-photo-8468060.jpeg?auto=compress&cs=tinysrgb&w=400",
      series: "Living Faith"
    },
    {
      id: 2,
      title: "God's Amazing Grace: Understanding Divine Love",
      speaker: "Pastor Sarah Johnson",
      date: "January 21, 2025",
      duration: "38 min",
      type: "audio",
      description: "A deep dive into the concept of grace and how God's unconditional love transforms our lives.",
      thumbnail: "https://images.pexels.com/photos/7551662/pexels-photo-7551662.jpeg?auto=compress&cs=tinysrgb&w=400",
      series: "Grace Series"
    },
    {
      id: 3,
      title: "Walking with Purpose: Finding Your Calling",
      speaker: "Pastor Michael Chen",
      date: "January 14, 2025",
      duration: "42 min",
      type: "video",
      description: "Discovering God's unique purpose for your life and how to walk confidently in your calling.",
      thumbnail: "https://images.pexels.com/photos/8468063/pexels-photo-8468063.jpeg?auto=compress&cs=tinysrgb&w=400",
      series: "Purpose Driven"
    },
    {
      id: 4,
      title: "The Power of Prayer: Connecting with God",
      speaker: "Pastor Emily Davis",
      date: "January 7, 2025",
      duration: "35 min",
      type: "audio",
      description: "Understanding the importance of prayer and how to develop a meaningful prayer life.",
      thumbnail: "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg?auto=compress&cs=tinysrgb&w=400",
      series: "Spiritual Disciplines"
    },
    {
      id: 5,
      title: "Hope in Difficult Times: Finding Light in Darkness",
      speaker: "Pastor John Smith",
      date: "December 31, 2024",
      duration: "48 min",
      type: "video",
      description: "How to maintain hope and trust in God during life's most challenging seasons.",
      thumbnail: "https://images.pexels.com/photos/8468060/pexels-photo-8468060.jpeg?auto=compress&cs=tinysrgb&w=400",
      series: "Hope Series"
    },
    {
      id: 6,
      title: "Christmas Joy: The Gift of Jesus",
      speaker: "Pastor Sarah Johnson",
      date: "December 24, 2024",
      duration: "40 min",
      type: "video",
      description: "Celebrating the birth of Jesus and the joy that comes from God's greatest gift to humanity.",
      thumbnail: "https://images.pexels.com/photos/7551662/pexels-photo-7551662.jpeg?auto=compress&cs=tinysrgb&w=400",
      series: "Christmas Special"
    }
  ];

  const filteredSermons = sermons.filter(sermon => {
    const matchesType = selectedType === 'all' || sermon.type === selectedType;
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.series.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <Header/>
      
      {/* Page Header */}
      <div className="bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Past Events</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hi
              Watch or listen to previous sermons and messages from our community
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sermons, speakers, or series..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedType === 'all' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedType('video')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedType === 'video' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Video
                  </button>
                  <button
                    onClick={() => setSelectedType('audio')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedType === 'audio' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Audio
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredSermons.length} of {sermons.length} sermons
            </p>
          </div>

          {/* Sermons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSermons.map((sermon) => (
              <div
                key={sermon.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative">
                  <img 
                    src={sermon.thumbnail} 
                    alt={sermon.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {sermon.type === 'video' ? (
                        <div className="bg-white bg-opacity-90 rounded-full p-4">
                          <Play className="h-8 w-8 text-primary-600" />
                        </div>
                      ) : (
                        <div className="bg-white bg-opacity-90 rounded-full p-4">
                          <BookOpen className="h-8 w-8 text-secondary-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sermon.type === 'video' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-secondary-100 text-secondary-800'
                    }`}>
                      {sermon.type === 'video' ? 'Video' : 'Audio'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-xs text-accent-600 bg-accent-100 px-2 py-1 rounded-full font-medium">
                      {sermon.series}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                    {sermon.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {sermon.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <User className="h-4 w-4 mr-2" />
                      <span>{sermon.speaker}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{sermon.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{sermon.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gradient-primary hover:opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                      {sermon.type === 'video' ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Watch
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Listen
                        </>
                      )}
                    </button>
                    <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredSermons.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sermons found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PastEvents;