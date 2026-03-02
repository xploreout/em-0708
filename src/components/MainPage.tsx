import Header from './Header'
import Hero from './Hero'
import NewcomerForm from './NewcomerForm'
import Footer from './Footer'
import Resources from './Resources'
import Announcements from './Announcements'

function MainPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <section id='announcements'>
          <Announcements />
        </section>
        <section id='resources'>
          <Resources />
        </section>

        <NewcomerForm />
      </main>
      <Footer />
    </>
  )
}

export default MainPage
