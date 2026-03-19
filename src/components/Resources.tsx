import { ExternalLink, Play, Clock } from 'lucide-react'

const Resources = () => {
  const bibleStudies = [
    {
      id: 1,
      title: 'Basics of Faith – Episode 2',
      description:
        'What is faith? Why is faith important? How can we grow in our faith? This series explores the basics of Christian faith and how to apply it daily.',
      duration: '6 min',
      videoUrl: 'https://youtu.be/yc5DT0li4V0?si=MbR2KHKGRfhVFbke',
      image:
        'https://images.pexels.com/photos/66100/pexels-photo-66100.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      links: [
        { label: 'Conversation Guide', url: '/images/mean2.jpg' },
        {
          label: 'What Is Prayer?',
          url: 'https://finds.life.church/what-is-prayer/',
        },
        {
          label: 'Spiritual Habits',
          url: 'https://finds.life.church/spiritual-disciplines/',
        },
      ],
    },
    {
      id: 2,
      title: 'Purpose Driven Life – Daily',
      description: "Discovering God's purpose for your life and career.",
      duration: '5–10 min / 40-day devotional',
      videoUrl:
        'https://youtube.com/playlist?list=PL_UPGMCoup7CAZylckDzth0KuYLYh7A6P&si=FXZa-3l1stPyw4_P',
      image:
        'https://images.pexels.com/photos/91153/pexels-photo-91153.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Discipleship Training',
      description:
        'A 4-week intensive training program for growing as a disciple of Christ.',
      duration: 'Contact us to learn more',
      image:
        'https://images.pexels.com/photos/8383409/pexels-photo-8383409.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
  ]

  const devotionals = [
    {
      id: 1,
      title: 'Our Daily Bread',
      description:
        'Daily devotional with biblical insights and practical applications for everyday life.',
      url: 'https://www.odbm.org/en/devotionals',
      image:
        'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'Jesus Calling',
      description:
        'Devotions for every day of the year with encouraging messages of hope and peace.',
      url: 'https://www.jesuscalling.com/',
      image:
        'https://images.pexels.com/photos/8383412/pexels-photo-8383412.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Desiring God',
      description:
        "Rich theological devotionals that deepen your understanding of God's character.",
      url: 'https://www.desiringgod.org/',
      image:
        'https://images.pexels.com/photos/8383672/pexels-photo-8383672.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
  ]

  return (
    <section id="resources" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold mb-2">
            Grow in Faith
          </p>
          <h2 className="text-4xl font-bold text-gray-900">Resources</h2>
        </div>

        {/* Bible Studies */}
        <div className="mb-16">
          <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Bible Studies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bibleStudies.map((study) => (
              <div
                key={study.id}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                <img
                  src={study.image}
                  alt={study.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {study.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <Clock className="h-3 w-3" />
                    <span>{study.duration}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                    {study.description}
                  </p>
                  {study.links && (
                    <div className="space-y-1 mb-4">
                      {study.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                  {study.videoUrl && (
                    <a
                      href={study.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors duration-200"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Watch Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devotionals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Devotional Materials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devotionals.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col group"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow">
                    <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default Resources
