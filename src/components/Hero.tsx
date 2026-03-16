import React from 'react';
import { Users, ArrowDown } from 'lucide-react';
import FireworkButton from './FireworkButton';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-100 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-400 rounded-full blur-2xl"></div>
      </div>

      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/33307468/pexels-photo-33307468.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
          alt="Young adults fellowship" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/30 "></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" >
          
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <div className="flex  justify-center animate-pulse">
              <FireworkButton/>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Glad that you are here!
           </span>
            <br />
            {/* <span className="text-gray-800">you visited</span> */}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
            Welcome our Christ-centered ministry where we grow in faith, build relationships, and serve the community together.  
          </p>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
          We are eagerly prayering for a part-time or full-time servant to join this ministry, and also for English Worship services to be launched very soon.  We pray that you will join us in building up the body of Christ! </p>
          <p className="text-l md:text-xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
          If you are interested in joining us, please reach out to us through the contact form below.
          </p>
            <div className="flex items-center justify-center space-x-3 text-blue-600 mb-10">
            {/* <Users className="h-6 w-6" /> */}
            <span className="text-lg font-semibold">
              We are a part of{' '}
              <a 
                href="https://www.acbcc.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-yellow-600 transition-colors duration-200  decoration-2 underline-offset-2"
              >
                Atlanta Chinese Bible Community Church (ACBCC)
              </a>
            </span>
          </div>
          
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#newcomer-form" 
              className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-blue-600 hover:to-yellow-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
            >
              Connect With Us 🤝
            </a>
            <a 
              href="#announcements" 
              className="bg-white/90 backdrop-blur-sm text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-blue-200"
            >
              See What's Coming Up 🎉
            </a>
          </div> */}

          {/* <div className="mt-12 animate-bounce">
            <ArrowDown className="h-6 w-6 text-blue-500 mx-auto" />
          </div> */}
        </div>
      </div>
    </section>
  );
};
export default Hero;
