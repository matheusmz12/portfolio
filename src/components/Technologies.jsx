import { useRef } from "react";
import "../styles/technologies.css";
import { gsap, useGSAP, animateSectionIntro, prefersReducedMotion } from "../lib/gsap";

import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs } from "react-icons/fa";
import { SiMysql } from "react-icons/si";

const technologies = [
  { name: "React", area: "Frontend", icon: FaReact },
  { name: "JavaScript", area: "Linguagem", icon: FaJs },
  { name: "HTML5", area: "Markup", icon: FaHtml5 },
  { name: "CSS", area: "Estilo", icon: FaCss3Alt },
  { name: "Node.js", area: "Backend", icon: FaNodeJs },
  { name: "MySQL", area: "Banco de dados", icon: SiMysql },
];

// Luz que segue o cursor dentro da grade
const handlePointerMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
};

function Technologies() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const stopIntro = animateSectionIntro(sectionRef.current);

      gsap.from(".tech-card", {
        autoAlpha: 0,
        y: 24,
        stagger: { each: 0.07, grid: "auto", from: "start" },
        scrollTrigger: { trigger: ".technologies-list", start: "top 85%" },
      });

      return stopIntro;
    },
    { scope: sectionRef }
  );

  return (
    <section className="section technologies-section" id="tecnologias" ref={sectionRef}>
      <div className="container">
        <div className="tech-header">
          <div>
            <p className="section-label" data-index="02">Tecnologias</p>

            <h2 className="section-title">
              Ferramentas que <span>utilizo.</span>
            </h2>

            <p className="section-description">
              Tecnologias e ferramentas que utilizo para desenvolver aplicações web
              e transformar ideias em projetos reais.
            </p>
          </div>

          {/* Âncora do "</>" de partículas (ParticleBackground) */}
          <div className="tech-visual" data-shape="code" aria-hidden="true" />
        </div>

        <ul className="technologies-list" onPointerMove={handlePointerMove}>
          {technologies.map(({ name, area, icon: Icon }, index) => (
            <li key={name} className="tech-card">
              <span className="tech-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon className="tech-icon" aria-hidden="true" />
              <div>
                <h3>{name}</h3>
                <p>{area}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Technologies;
