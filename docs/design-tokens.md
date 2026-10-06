# Design tokens — Portfólio Matheus.dev

Os tokens ficam em `src/index.css` (`:root`). Todo valor visual novo deve usar um token. Se o valor não existir, crie o token primeiro.

## Recurso adotado
- **Tipografia e espaçamento fluidos (Utopia)**: escalas com `clamp()` entre 360px e 1440px, sem media queries para tamanho de fonte.
- Nenhuma biblioteca nova foi instalada.

## Identidade (mantida)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#050b19` | Fundo do site |
| `--brand` | `#2864ff` | Azul da marca: destaques, CTAs, labels |
| `--brand-hover` | `#4a7dff` | Hover do azul (antes eram 4 tons diferentes) |
| Fonte | Source Code Pro | Única família usada |

## Superfícies e texto
`--surface-1`, `--surface-2`, `--border-subtle`, `--border`, `--border-strong`, `--text`, `--text-soft`, `--text-muted`.
Substituem cerca de 12 hexadecimais soltos que existiam antes.

## Escalas
- **Espaçamento:** `--space-2xs` … `--space-3xl`
- **Tipografia:** `--step--1` … `--step-5`
- **Raio:** `--radius-s` 8 · `--radius-m` 12 · `--radius-l` 24 · `--radius-full`
- **Movimento:** `--ease-out` (cubic-bezier .22,1,.36,1), `--dur-fast` 150ms, `--dur` 200ms

## Padrões compartilhados
`.section`, `.container`, `.section-label[data-index]`, `.section-title`, `.section-description`, `.btn` / `.btn-primary` / `.btn-ghost`, `.reveal` + o hook `useReveal()`.

## Movimento (bibliotecas)
| Biblioteca | Onde | Papel |
|---|---|---|
| Three.js | `src/three/waveField.js` + `HeroBackground.jsx` | Campo de partículas no hero, reage ao mouse. Carregado sob demanda (chunk separado). Pausa fora da tela. |
| GSAP + ScrollTrigger + SplitText | `src/lib/gsap.js` e `useGSAP` em cada seção | Entrada do hero letra a letra, títulos linha a linha, projetos com rolagem horizontal fixada, botões magnéticos |
| Lenis | `src/lib/smoothScroll.js` | Rolagem suave sincronizada com o ticker do GSAP; links âncora descontam o header |

Regras:
- Toda animação nova usa `useGSAP` com `scope` (limpeza automática).
- Todo efeito checa `prefersReducedMotion()`; com movimento reduzido, o site fica estático e o fundo 3D é desenhado só uma vez.
- Não usar Motion (Framer) junto com o GSAP, porque as duas fazem a mesma coisa.

## Fundo 3D com formas (DT-003)
- `src/three/particleScene.js`: um canvas fixo atrás do site com duas camadas (ondas no hero e a forma de partículas).
- A forma segue elementos-âncora com `data-shape`: `sphere` (hero), `code` (Tecnologias, desenha "</>") e `mono` (Contato, desenha "MM"). Para mudar onde ela aparece, mude o CSS da âncora.
- Para trocar o texto de uma forma, edite `textFrom("</>")` / `textFrom("MM")`.

## Interações (DT-003)
- `scrambleText()` em `lib/gsap.js`: títulos que "decodificam".
- `Cursor.jsx`: anel que segue o mouse (só em computador).
- Projetos: cards inclinam em 3D com reflexo de luz.
- `TechMarquee.jsx`: faixa infinita que acelera com a rolagem.
- Header some ao rolar para baixo.

## Esfera respirando e estrelas (DT-006)
- `src/three/particleScene.js`: canvas fixo atrás do site com um campo de estrelas (paralaxe no mouse e na rolagem) e uma esfera de partículas que gira devagar e "respira" no hero.
- A esfera segue a âncora `data-shape="sphere"` (`.hero-visual`) e, ao rolar, vira o "</>" (`data-shape="code"`) e o "MM" (`data-shape="mono"`).
- Ajustes rápidos no topo do arquivo: `SPHERE_RADIUS` (tamanho) e `SPHERE_TILT` (inclinação). A respiração fica no vertex shader (`breath` e `wobble`).
- Títulos: `scrambleOnView()` decodifica de novo sempre que o título sai da tela e volta (0,5s nas repetições) e ao passar o mouse.

## Histórico
- **DT-006 — Esfera de partículas "respirando" no lugar da galáxia (2026-10-05).**
- **DT-005 — Galáxia espiral e campo de estrelas no lugar da árvore de commits (2026-10-05).**
- **DT-004 — Decodificação repetida dos títulos (2026-10-05).**
- **DT-003 — Formas de partículas e interações (2026-10-05):** a foto saiu do hero e foi para o "Sobre"; as setas do carrossel voltaram e o travamento de rolagem foi removido.
- **DT-002 — Camada de movimento (2026-10-05):** Three.js, GSAP e Lenis adicionados; o `useReveal` foi substituído por ScrollTrigger.
- **DT-001 — Auditoria anti-vibecode (2026-10-05):** tokens criados, tipografia fluida, foco visível, `prefers-reduced-motion` e correções de acessibilidade e links.
