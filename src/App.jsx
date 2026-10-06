import { useEffect } from "react"

import Header from "./components/Header"
import Hero from "./components/Hero"
import About from './components/About'
import TechMarquee from "./components/TechMarquee"
import Projects from "./components/Projects"
import Technologies from "./components/Technologies"
import Contato from "./components/Contato"
import Footer from "./components/Footer"
import ParticleBackground from "./components/ParticleBackground"
import Cursor from "./components/Cursor"
import BackToTop from "./components/BackToTop"
import { initSmoothScroll } from "./lib/smoothScroll"

function App(){
  useEffect(() => initSmoothScroll(), [])

  return(
    <>
    <ParticleBackground />
    <Cursor />

    <Header />

    <main>
      <Hero />

      <About />

      <TechMarquee />

      <Technologies />

      <Projects />

      <Contato />
    </main>

    <Footer />

    <BackToTop />

    </>
  )
}

export default App;
