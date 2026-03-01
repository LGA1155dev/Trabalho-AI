/* ================= DADOS ================= */
const categorias = [
  "IMAGENS", "EXPLICAÇÃO", "TAREFAS", "RESUMO", "TRABALHOS", "CORRIGIR_TEXTOS"
];

const ias = {
  copilot: { nome: "Copilot", img: "../imagens/copilot-logo.png", notas: [6, 9, 9, 8, 8, 9] },
  chatgpt: { nome: "ChatGPT", img: "../imagens/logo-chatgpt.png", notas: [8, 8, 9, 8, 8, 9] },
  gemini: { nome: "Gemini", img: "../imagens/logo-gemini.png", notas: [10, 9, 9, 9, 8, 7] },
  meta: { nome: "Meta AI", img: "../imagens/meta-ai-logo.png", notas: [6, 8, 7, 8, 6, 7] },
  deepseek: { nome: "DeepSeek", img: "../imagens/deepseek-logo.png", notas: [7, 7, 8, 7, 9, 8] }
};

const iaIds = Object.keys(ias);

/* ================= DOM ================= */
const iaCards = document.querySelectorAll(".ia-card");
const slots = document.querySelectorAll(".drop-zone");
const botao = document.getElementById("confirmar");
const btnReset = document.getElementById("resetar");
const btnAleatorio = document.getElementById("aleatorio");
const resultado = document.getElementById("resultadoFinal");
const victoryOverlay = document.getElementById("victoryOverlay");
const victoryTitle = document.getElementById("victoryTitle");
const victorySubtitle = document.getElementById("victorySubtitle");
const victoryStats = document.getElementById("victoryStats");
const closeVictory = document.getElementById("closeVictory");
const battleZone = document.querySelector(".battle-zone");
const historicoLista = document.getElementById("historicoLista");
const ghost = document.getElementById("dragGhost");
const hoverOverlay = document.getElementById("hoverOverlay");
const cursorGlow = document.getElementById("cursorGlow");

let estado = { slot1: null, slot2: null };
let historico = [];

/* ================= HOVER — Clareia ao passar mouse ================= */
let isTouchDevice = !window.matchMedia("(hover: hover)").matches;

function initHover() {
  if (isTouchDevice) return;
  document.body.classList.add("has-hover");

  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    hoverOverlay.style.setProperty("--mouse-x", `${x}%`);
    hoverOverlay.style.setProperty("--mouse-y", `${y}%`);
    if (cursorGlow) {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
    }
  });
}

/* ================= HAPTIC ================= */
function haptic(type = "light") {
  if ("vibrate" in navigator) navigator.vibrate(type === "heavy" ? [50, 30, 50] : 20);
}

/* ================= COLOCAR IA NO SLOT ================= */
function colocar(slot, id) {
  const ia = ias[id];
  const placeholder = slot.querySelector(".slot-placeholder");
  const content = slot.querySelector(".card-content");

  content.innerHTML = `
    <div class="card-ia-img">
      <img src="${ia.img}" alt="${ia.nome}" onerror="this.parentElement.innerHTML='<span class=ia-fallback>${ia.nome.slice(0,2)}</span>'">
    </div>
    <h3>${ia.nome}</h3>
    <div class="comparacao"></div>
  `;

  if (placeholder) placeholder.classList.add("hidden");
  slot.classList.add("has-content");

  if (slot.id === "slot1") estado.slot1 = id;
  else estado.slot2 = id;

  botao.disabled = !(estado.slot1 && estado.slot2);
  updateSelectedCards();
  haptic();

  if (window.gsap) {
    gsap.from(content, { scale: 0.5, opacity: 0, duration: 0.4, ease: "back.out(1.7)" });
  }
}

function updateSelectedCards() {
  iaCards.forEach(card => {
    const id = card.dataset.id;
    card.classList.toggle("selected", estado.slot1 === id || estado.slot2 === id);
  });
}

/* ================= RESET ================= */
function resetar() {
  estado = { slot1: null, slot2: null };
  slots.forEach(slot => {
    const placeholder = slot.querySelector(".slot-placeholder");
    const content = slot.querySelector(".card-content");
    content.innerHTML = "";
    if (placeholder) placeholder.classList.remove("hidden");
    slot.classList.remove("has-content", "campeao");
  });
  resultado.innerHTML = "";
  botao.disabled = true;
  updateSelectedCards();
  victoryOverlay.classList.remove("show");
  haptic();
}

/* ================= DUELO ALEATÓRIO ================= */
function dueloAleatorio() {
  resetar();
  const arr = [...iaIds].sort(() => Math.random() - 0.5);
  colocar(slots[0], arr[0]);
  colocar(slots[1], arr[1]);
  haptic("heavy");
}

/* ================= CONFETTI ================= */
function explodirConfete(cores = ["#0ea5e9", "#38bdf8", "#22c55e"]) {
  if (typeof confetti !== "function") return;
  const count = 200;
  const def = { origin: { y: 0.6 }, colors: cores };
  confetti({ ...def, particleCount: count });
  confetti({ ...def, particleCount: count, spread: 100, startVelocity: 35 });
  confetti({ ...def, particleCount: count, spread: 70, angle: 60 });
  confetti({ ...def, particleCount: count, spread: 70, angle: 120 });
  setTimeout(() => confetti({ ...def, particleCount: 60, scalar: 1.2, shapes: ["star"] }), 150);
}

/* ================= SCREEN SHAKE ================= */
function screenShake() {
  if (window.gsap && battleZone) {
    gsap.fromTo(battleZone, { x: 0 }, { x: "-=12", duration: 0.04, repeat: 6, yoyo: true });
  }
}

/* ================= VITÓRIA ÉPICA ================= */
function mostrarVitoria(vencedor, empate = false, p1 = 0, p2 = 0) {
  if (empate) {
    victoryTitle.textContent = "EMPATE";
    victorySubtitle.textContent = "As duas IAs estão no mesmo nível.";
    victoryStats.textContent = "";
  } else {
    victoryTitle.textContent = `${vencedor} VENCEU!`;
    victorySubtitle.textContent = "Campeão do duelo";
    victoryStats.textContent = "";
  }
  victoryOverlay.classList.add("show");
  explodirConfete(empate ? ["#64748b", "#94a3b8"] : ["#22c55e", "#0ea5e9", "#38bdf8"]);
  haptic("heavy");
  screenShake();

  if (window.gsap) {
    const content = victoryOverlay.querySelector(".victory-content");
    gsap.fromTo(content, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
  }
}

/* ================= COMPARAR ================= */
async function comparar() {
  if (!estado.slot1 || !estado.slot2) return;

  botao.disabled = true;
  haptic("heavy");

  const c1 = slots[0].querySelector(".comparacao");
  const c2 = slots[1].querySelector(".comparacao");
  c1.innerHTML = "";
  c2.innerHTML = "";
  resultado.innerHTML = "";
  slots.forEach(s => s.classList.remove("campeao"));

  let p1 = 0, p2 = 0;

  if (window.gsap) {
    const vs = document.querySelector(".versus-glow");
    gsap.to(vs, { scale: 1.4, opacity: 0.6, duration: 0.15 });
    gsap.to(vs, { scale: 1, opacity: 1, duration: 0.25, delay: 0.15 });
  }

  for (let i = 0; i < categorias.length; i++) {
    const cat = categorias[i];
    const v1 = ias[estado.slot1].notas[i];
    const v2 = ias[estado.slot2].notas[i];

    let classe1 = "", classe2 = "", tipo1 = "tie", tipo2 = "tie";
    if (v1 > v2) { p1++; classe1 = "vencedor"; classe2 = "perdedor"; tipo1 = "win"; tipo2 = "lose"; }
    else if (v2 > v1) { p2++; classe2 = "vencedor"; classe1 = "perdedor"; tipo2 = "win"; tipo1 = "lose"; }

    const div1 = document.createElement("div");
    div1.className = "progress-row";
    div1.innerHTML = `<div class="cat-name ${classe1}">${cat} <span>${v1}/10</span></div><div class="progress-bar-wrap"><div class="progress-fill ${tipo1}" style="width:0%"></div></div>`;
    const div2 = document.createElement("div");
    div2.className = "progress-row";
    div2.innerHTML = `<div class="cat-name ${classe2}">${cat} <span>${v2}/10</span></div><div class="progress-bar-wrap"><div class="progress-fill ${tipo2}" style="width:0%"></div></div>`;

    c1.appendChild(div1);
    c2.appendChild(div2);

    if (window.gsap) {
      gsap.to(div1.querySelector(".progress-fill"), { width: `${v1 * 10}%`, duration: 0.5, ease: "power2.out" });
      gsap.to(div2.querySelector(".progress-fill"), { width: `${v2 * 10}%`, duration: 0.5, ease: "power2.out" });
    } else {
      div1.querySelector(".progress-fill").style.width = `${v1 * 10}%`;
      div2.querySelector(".progress-fill").style.width = `${v2 * 10}%`;
    }
    await new Promise(r => setTimeout(r, 350));
  }

  await new Promise(r => setTimeout(r, 400));

  if (p1 > p2) {
    slots[0].classList.add("campeao");
    resultado.innerHTML = `${ias[estado.slot1].nome} venceu!`;
    historico.unshift({ vencedor: ias[estado.slot1].nome, perdedor: ias[estado.slot2].nome });
    mostrarVitoria(ias[estado.slot1].nome, false, p1, p2);
  } else if (p2 > p1) {
    slots[1].classList.add("campeao");
    resultado.innerHTML = `${ias[estado.slot2].nome} venceu!`;
    historico.unshift({ vencedor: ias[estado.slot2].nome, perdedor: ias[estado.slot1].nome });
    mostrarVitoria(ias[estado.slot2].nome, false, p1, p2);
  } else {
    resultado.innerHTML = "Empate";
    historico.unshift({ vencedor: null, perdedor: null });
    mostrarVitoria(null, true);
  }

  historico = historico.slice(0, 5);
  renderHistorico();
  botao.disabled = false;
}

function renderHistorico() {
  if (!historicoLista) return;
  historicoLista.innerHTML = historico.length ? historico.map(h => 
    h.vencedor ? `<li>${h.vencedor} venceu ${h.perdedor}</li>` : `<li>Empate</li>`
  ).join("") : `<li class="historico-empty">Nenhum duelo ainda</li>`;
}

/* ================= DRAG — DESKTOP ================= */
iaCards.forEach(card => {
  const imgWrap = card.querySelector(".ia-img-wrap");
  const img = card.querySelector("img");

  if (img) {
    img.setAttribute("draggable", "true");
    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("id", card.dataset.id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(img, img.clientWidth / 2, img.clientHeight / 2);
      card.classList.add("dragging");
    });
  }

  card.addEventListener("dragend", () => card.classList.remove("dragging"));

  card.addEventListener("click", () => {
    const id = card.dataset.id;
    if (!estado.slot1) colocar(slots[0], id);
    else if (!estado.slot2) colocar(slots[1], id);
    else if (estado.slot1 === id || estado.slot2 === id) {
      const slot = estado.slot1 === id ? slots[0] : slots[1];
      const key = slot.id === "slot1" ? "slot1" : "slot2";
      estado[key] = null;
      slot.querySelector(".card-content").innerHTML = "";
      slot.querySelector(".slot-placeholder")?.classList.remove("hidden");
      slot.classList.remove("has-content", "campeao");
      botao.disabled = !(estado.slot1 && estado.slot2);
      updateSelectedCards();
    } else colocar(slots[0], id);
  });
});

slots.forEach(slot => {
  slot.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    slot.classList.add("drag-over");
  });
  slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
  slot.addEventListener("drop", (e) => {
    e.preventDefault();
    slot.classList.remove("drag-over");
    const id = e.dataTransfer.getData("id");
    if (id) colocar(slot, id);
  });
});

/* ================= DRAG — MOBILE (touch) ================= */
let touchStart = null, touchDragging = null;

iaCards.forEach(card => {
  card.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, id: card.dataset.id };
    touchDragging = null;
  }, { passive: true });

  card.addEventListener("touchmove", (e) => {
    if (!touchStart || e.touches.length !== 1) return;
    const dx = Math.abs(e.touches[0].clientX - touchStart.x);
    const dy = Math.abs(e.touches[0].clientY - touchStart.y);
    if (dx > 15 || dy > 15) {
      if (!touchDragging) {
        touchDragging = touchStart.id;
        const src = ias[touchStart.id]?.img;
        if (ghost && src) {
          ghost.innerHTML = `<img src="${src}" alt="">`;
          ghost.classList.add("visible");
        }
      }
      if (touchDragging) {
        e.preventDefault();
        if (ghost) {
          ghost.style.left = e.touches[0].clientX + "px";
          ghost.style.top = e.touches[0].clientY + "px";
        }
      }
    }
  }, { passive: false });

  card.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    if (touchDragging && ghost) {
      ghost.classList.remove("visible");
      const x = e.changedTouches[0].clientX;
      const y = e.changedTouches[0].clientY;
      slots.forEach(slot => {
        const rect = slot.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          colocar(slot, touchDragging);
        }
      });
    }
    touchStart = null;
    touchDragging = null;
  }, { passive: true });
});

document.addEventListener("touchmove", (e) => {
  if (touchDragging && ghost && e.touches[0]) {
    ghost.style.left = e.touches[0].clientX + "px";
    ghost.style.top = e.touches[0].clientY + "px";
  }
});

/* ================= EVENTOS ================= */
botao.addEventListener("click", comparar);
btnReset.addEventListener("click", resetar);
btnAleatorio?.addEventListener("click", dueloAleatorio);
closeVictory.addEventListener("click", () => {
  victoryOverlay.classList.remove("show");
  haptic();
});

/* ================= INICIALIZAÇÃO ================= */
initHover();
renderHistorico();

if (window.gsap) {
  gsap.from(".header-glow h1", { y: -24, opacity: 0, duration: 0.5, ease: "power2.out" });
  gsap.from(".ia-card", { y: 16, opacity: 0, duration: 0.4, stagger: 0.06, delay: 0.15 });
  gsap.from(".battle-zone", { y: 24, opacity: 0, duration: 0.5, delay: 0.3 });
}
