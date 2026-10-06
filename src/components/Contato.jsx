import { useRef, useState } from "react";
import "../styles/contato.css";
import { gsap, useGSAP, animateSectionIntro, prefersReducedMotion } from "../lib/gsap";

// Endpoint do Formspree: as mensagens chegam no e-mail cadastrado na conta
const FORM_URL = "https://formspree.io/f/xeaeqbne";

const MESSAGES = {
  sending: "Enviando…",
  success: "Mensagem enviada! Vou responder assim que possível.",
  error: "Não foi possível enviar agora. Tente de novo em instantes.",
};

function Contato() {
  const sectionRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const stopIntro = animateSectionIntro(sectionRef.current);

      gsap.from(".form .field, .form .btn", {
        autoAlpha: 0,
        y: 20,
        stagger: 0.08,
        scrollTrigger: { trigger: ".form", start: "top 85%" },
      });

      return stopIntro;
    },
    { scope: sectionRef }
  );

  // Envia sem recarregar a página e mostra o resultado ao lado do botão
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    setStatus("sending");

    try {
      const response = await fetch(FORM_URL, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Formspree respondeu ${response.status}`);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  // Ao editar o formulário de novo, some a mensagem de resultado anterior
  const clearStatus = () => {
    if (status === "success" || status === "error") setStatus("idle");
  };

  return (
    <section className="section contato" id="contato" ref={sectionRef}>
      <div className="container contato-container">
        <div className="contato-content">
          <p className="section-label" data-index="04">Contato</p>

          <h2 className="section-title">
            Vamos <span>conversar.</span>
          </h2>

          <p className="section-description">
            Tem um projeto em mente? Entre em contato comigo e vamos conversar.
          </p>

          {/* Âncora do "MM" de partículas (ParticleBackground) */}
          <div className="contato-visual" data-shape="mono" aria-hidden="true" />
        </div>

        <form className="form" action={FORM_URL} method="POST" onSubmit={handleSubmit} onInput={clearStatus}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="nome">Nome</label>
              <input id="nome" type="text" name="nome" placeholder="Seu nome" autoComplete="name" required />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" name="email" placeholder="voce@email.com" autoComplete="email" required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="mensagem">Mensagem</label>
            <textarea id="mensagem" name="mensagem" placeholder="Conte um pouco sobre a ideia…" required />
          </div>

          {/* Assunto do e-mail recebido e campo-armadilha contra spam (Formspree) */}
          <input type="hidden" name="_subject" value="Nova mensagem pelo portfólio" />
          <input type="text" name="_gotcha" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <div className="form-footer">
            <p className={`form-status is-${status}`} role="status" aria-live="polite">
              {MESSAGES[status] ?? ""}
            </p>

            <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
              {status === "sending" ? "Enviando…" : "Enviar mensagem"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Contato;
