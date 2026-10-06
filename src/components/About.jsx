import { useRef } from "react";
import "../styles/about.css";
import profile from "../assets/perfilSemFundo.png";
import { GraduationCap, Code2, BarChart3 } from "lucide-react";
import { gsap, useGSAP, animateSectionIntro, prefersReducedMotion } from "../lib/gsap";

const items = [
  { icon: GraduationCap, title: "Estudante de ADS", text: "Cruzeiro do Sul" },
  { icon: Code2, title: "Desenvolvimento", text: "Frontend e Backend" },
  { icon: BarChart3, title: "Sempre evoluindo", text: "Novas tecnologias e desafios" },
];

function About() {
  const aboutRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const stopIntro = animateSectionIntro(aboutRef.current);

      // A moldura "abre" de baixo para cima e a foto assenta no lugar
      gsap
        .timeline({ scrollTrigger: { trigger: ".about-photo", start: "top 80%" } })
        .from(".about-photo", { clipPath: "inset(100% 0% 0% 0% round 24px)", duration: 1.2, ease: "expo.inOut" })
        .from(".about-photo img", { scale: 1.25, yPercent: 8, duration: 1.6, ease: "expo.out" }, 0.3)
        .from(".about-photo figcaption", { autoAlpha: 0, y: 8 }, 0.9);

      // Parallax leve da foto dentro da moldura
      gsap.to(".about-photo img", {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true },
      });

      // A linha da timeline "desenha" e os itens entram em seguida
      gsap
        .timeline({ scrollTrigger: { trigger: ".about-info", start: "top 85%" } })
        .from(".about-info", { "--line": 0, duration: 1, ease: "power2.inOut" })
        .from(".about-item", { autoAlpha: 0, y: 16, stagger: 0.12 }, 0.2);

      return stopIntro;
    },
    { scope: aboutRef }
  );

  return (
    <section className="section about" id="sobre" ref={aboutRef}>
      <div className="container about-container">
        <figure className="about-photo">
          <img src={profile} alt="Foto de Matheus Muniz" width="1279" height="1230" loading="lazy" />
          <figcaption>
            <span>matheus_muniz.png</span>
            <span>dev em formação</span>
          </figcaption>
        </figure>

        <div className="about-body">
          <div className="about-content">
            <p className="section-label" data-index="01">Sobre mim</p>

            <h2 className="section-title">
              Mais que código, <span>evolução constante.</span>
            </h2>

            <p className="section-description">
              Sou estudante de Análise e Desenvolvimento de Sistemas e
              desenvolvedor em formação. Tenho foco em criar aplicações web,
              unindo design, lógica e boas práticas para transformar ideias em
              soluções reais.
            </p>
          </div>

          <ul className="about-info">
            {items.map(({ icon: Icon, title, text }) => (
              <li className="about-item" key={title}>
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />

                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default About;
