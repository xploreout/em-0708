import React, { useState } from 'react';
import { ArrowLeft, Play, Search, Filter, Calendar, User, Clock } from 'lucide-react';

interface VideoArchiveProps {
  onBack: () => void;
}

const VideoArchive: React.FC<VideoArchiveProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Sermons', 'Bible Studies', 'Testimonies', 'Worship', 'Special Events'];

  const videos = [
    {
      id: 1,
      title: "Finding Hope in Difficult Times",
      speaker: "Pastor John Smith",
      duration: "45 min",
      date: "March 10, 2024",
      category: "Sermons",
      thumbnail: "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "A powerful message about maintaining faith during challenging seasons of life."
    },
    {
      id: 2,
      title: "Building Authentic Relationships",
      speaker: "Sarah Johnson",
      duration: "38 min",
      date: "March 3, 2024",
      category: "Bible Studies",
      thumbnail: "https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Exploring biblical principles for building meaningful connections with others."
    },
    {
      id: 3,
      title: "Discovering Your Spiritual Gifts",
      speaker: "Michael Chen",
      duration: "52 min",
      date: "February 25, 2024",
      category: "Bible Studies",
      thumbnail: "https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Understanding how God has uniquely gifted each of us for service."
    },
    {
      id: 4,
      title: "Testimony: From Doubt to Faith",
      speaker: "Emily Rodriguez",
      duration: "15 min",
      date: "February 18, 2024",
      category: "Testimonies",
      thumbnail: "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "A personal story of transformation and finding faith in unexpected places."
    },
    {
      id: 5,
      title: "Worship Night Highlights",
      speaker: "Worship Team",
      duration: "1h 20min",
      date: "February 11, 2024",
      category: "Worship",
      thumbnail: "https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Beautiful moments from our monthly worship and prayer gathering."
    },
    {
      id: 6,
      title: "Christmas Celebration 2023",
      speaker: "Community",
      duration: "2h 15min",
      date: "December 24, 2023",
      category: "Special Events",
      thumbnail: "https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Our joyful Christmas celebration with carols, testimonies, and fellowship."
    },
    {
      id: 7,
      title: "The Power of Prayer",
      speaker: "Pastor David Kim",
      duration: "42 min",
      date: "January 28, 2024",
      category: "Sermons",
      thumbnail: "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Understanding the importance and impact of prayer in our daily lives."
    },
    {
      id: 8,
      title: "Young Adult Retreat Recap",
      speaker: "Ministry Team",
      duration: "25 min",
      date: "January 21, 2024",
      category: "Special Events",
      thumbnail: "https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Highlights and testimonies from our amazing winter retreat experience."
    }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Resources</span>
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Video Archive
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our collection of sermons, Bible studies, testimonies, and special events! 🎬
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos, speakers, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[150px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredVideos.length} of {videos.length} videos
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <a 
              key={video.id} 
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group block cursor-pointer"
            >
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {video.category}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-500" />
                    <span>{video.speaker}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{video.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>{video.duration}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {video.description}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* No Results */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos found</h3>
            <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoArchive;