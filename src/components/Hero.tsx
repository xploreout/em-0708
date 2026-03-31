import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { upcomingEvents } from '../data/events';

const Hero = () => {
  const preview = upcomingEvents.slice(0, 4);

  return (
    <section className="bg-gray-800">
      {/* Top — dark hero banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/33307468/pexels-photo-33307468.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Young adults fellowship"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/60 via-gray-800/40 to-gray-800/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 py-24 text-center">
          <p className="text-sm uppercase tracking-widest text-blue-400 font-semibold mb-4">
            Atlanta Chinese Bible Community Church
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            ACBCC{' '}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              English Ministry
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6">
            A Christ-centered community where we build relationships, grow in
            faith, and serve together.
          </p>

          <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            We are prayerfully seeking a part-time or full-time servant to join
            the ministry, and we look forward to the upcoming launch of our
            English Worship Service. Join us during this special season.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => document.getElementById('newcomer-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-white/30 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              I'm new here
            </button>
          </div>
        </div>
      </div>

      {/* Bottom — top 4 announcement cards */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">What's Coming Up</h2>
            <Link
              to="/announcements"
              className="text-sm text-blue-500 hover:text-blue-700 transition-colors font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {preview.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                    {event.title}
                  </h3>
                  <div className="space-y-1 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
