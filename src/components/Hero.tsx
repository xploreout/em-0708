import React from 'react';
import { Heart, Users, ArrowDown } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-300 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-300 rounded-full blur-2xl"></div>
      </div>

      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
          alt="Young adults fellowship" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-pink-400/20 to-purple-400/30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-orange-200">
              <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-800 tracking-wide">Welcome to our vibrant community</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              We are glad
            </span>
            <br />
            <span className="text-gray-800">you visited</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
            Join our amazing community of adults as we grow together in faith, friendship, and fun! 
            We'd love to get to know you and help you find your tribe here. ✨
          </p>
          
          <div className="flex items-center justify-center space-x-3 text-orange-600 mb-10">
            <Users className="h-6 w-6" />
            <span className="text-lg font-semibold">
              We are part of{' '}
              <a 
                href="https://www.acbcc.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-600 transition-colors duration-200  decoration-2 underline-offset-2"
              >
                ACBCC
              </a>
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#newcomer-form" 
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
            >
              Connect With Us 🤝
            </a>
            <a 
              href="#announcements" 
              className="bg-white/90 backdrop-blur-sm text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-orange-200"
            >
              See What's Coming Up 🎉
            </a>
          </div>

          <div className="mt-12 animate-bounce">
            <ArrowDown className="h-6 w-6 text-orange-500 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;