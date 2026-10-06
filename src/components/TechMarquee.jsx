import { useRef } from "react";
import "../styles/marquee.css";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../lib/gsap";

const ROW_A = ["React", "JavaScript", "Node.js", "Express", "MySQL", "Sequelize"];
const ROW_B = ["HTML5", "CSS3", "Vite", "Axios", "Git", "GitHub"];

function Row({ items, outline }) {
  // Conteúdo repetido 2x: ao chegar na metade, o loop recomeça sem emenda
  const content = [...items, ...items];
  return (
    <div className={`marquee-row ${outline ? "is-outline" : ""}`}>
      <div className="marquee-track">
        {content.map((item, i) => (
          <span className="marquee-item" key={i} aria-hidden={i >= items.length}>
            {item}
            <span className="marquee-star" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Faixa infinita de tecnologias. A velocidade acompanha a rolagem
// e o sentido inverte quando você rola para cima.
function TechMarquee() {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const [trackA, trackB] = gsap.utils.toArray(".marquee-track");
      const loops = [
        gsap.to(trackA, { xPercent: -50, duration: 40, ease: "none", repeat: -1 }),
        gsap.fromTo(trackB, { xPercent: -50 }, { xPercent: 0, duration: 40, ease: "none", repeat: -1 }),
      ];

      let direction = 1;

      // Rolagem dá um "empurrão" na velocidade...
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          direction = self.direction;
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6);
          loops.forEach((loop) => loop.timeScale(boost * direction));
        },
      });

      // ...que vai voltando suavemente à velocidade normal
      const settle = () => {
        loops.forEach((loop) => {
          loop.timeScale(gsap.utils.interpolate(loop.timeScale(), direction, 0.05));
        });
      };
      gsap.ticker.add(settle);

      return () => gsap.ticker.remove(settle);
    },
    { scope: ref }
  );

  return (
    <section className="marquee" ref={ref} aria-label="Tecnologias que utilizo">
      <Row items={ROW_A} />
      <Row items={ROW_B} outline />
    </section>
  );
}

export default TechMarquee;
