import { ExternalLink } from 'lucide-react'

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

const OtherResources = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-14">
         
          <h2 className="text-4xl font-bold text-gray-900">Other Resources</h2>
        </div>

        {/* Devotional Materials */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wider mb-6">
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

export default OtherResources
