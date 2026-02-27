import React, { useState } from 'react'
import {
 
  Heart,
  ExternalLink,
  Play,
  Calendar,
} from 'lucide-react'
import VideoArchive from './VideoArchive'

const Resources = () => {
  const [showVideoArchive, setShowVideoArchive] = useState(false)

  const bibleStudies = [
    {
      id: 1,
      title: "Basics of Faith - Episode 1",
      description: "We will explore the following: What is faith? Why is faith important? How can we grow in our faith? This video series will help you understand the basics of Christian faith and how to apply it in your daily life.",
      duration: "6 min",
      videoPlaylistUrl: "https://www.youtube.com/watch?v=kFh3dHvAsLE&t=1s",
      image: "https://images.pexels.com/photos/66100/pexels-photo-66100.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      isVideoSeries: true
    },
    {
      id: 2,
      title: "Purpose Driven Life - Daily",
      description: "Discovering God's purpose for your life and career",
      duration: "5-10 min/40 days dev",
      videoPlaylistUrl: "https://youtube.com/playlist?list=PL_UPGMCoup7CAZylckDzth0KuYLYh7A6P&si=FXZa-3l1stPyw4_P",
      image: "https://images.pexels.com/photos/91153/pexels-photo-91153.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      isVideoSeries: true
    },
    {
      id: 3,
      title: 'Discipleship Training',
      description:
        'A 4-weeks intensive training program for growing as a disciple of Christ',
      duration: 'please contact us',
      // downloadUrl: "#",
      image:
        'https://images.pexels.com/photos/8383409/pexels-photo-8383409.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
  ]

  const devotionalMaterials = [
    {
      id: 1,
      title: 'Our Daily Bread',
      description:
        'Daily devotional with biblical insights and practical applications for everyday life',
      type: 'Daily Devotional',
      externalUrl: 'https://www.odbm.org/en/devotionals',
      image:
        'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'Jesus Calling',
      description:
        'Devotions for every day of the year with encouraging messages of hope and peace',
      type: 'Daily Devotional',
      externalUrl: 'https://www.jesuscalling.com/',
      image:
        'https://images.pexels.com/photos/8383412/pexels-photo-8383412.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Desiring God',
      description:
        "Rich theological devotionals that help deepen your understanding of God's character",
      type: 'Daily Devotional',
      externalUrl: 'https://www.desiringgod.org/',
      image:
        'https://images.pexels.com/photos/8383672/pexels-photo-8383672.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
  ]

  // const featuredVideos = [
  //   {
  //     id: 1,
  //     title: 'Finding Hope in Difficult Times',
  //     speaker: 'Pastor John Smith',
  //     duration: '45 min',
  //     thumbnail:
  //       'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  //     videoUrl: '#',
  //   },
  //   {
  //     id: 2,
  //     title: 'Building Authentic Relationships',
  //     speaker: 'Sarah Johnson',
  //     duration: '38 min',
  //     thumbnail:
  //       'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  //     videoUrl: '#',
  //   },
  //   {
  //     id: 3,
  //     title: 'Discovering Your Spiritual Gifts',
  //     speaker: 'Michael Chen',
  //     duration: '52 min',
  //     thumbnail:
  //       'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  //     videoUrl: '#',
  //   },
  // ]

  // if (showVideoArchive) {
  //   return <VideoArchive onBack={() => setShowVideoArchive(false)} />
  // }

  return (
    <section
      id='resources'
      className='py-10 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-16'>
          {/* <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            <Book className="h-4 w-4" />
            <span>Spiritual Growth</span>
          </div> */}
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            <span className='bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent'>
              Resources
            </span>
          </h2>
          {/* <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Discover materials to deepen your faith with the Lord Jesus Christ!
            📚✨
          </p> */}
        </div>

        {/* Bible Studies */}
        <div className='mb-20'>
          {/* <h3 className='text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center'>
            <Book className='h-8 w-8 mr-3 text-purple-600' />
            Bible Studies
          </h3> */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          

            {bibleStudies.map((study) => (
              <div
                key={study.id}
                className='bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group'
              >
                <div className='relative'>
                  <img
                    src={study.image}
                    alt={study.title}
                    className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                </div>

                <div className='p-6'>
                  <h4 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors'>
                    {study.title}
                  </h4>
                  <p className='text-gray-600 mb-4 text-sm leading-relaxed'>
                    {study.description}
                  </p>

                  <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                    <span className='flex items-center'>
                      <Calendar className='h-4 w-4 mr-1' />
                      {study.duration}
                    </span>
                  </div>

                  {study.isVideoSeries ? (
                    <a
                      href={study.videoPlaylistUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-full bg-gradient-to-r from-blue-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2'
                    >
                      <Play className='h-4 w-4' />
                      <span>Watch Video</span>
                    </a>
                  ) : (
                    <div></div>
                    // <a
                    //   href={study.downloadUrl}
                    //   className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    // >
                    //   <Download className="h-4 w-4" />
                    //   <span>Download Study</span>
                    // </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devotional Materials */}
        <div className='mb-20'>
          <h3 className='text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center'>
            <Heart className='h-8 w-8 mr-3 text-pink-600' />
            Devotional Materials
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {devotionalMaterials.map((material) => (
              <a
                key={material.id}
                href={material.externalUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group block cursor-pointer'
              >
                <div className='relative'>
                  <img
                    src={material.image}
                    alt={material.title}
                    className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                  <div className='absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold'>
                    {material.type}
                  </div>
                  <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2'>
                    <ExternalLink className='h-4 w-4 text-gray-600' />
                  </div>
                </div>

                <div className='p-6'>
                  <h4 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors'>
                    {material.title}
                  </h4>
                  <p className='text-gray-600 mb-4 text-sm leading-relaxed'>
                    {material.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Video Archive */}
        <div className='mb-20'>
          {/* <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
            <Video className="h-8 w-8 mr-3 text-blue-600" />
            Video Archive
          </h3> */}

          {/* Featured Videos */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Speaker: {video.speaker}
                  </p>
                  
                  <a 
                    href={video.videoUrl}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Watch Now</span>
                  </a>
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Call to Action */}
        {/* <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need Something Specific? 🤔</h3>
            <p className="text-lg mb-6 opacity-90">
              Can't find what you're looking for? We'd love to help you find the right resources for your spiritual journey!
            </p>
            <a 
              href="#newcomer-form" 
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 inline-flex items-center space-x-2"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Contact Us for More Resources</span>
            </a>
          </div>
        </div> */}
      </div>
    </section>
  )
}

export default Resources
