import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-gray-800">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/33307468/pexels-photo-33307468.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Young adults fellowship"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800/60 via-gray-800/40 to-gray-800/80" />
      </div>

      {/* Content */}
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/announcements"
            className="bg-white text-gray-900 px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
          >
            Announcements
          </Link>
          <button
            onClick={() => document.getElementById('newcomer-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-white/30 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors duration-200"
          >
            Connect With Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
