import { useEffect, useRef, useState } from "react";

import "../styles/projects.css";
import { FiChevronLeft, FiChevronRight, FiArrowUpRight } from "react-icons/fi";
import { gsap, useGSAP, animateSectionIntro, prefersReducedMotion } from "../lib/gsap";

import financeControl from "../assets/finance-control.webp";
import emBreve from "../assets/emBreve.png";
import thoughts from "../assets/thoughts.webp";

function Projects() {
  const projects = [
    {
      title: "Finance Control",
      image: financeControl,
      technologies: ["React", "Node.js", "MySQL"],
      // github:"https://github.com/matheusmz12/thoughts-react"
      //   description:"Sistema de controle financeiro com autenticação, transações e dashboard"
    },

    {
      title: "Thoughts",
      image: thoughts,
      technologies: ["React", "MySQL", "Node.js"],
      github: "https://github.com/matheusmz12/thoughts-react",
      //   description:"Aplicação para publicação e interação de pensamentos, desenvolvida com React"
    },

    {
      title: "projeto 3",
      image: emBreve,
      technologies: ["React", "MySQL", "Node.js"],
      github: "https://github.com/matheusmz12/thoughts-react",
      //   description:"Aplicação para publicação e interação de pensamentos, desenvolvida com React"
    },
  
  ];

  const sectionRef = useRef(null);
  const projectsRef = useRef(null);
  const progressRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Avança ou volta exatamente um card (largura do card + gap).
  // Animado com GSAP: o scroll suave nativo não é confiável junto com scroll-snap.
  const scrollByCard = (direction) => {
    const list = projectsRef.current;
    const card = list.firstElementChild;
    const step = card.offsetWidth + (parseFloat(getComputedStyle(list).columnGap) || 0);
    const max = list.scrollWidth - list.clientWidth;
    const index = Math.round(list.scrollLeft / step) + direction;
    const target = gsap.utils.clamp(0, max, index * step);

    list.style.scrollSnapType = "none";
    gsap.to(list, {
      scrollLeft: target,
      duration: prefersReducedMotion() ? 0 : 0.6,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => {
        list.style.scrollSnapType = "";
      },
    });
  };

  // Atualiza a barra de progresso e desativa as setas nas pontas
  const handleScroll = () => {
    const list = projectsRef.current;
    const max = list.scrollWidth - list.clientWidth;
    const progress = max > 0 ? list.scrollLeft / max : 1;
    progressRef.current.style.transform = `scaleX(${Math.max(progress, 0.05)})`;
    setEdges({ start: list.scrollLeft <= 4, end: list.scrollLeft >= max - 4 });
  };

  useEffect(handleScroll, []);

  // Setas do teclado quando o foco está no carrossel
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") scrollByCard(1);
    if (e.key === "ArrowLeft") scrollByCard(-1);
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const stopIntro = animateSectionIntro(sectionRef.current);

      // Cards entram em cascata
      gsap.from(".img-port", {
        autoAlpha: 0,
        x: 60,
        stagger: 0.1,
        duration: 0.9,
        scrollTrigger: { trigger: projectsRef.current, start: "top 85%" },
      });

      // Cards inclinam em 3D seguindo o mouse, com um reflexo de luz
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.utils.toArray(".img-port").forEach((card) => {
          gsap.set(card, { transformPerspective: 900 });
          const rotX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
          const rotY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });

          card.addEventListener("pointermove", (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            rotY((px - 0.5) * 12);
            rotX((0.5 - py) * 10);
            card.style.setProperty("--gx", `${px * 100}%`);
            card.style.setProperty("--gy", `${py * 100}%`);
          });
          card.addEventListener("pointerleave", () => {
            rotX(0);
            rotY(0);
          });
        });
      }

      return stopIntro;
    },
    { scope: sectionRef }
  );

  return (
    <section className="section projects" id="projetos" ref={sectionRef}>
      <div className="container">
        <div className="projects-header">
          <div>
            <p className="section-label" data-index="03">Meus projetos</p>

            <h2 className="section-title">
              Projetos que <span>ganham vida.</span>
            </h2>
          </div>

          <div className="carousel">
            <button className="carousel-btn" onClick={() => scrollByCard(-1)} disabled={edges.start} aria-label="Projeto anterior">
              <FiChevronLeft />
            </button>
            <button className="carousel-btn" onClick={() => scrollByCard(1)} disabled={edges.end} aria-label="Próximo projeto">
              <FiChevronRight />
            </button>
          </div>
        </div>

        <div className="projects-viewport">
          <ul
            className="projects-list"
            ref={projectsRef}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="Lista de projetos (use as setas para navegar)"
          >
            {projects.map((project, index) => (
              <li
                className="img-port"
                key={project.title}
                style={{ backgroundImage: `url(${project.image})` }}
              >
                <span className="project-number">{String(index + 1).padStart(2, "0")}</span>

                <div className="overlay">
                  <h3>{project.title}</h3>

                  <div className="technologies">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>

                  {project.github ? (
                    <a href={project.github} target="_blank" rel="noreferrer">
                      Ver projeto <FiArrowUpRight aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="project-soon">Em breve</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="projects-progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>
      </div>
    </section>
  );
}

export default Projects;
