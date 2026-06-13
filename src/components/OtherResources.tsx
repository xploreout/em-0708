import { ExternalLink } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { t, tx } from '../i18n/translations'

const OtherResources = () => {
  const { lang } = useLang()

  const devotionals = [
    {
      id: 1,
      titleKey: 'odbTitle' as const,
      descKey:  'odbDesc'  as const,
      url: 'https://www.odbm.org/en/devotionals',
      image: 'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      id: 2,
      titleKey: 'jcTitle' as const,
      descKey:  'jcDesc'  as const,
      url: 'https://www.jesuscalling.com/',
      image: 'https://images.pexels.com/photos/8383412/pexels-photo-8383412.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
    {
      id: 3,
      titleKey: 'dgTitle' as const,
      descKey:  'dgDesc'  as const,
      url: 'https://www.desiringgod.org/',
      image: 'https://images.pexels.com/photos/8383672/pexels-photo-8383672.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    },
  ]

  return (
    <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-left mb-14'>
          <h5 className='text-md font-semibold text-gray-900 uppercase tracking-wider mb-6'>
            {tx(t.otherResources.title, lang)}
          </h5>
        </div>

        <div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {devotionals.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col group'
              >
                <div className='relative'>
                  <img
                    src={item.image}
                    alt={tx(t.otherResources[item.titleKey], lang)}
                    className='w-full h-44 object-cover'
                  />
                  <div className='absolute top-3 right-3 bg-white rounded-full p-1.5 shadow'>
                    <ExternalLink className='h-3.5 w-3.5 text-gray-500' />
                  </div>
                </div>
                <div className='p-5'>
                  <h4 className='text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                    {tx(t.otherResources[item.titleKey], lang)}
                  </h4>
                  <p className='text-sm text-gray-500 leading-relaxed'>
                    {tx(t.otherResources[item.descKey], lang)}
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
