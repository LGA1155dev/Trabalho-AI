;(function () {
  const CATEGORIAS = ["IMAGENS", "EXPLICAÇÃO", "TAREFAS", "RESUMO", "TRABALHOS", "CORRIGIR_TEXTOS"]

  const IAS = {
    copilot: { nome: "Copilot", img: "../imagens/copilot-logo.png", notas: [6, 9, 9, 8, 8, 9] },
    chatgpt: { nome: "ChatGPT", img: "../imagens/logo-chatgpt.png", notas: [8, 8, 9, 8, 8, 9] },
    gemini: { nome: "Gemini", img: "../imagens/logo-gemini.png", notas: [10, 9, 9, 9, 8, 7] },
    meta: { nome: "Meta AI", img: "../imagens/meta-ai-logo.png", notas: [6, 8, 7, 8, 6, 7] },
    deepseek: { nome: "DeepSeek", img: "../imagens/deepseek-logo.png", notas: [7, 7, 8, 7, 9, 8] }
  }

  const iaCards = document.querySelectorAll(".ia-card")
  const dropZones = document.querySelectorAll(".drop-zone")
  const slotLeft = document.getElementById("slot1")
  const slotRight = document.getElementById("slot2")
  const btnDuel = document.getElementById("confirmar")
  const btnRandom = document.getElementById("aleatorio")
  const btnReset = document.getElementById("resetar")
  const resultadoFinal = document.getElementById("resultadoFinal")
  const historicoLista = document.getElementById("historicoLista")

  const modePills = document.querySelectorAll(".mode-pill")
  const battleZone = document.querySelector(".battle-zone")
  const modeHint = document.getElementById("modeHint")

  const chatLab = document.getElementById("chatLab")
  const chatAvatarLeft = document.getElementById("chatAvatarLeft")
  const chatAvatarRight = document.getElementById("chatAvatarRight")
  const chatNameLeft = document.getElementById("chatNameLeft")
  const chatNameRight = document.getElementById("chatNameRight")
  const chatTagLeft = document.getElementById("chatTagLeft")
  const chatTagRight = document.getElementById("chatTagRight")
  const chatScoreLeft = document.getElementById("chatScoreLeft")
  const chatScoreRight = document.getElementById("chatScoreRight")
  const chatBodyLeft = document.getElementById("chatBodyLeft")
  const chatBodyRight = document.getElementById("chatBodyRight")
  const typingLeft = document.getElementById("typingLeft")
  const typingRight = document.getElementById("typingRight")
  const chatInput = document.getElementById("chatInput")
  const chatSend = document.getElementById("chatSend")

  const victoryOverlay = document.getElementById("victoryOverlay")
  const victoryTitle = document.getElementById("victoryTitle")
  const victorySubtitle = document.getElementById("victorySubtitle")
  const victoryStats = document.getElementById("victoryStats")
  const closeVictory = document.getElementById("closeVictory")
  const confettiCanvas = document.getElementById("confettiCanvas")
  const dragGhost = document.getElementById("dragGhost")

  const hoverOverlay = document.getElementById("hoverOverlay")
  const cursorGlow = document.getElementById("cursorGlow")

  const state = {
    mode: "1v1",
    solo: {
      left: null,
      right: null
    },
    teams: {
      left: [],
      right: []
    },
    history: [],
    chat: {
      leftIaId: null,
      rightIaId: null,
      messages: []
    }
  }

  let draggingId = null
  let dragStart = { x: 0, y: 0 }
  let isDragging = false

  function init() {
    if (!iaCards.length || !slotLeft || !slotRight) return

    setupPointerEffects()
    setupModes()
    setupIaCards()
    setupButtons()
    setupVictoryOverlay()
    setupChat()
    renderBattle()
    syncCardSelection()
    updateDuelButton()
  }

  function setupPointerEffects() {
    if (!hoverOverlay || !cursorGlow) return

    const hasHover = window.matchMedia && window.matchMedia("(hover:hover)").matches
    if (hasHover) {
      document.body.classList.add("has-hover")
    }

    window.addEventListener("pointermove", (e) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty("--mouse-x", `${x}%`)
      document.documentElement.style.setProperty("--mouse-y", `${y}%`)

      cursorGlow.style.left = `${e.clientX}px`
      cursorGlow.style.top = `${e.clientY}px`
    })
  }

  function setupModes() {
    modePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const mode = pill.dataset.mode === "2v2" ? "2v2" : "1v1"
        if (state.mode === mode) return
        state.mode = mode

        modePills.forEach((p) => p.classList.remove("is-active"))
        pill.classList.add("is-active")

        if (battleZone) battleZone.dataset.mode = mode

        if (modeHint) {
          modeHint.textContent =
            mode === "1v1"
              ? "Selecione duas IAs para um confronto direto, ideal para comparações rápidas."
              : "Monte dois times com até 2 IAs de cada lado e veja qual combinação domina a arena."
        }

        clearWinnerHighlight()
        renderBattle()
        syncCardSelection()
        updateDuelButton()
        updateChatBindingsFromSelection()
        clearChatMessages()
      })
    })
  }

  function setupIaCards() {
    iaCards.forEach((card) => {
      const id = card.dataset.id
      if (!IAS[id]) return

      card.addEventListener("pointerdown", (e) => handleCardPointerDown(e, id, card))
    })
  }

  function setupButtons() {
    if (btnDuel) {
      btnDuel.addEventListener("click", () => {
        const selection = getBattleSelection()
        if (!selection) return
        iniciarDuelo(selection)
      })
    }

    if (btnRandom) {
      btnRandom.addEventListener("click", dueloAleatorio)
    }

    if (btnReset) {
      btnReset.addEventListener("click", resetarArena)
    }
  }

  function setupVictoryOverlay() {
    if (!victoryOverlay || !closeVictory) return

    closeVictory.addEventListener("click", fecharOverlayVitoria)
    victoryOverlay.addEventListener("click", (e) => {
      if (e.target === victoryOverlay) fecharOverlayVitoria()
    })
  }

  function setupChat() {
    if (!chatLab || !chatInput || !chatSend) return

    chatSend.addEventListener("click", handleChatSend)
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleChatSend()
      }
    })

    updateChatBindingsFromSelection()
  }

  function handleCardPointerDown(e, iaId, card) {
    draggingId = iaId
    dragStart = { x: e.clientX, y: e.clientY }
    isDragging = false

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp, { once: true })

    function onPointerMove(ev) {
      if (!draggingId) return

      const dx = ev.clientX - dragStart.x
      const dy = ev.clientY - dragStart.y
      const dist = Math.hypot(dx, dy)

      if (!isDragging && dist > 8) {
        isDragging = true
        iniciarDragVisual(card, ev.clientX, ev.clientY)
      }

      if (isDragging) {
        ev.preventDefault()
        atualizarDragVisual(ev.clientX, ev.clientY)
      }
    }

    function onPointerUp(ev) {
      window.removeEventListener("pointermove", onPointerMove)

      const finalId = draggingId
      const estavaArrastando = isDragging

      finalizarDragVisual()
      draggingId = null
      isDragging = false

      const alvo = document.elementFromPoint(ev.clientX, ev.clientY)
      const zona = alvo && alvo.closest && alvo.closest(".drop-zone")

      if (estavaArrastando && zona && finalId) {
        const side = zona.id === "slot1" ? "left" : "right"
        aplicarSelecao(side, finalId)
        return
      }

      if (!estavaArrastando && finalId) {
        const side = state.mode === "1v1" ? undefined : getClosestSide(ev.clientX, ev.clientY)
        selecionarPorClique(finalId, side)
      }
    }
  }

  function iniciarDragVisual(card, x, y) {
    if (!dragGhost) return
    dragGhost.innerHTML = card.innerHTML
    dragGhost.classList.add("visible")
    dragGhost.style.left = `${x}px`
    dragGhost.style.top = `${y}px`
  }

  function atualizarDragVisual(x, y) {
    if (!dragGhost) return
    dragGhost.style.left = `${x}px`
    dragGhost.style.top = `${y}px`

    dropZones.forEach((z) => z.classList.remove("drop-hover"))
    const alvo = document.elementFromPoint(x, y)
    const zona = alvo && alvo.closest && alvo.closest(".drop-zone")
    if (zona) zona.classList.add("drop-hover")
  }

  function finalizarDragVisual() {
    if (!dragGhost) return
    dragGhost.classList.remove("visible")
    dropZones.forEach((z) => z.classList.remove("drop-hover"))
  }

  function getClosestSide(x, y) {
    if (!slotLeft || !slotRight) return "left"
    const r1 = slotLeft.getBoundingClientRect()
    const r2 = slotRight.getBoundingClientRect()
    const c1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 }
    const c2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 }
    const d1 = Math.hypot(x - c1.x, y - c1.y)
    const d2 = Math.hypot(x - c2.x, y - c2.y)
    return d1 <= d2 ? "left" : "right"
  }

  function selecionarPorClique(iaId, sideHint) {
    if (state.mode === "1v1") {
      if (!state.solo.left) {
        aplicarSelecao("left", iaId)
      } else if (!state.solo.right && state.solo.left !== iaId) {
        aplicarSelecao("right", iaId)
      } else if (state.solo.left === iaId || state.solo.right === iaId) {
        removerIaDeSelecao(iaId)
      } else {
        aplicarSelecao("right", iaId)
      }
      return
    }

    const side = sideHint || "left"
    aplicarSelecao(side, iaId)
  }

  function aplicarSelecao(side, iaId) {
    if (!IAS[iaId]) return

    if (state.mode === "1v1") {
      state.solo[side] = iaId
      if (side === "left" && state.solo.right === iaId) state.solo.right = null
      if (side === "right" && state.solo.left === iaId) state.solo.left = null
    } else {
      removerIaDeTimes(iaId)
      const team = side === "left" ? state.teams.left : state.teams.right
      if (!team.includes(iaId)) {
        if (team.length < 2) {
          team.push(iaId)
        } else {
          team[1] = iaId
        }
      }
    }

    clearWinnerHighlight()
    renderBattle()
    syncCardSelection()
    updateDuelButton()
    updateChatBindingsFromSelection()
  }

  function removerIaDeSelecao(iaId) {
    if (state.mode === "1v1") {
      if (state.solo.left === iaId) state.solo.left = null
      if (state.solo.right === iaId) state.solo.right = null
    } else {
      removerIaDeTimes(iaId)
    }
    clearWinnerHighlight()
    renderBattle()
    syncCardSelection()
    updateDuelButton()
    updateChatBindingsFromSelection()
  }

  function removerIaDeTimes(iaId) {
    state.teams.left = state.teams.left.filter((id) => id !== iaId)
    state.teams.right = state.teams.right.filter((id) => id !== iaId)
  }

  function renderBattle() {
    renderSide(slotLeft, "left")
    renderSide(slotRight, "right")
  }

  function renderSide(container, side) {
    if (!container) return
    const placeholder = container.querySelector(".slot-placeholder")
    const content = container.querySelector(".card-content")
    if (!placeholder || !content) return

    let hasSelection = false

    if (state.mode === "1v1") {
      const iaId = side === "left" ? state.solo.left : state.solo.right
      if (!iaId) {
        placeholder.classList.remove("hidden")
        content.innerHTML = ""
        container.classList.remove("filled")
        return
      }
      hasSelection = true
      const ia = IAS[iaId]
      const total = getTotalScore(iaId)
      placeholder.classList.add("hidden")
      container.classList.add("filled")
      content.innerHTML = `
        <div class="slot-ia">
          <div class="slot-ia-main">
            <img src="${ia.img}" alt="${ia.nome}">
            <div class="slot-ia-name">
              <span>${ia.nome}</span>
              <span class="slot-ia-badge">${side === "left" ? "Time A · 1×1" : "Time B · 1×1"}</span>
            </div>
          </div>
          <div class="slot-ia-score">
            <div class="slot-ia-score-label">Força geral</div>
            <div class="slot-ia-score-value">${total}</div>
          </div>
        </div>
        <button class="slot-ia-remove" type="button" data-remove-id="${iaId}">
          ✕ remover
        </button>
      `
    } else {
      const team = side === "left" ? state.teams.left : state.teams.right
      if (!team.length) {
        placeholder.classList.remove("hidden")
        content.innerHTML = ""
        container.classList.remove("filled")
        return
      }
      hasSelection = true
      const combined = team.reduce((acc, id) => acc + getTotalScore(id), 0)
      placeholder.classList.add("hidden")
      container.classList.add("filled")

      const pills = team
        .map((id) => {
          const ia = IAS[id]
          return `
            <div class="team-ia-pill">
              <img src="${ia.img}" alt="${ia.nome}">
              <span>${ia.nome}</span>
              <button class="slot-ia-remove" type="button" data-remove-id="${id}">✕</button>
            </div>
          `
        })
        .join("")

      content.innerHTML = `
        <div class="team-slot">
          <div class="team-slot-header">
            <span class="slot-ia-badge">${side === "left" ? "Time A · 2×2" : "Time B · 2×2"}</span>
            <div class="slot-ia-score">
              <div class="slot-ia-score-label">Força combinada</div>
              <div class="slot-ia-score-value">${combined}</div>
            </div>
          </div>
          <div class="team-ias">
            ${pills}
          </div>
        </div>
      `
    }

    if (hasSelection) {
      content.querySelectorAll("[data-remove-id]").forEach((btn) => {
        const id = btn.getAttribute("data-remove-id")
        btn.addEventListener("click", () => removerIaDeSelecao(id))
      })
    }
  }

  function syncCardSelection() {
    iaCards.forEach((card) => {
      const id = card.dataset.id
      card.classList.remove("selected", "selected-slot1", "selected-slot2")
      card.removeAttribute("data-slot-label")

      if (!id) return

      if (state.mode === "1v1") {
        if (state.solo.left === id) {
          card.classList.add("selected-slot1")
          card.dataset.slotLabel = "TIME A"
        } else if (state.solo.right === id) {
          card.classList.add("selected-slot2")
          card.dataset.slotLabel = "TIME B"
        }
      } else {
        const inLeft = state.teams.left.includes(id)
        const inRight = state.teams.right.includes(id)
        if (inLeft && inRight) {
          card.classList.add("selected")
        } else if (inLeft) {
          card.classList.add("selected-slot1")
          card.dataset.slotLabel = "TIME A"
        } else if (inRight) {
          card.classList.add("selected-slot2")
          card.dataset.slotLabel = "TIME B"
        }
      }
    })
  }

  function updateDuelButton() {
    if (!btnDuel) return
    const selection = getBattleSelection()
    btnDuel.disabled = !selection
  }

  function getBattleSelection() {
    if (state.mode === "1v1") {
      const leftId = state.solo.left
      const rightId = state.solo.right
      if (!leftId || !rightId || leftId === rightId) return null
      return {
        mode: "1v1",
        left: [leftId],
        right: [rightId]
      }
    }

    const leftTeam = state.teams.left
    const rightTeam = state.teams.right
    if (leftTeam.length !== 2 || rightTeam.length !== 2) return null
    return {
      mode: "2v2",
      left: [...leftTeam],
      right: [...rightTeam]
    }
  }

  function dueloAleatorio() {
    const ids = Object.keys(IAS)
    if (state.mode === "1v1") {
      if (ids.length < 2) return
      let a = ids[Math.floor(Math.random() * ids.length)]
      let b = ids[Math.floor(Math.random() * ids.length)]
      while (b === a) {
        b = ids[Math.floor(Math.random() * ids.length)]
      }
      state.solo.left = a
      state.solo.right = b
    } else {
      if (ids.length < 4) return
      const shuffled = [...ids].sort(() => Math.random() - 0.5)
      state.teams.left = shuffled.slice(0, 2)
      state.teams.right = shuffled.slice(2, 4)
    }

    clearWinnerHighlight()
    renderBattle()
    syncCardSelection()
    updateDuelButton()
    updateChatBindingsFromSelection()
  }

  function resetarArena() {
    state.solo.left = null
    state.solo.right = null
    state.teams.left = []
    state.teams.right = []
    state.history = []
    state.chat.leftIaId = null
    state.chat.rightIaId = null
    clearWinnerHighlight()
    renderBattle()
    syncCardSelection()
    updateDuelButton()
    updateChatBindingsFromSelection()
    clearChatMessages()
    if (historicoLista) historicoLista.innerHTML = ""
    if (resultadoFinal) resultadoFinal.innerHTML = ""
  }

  function getTotalScore(iaId) {
    const ia = IAS[iaId]
    if (!ia) return 0
    return ia.notas.reduce((acc, n) => acc + n, 0)
  }

  function iniciarDuelo(selection) {
    const { mode, left, right } = selection

    const detalhes = []
    let pontosLeft = 0
    let pontosRight = 0

    CATEGORIAS.forEach((cat, i) => {
      const valorLeft =
        mode === "1v1"
          ? IAS[left[0]].notas[i]
          : left.reduce((acc, id) => acc + IAS[id].notas[i], 0)
      const valorRight =
        mode === "1v1"
          ? IAS[right[0]].notas[i]
          : right.reduce((acc, id) => acc + IAS[id].notas[i], 0)
      let vencedor = "empate"
      if (valorLeft > valorRight) {
        pontosLeft++
        vencedor = "left"
      } else if (valorRight > valorLeft) {
        pontosRight++
        vencedor = "right"
      }
      detalhes.push({ categoria: cat, vLeft: valorLeft, vRight: valorRight, vencedor })
    })

    let ladoVencedor = null
    if (pontosLeft > pontosRight) ladoVencedor = "left"
    else if (pontosRight > pontosLeft) ladoVencedor = "right"

    const melhorLeft = left.reduce((best, id) => {
      return getTotalScore(id) > getTotalScore(best) ? id : best
    }, left[0])
    const melhorRight = right.reduce((best, id) => {
      return getTotalScore(id) > getTotalScore(best) ? id : best
    }, right[0])

    const vencedorPrincipal =
      ladoVencedor === "left" ? melhorLeft : ladoVencedor === "right" ? melhorRight : null

    atualizarResultadoInline(mode, pontosLeft, pontosRight, vencedorPrincipal)
    registrarHistorico(selection, ladoVencedor, pontosLeft, pontosRight)
    abrirOverlayVitoria(selection, ladoVencedor, pontosLeft, pontosRight, detalhes, {
      melhorLeft,
      melhorRight,
      vencedorPrincipal
    })
    destacarVencedor(vencedorPrincipal)
    updateChatBindingsFromSelection()
  }

  function atualizarResultadoInline(mode, pLeft, pRight, vencedorPrincipal) {
    if (!resultadoFinal) return
    if (!vencedorPrincipal) {
      resultadoFinal.innerHTML = `
        <span>
          ⚖ <strong>Empate</strong>
          <span class="tag empate">${pLeft} × ${pRight} · ${mode === "1v1" ? "1×1" : "2×2"}</span>
        </span>
      `
      return
    }

    const ia = IAS[vencedorPrincipal]
    resultadoFinal.innerHTML = `
      <span>
        🏆 <strong>${ia.nome} venceu</strong>
        <span class="tag win">${pLeft} × ${pRight} · ${mode === "1v1" ? "1×1" : "2×2"}</span>
      </span>
    `
  }

  function registrarHistorico(selection, ladoVencedor, pLeft, pRight) {
    const labelLeft =
      selection.mode === "1v1"
        ? IAS[selection.left[0]].nome
        : `${IAS[selection.left[0]].nome} + ${IAS[selection.left[1]].nome}`
    const labelRight =
      selection.mode === "1v1"
        ? IAS[selection.right[0]].nome
        : `${IAS[selection.right[0]].nome} + ${IAS[selection.right[1]].nome}`

    let vencedorId = null
    if (ladoVencedor === "left") vencedorId = selection.left[0]
    if (ladoVencedor === "right") vencedorId = selection.right[0]

    state.history.unshift({
      labelLeft,
      labelRight,
      vencedorSide: ladoVencedor,
      placar: `${pLeft}×${pRight}`,
      mode: selection.mode
    })
    state.history = state.history.slice(0, 6)

    if (!historicoLista) return
    historicoLista.innerHTML = state.history
      .map((h) => {
        let rotulo = "Empate"
        let classe = "empate"
        if (h.vencedorSide === "left") {
          rotulo = `${h.labelLeft} venceu`
          classe = "win"
        } else if (h.vencedorSide === "right") {
          rotulo = `${h.labelRight} venceu`
          classe = "win"
        }
        return `
          <li>
            <span><strong>${h.labelLeft}</strong> vs <strong>${h.labelRight}</strong></span>
            <span>${h.placar}</span>
            <span class="badge ${classe}">${rotulo}</span>
          </li>
        `
      })
      .join("")
  }

  function abrirOverlayVitoria(selection, ladoVencedor, pLeft, pRight, detalhes, extra) {
    if (!victoryOverlay || !victoryTitle || !victorySubtitle || !victoryStats) return

    const { melhorLeft, melhorRight, vencedorPrincipal } = extra

    let titulo = ""
    let subtitulo = ""

    if (!ladoVencedor || !vencedorPrincipal) {
      titulo = "Empate"
      subtitulo = "As duas frentes ficaram equilibradas neste duelo."
    } else {
      const iaV = IAS[vencedorPrincipal]
      titulo = `${iaV.nome} venceu`
      subtitulo = "Veja abaixo como ficou a disputa em cada categoria."
    }

    victoryTitle.textContent = titulo
    victorySubtitle.textContent = subtitulo

    const totalLeft =
      selection.mode === "1v1"
        ? getTotalScore(selection.left[0])
        : selection.left.reduce((acc, id) => acc + getTotalScore(id), 0)
    const totalRight =
      selection.mode === "1v1"
        ? getTotalScore(selection.right[0])
        : selection.right.reduce((acc, id) => acc + getTotalScore(id), 0)

    const labelLeft =
      selection.mode === "1v1"
        ? IAS[selection.left[0]].nome
        : `${IAS[selection.left[0]].nome} + ${IAS[selection.left[1]].nome}`
    const labelRight =
      selection.mode === "1v1"
        ? IAS[selection.right[0]].nome
        : `${IAS[selection.right[0]].nome} + ${IAS[selection.right[1]].nome}`

    let headerHTML = ""
    if (vencedorPrincipal) {
      const iaV = IAS[vencedorPrincipal]
      headerHTML = `
        <div class="victory-stats-header">
          <div class="victory-stats-header-main">
            <img src="${iaV.img}" alt="${iaV.nome}">
            <div class="victory-stats-header-text">
              <span>${iaV.nome}</span>
              <small>Destaque deste duelo</small>
            </div>
          </div>
          <div class="victory-score-pill">
            Placar ${pLeft} × ${pRight} · ${selection.mode === "1v1" ? "1×1" : "2×2"}
          </div>
        </div>
      `
    } else {
      headerHTML = `
        <div class="victory-stats-header">
          <div class="victory-stats-header-main">
            <div class="victory-stats-header-text">
              <span>Duelo equilibrado</span>
              <small>Empate técnico entre os lados</small>
            </div>
          </div>
          <div class="victory-score-pill">
            ${pLeft} × ${pRight} · ${selection.mode === "1v1" ? "1×1" : "2×2"}
          </div>
        </div>
      `
    }

    const linhasCategorias = detalhes
      .map((d) => {
        let classeLeft = ""
        let classeRight = ""
        if (d.vencedor === "left") {
          classeLeft = "win"
          classeRight = "lose"
        } else if (d.vencedor === "right") {
          classeLeft = "lose"
          classeRight = "win"
        } else {
          classeLeft = "tie"
          classeRight = "tie"
        }
        return `
          <div class="victory-cat-row">
            <strong>${d.categoria}</strong>
            <span class="${classeLeft}">${d.vLeft}</span>
            <span class="${classeRight}">${d.vRight}</span>
          </div>
        `
      })
      .join("")

    victoryStats.innerHTML = `
      ${headerHTML}
      <div class="victory-categories">
        <div class="victory-cat-row">
          <strong>Categoria</strong>
          <span>${labelLeft}</span>
          <span>${labelRight}</span>
        </div>
        ${linhasCategorias}
        <div class="victory-cat-row">
          <strong>Total</strong>
          <span class="${totalLeft > totalRight ? "win" : totalRight > totalLeft ? "lose" : "tie"}">${totalLeft}</span>
          <span class="${totalRight > totalLeft ? "win" : totalLeft > totalRight ? "lose" : "tie"}">${totalRight}</span>
        </div>
      </div>
    `

    victoryOverlay.classList.add("visible")

    if (window.gsap) {
      window.gsap.fromTo(
        ".victory-content",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
      )
      window.gsap.fromTo(
        ".victory-crown",
        { scale: 0.4, rotation: -20 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.05 }
      )
    }

    const tipoConfete = !ladoVencedor || !vencedorPrincipal ? "tie" : "win"
    dispararConfete(tipoConfete)
  }

  function destacarVencedor(vencedorPrincipal) {
    iaCards.forEach((card) => card.classList.remove("winner-pulse"))
    if (!vencedorPrincipal) return
    const card = document.querySelector(`.ia-card[data-id="${vencedorPrincipal}"]`)
    if (card) {
      card.classList.add("winner-pulse")
    }
  }

  function clearWinnerHighlight() {
    iaCards.forEach((card) => card.classList.remove("winner-pulse"))
  }

  function fecharOverlayVitoria() {
    if (!victoryOverlay) return
    victoryOverlay.classList.remove("visible")
  }

  function dispararConfete(tipo) {
    if (typeof confetti === "undefined" || !confettiCanvas) return

    const myConfetti = confetti.create(confettiCanvas, {
      resize: true,
      useWorker: true
    })

    const isTie = tipo === "tie"
    const colors = isTie
      ? ["#4b5563", "#6b7280", "#9ca3af", "#e5e7eb"]
      : ["#38bdf8", "#0ea5e9", "#1d4ed8", "#0f172a"]

    myConfetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.2 },
      scalar: 0.8,
      colors
    })

    setTimeout(() => {
      myConfetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.8 },
        scalar: 1.1,
        colors
      })
    }, 450)
  }

  function updateChatBindingsFromSelection() {
    if (!chatLab) return

    const selection = getBattleSelection()
    if (!selection) {
      state.chat.leftIaId = null
      state.chat.rightIaId = null
      atualizarHeaderChat(null, null)
      return
    }

    let leftIa = null
    let rightIa = null

    if (selection.mode === "1v1") {
      leftIa = selection.left[0]
      rightIa = selection.right[0]
    } else {
      leftIa = selection.left.reduce((best, id) =>
        getTotalScore(id) > getTotalScore(best) ? id : best
      , selection.left[0])
      rightIa = selection.right.reduce((best, id) =>
        getTotalScore(id) > getTotalScore(best) ? id : best
      , selection.right[0])
    }

    state.chat.leftIaId = leftIa
    state.chat.rightIaId = rightIa
    atualizarHeaderChat(leftIa, rightIa)
  }

  function atualizarHeaderChat(leftIaId, rightIaId) {
    if (!chatLab) return

    function setAvatar(container, iaId) {
      if (!container) return
      container.innerHTML = ""
      if (!iaId) return
      const ia = IAS[iaId]
      const img = document.createElement("img")
      img.src = ia.img
      img.alt = ia.nome
      container.appendChild(img)
    }

    if (!leftIaId || !rightIaId) {
      if (chatNameLeft) chatNameLeft.textContent = "IA da esquerda"
      if (chatNameRight) chatNameRight.textContent = "IA da direita"
      if (chatTagLeft) chatTagLeft.textContent = "Aguardando seleção…"
      if (chatTagRight) chatTagRight.textContent = "Aguardando seleção…"
      if (chatScoreLeft) chatScoreLeft.textContent = ""
      if (chatScoreRight) chatScoreRight.textContent = ""
      setAvatar(chatAvatarLeft, null)
      setAvatar(chatAvatarRight, null)
      return
    }

    const leftIa = IAS[leftIaId]
    const rightIa = IAS[rightIaId]
    const leftScore = getTotalScore(leftIaId)
    const rightScore = getTotalScore(rightIaId)

    if (chatNameLeft) chatNameLeft.textContent = leftIa.nome
    if (chatNameRight) chatNameRight.textContent = rightIa.nome
    if (chatTagLeft) chatTagLeft.textContent = "Respondendo como ela mesma"
    if (chatTagRight) chatTagRight.textContent = "Respondendo como ela mesma"
    if (chatScoreLeft) {
      chatScoreLeft.innerHTML = `Força geral: <strong>${leftScore}</strong>`
    }
    if (chatScoreRight) {
      chatScoreRight.innerHTML = `Força geral: <strong>${rightScore}</strong>`
    }

    setAvatar(chatAvatarLeft, leftIaId)
    setAvatar(chatAvatarRight, rightIaId)
  }

  function handleChatSend() {
    if (!chatInput) return
    const pergunta = chatInput.value.trim()
    if (!pergunta) return

    const { leftIaId, rightIaId } = state.chat
    if (!leftIaId || !rightIaId) return

    adicionarMensagemUsuario(pergunta)
    chatInput.value = ""
    rolarChatAteFim()

    simularRespostaIa("left", leftIaId, pergunta)
    simularRespostaIa("right", rightIaId, pergunta)
  }

  function adicionarMensagemUsuario(texto) {
    const msg = { from: "user", texto }
    state.chat.messages.push(msg)

    if (chatBodyLeft) {
      const el = document.createElement("div")
      el.className = "chat-message user"
      el.textContent = texto
      chatBodyLeft.appendChild(el)
    }
    if (chatBodyRight) {
      const el = document.createElement("div")
      el.className = "chat-message user"
      el.textContent = texto
      chatBodyRight.appendChild(el)
    }
  }

  function simularRespostaIa(side, iaId, pergunta) {
    const typingEl = side === "left" ? typingLeft : typingRight
    const body = side === "left" ? chatBodyLeft : chatBodyRight
    if (!typingEl || !body) return

    typingEl.classList.add("active")

    const ia = IAS[iaId]
    const atraso = 500 + Math.random() * 900

    const resposta = gerarRespostaSimulada(iaId, pergunta)

    setTimeout(() => {
      typingEl.classList.remove("active")
      const wrapper = document.createElement("div")
      wrapper.className = "chat-message ia"
      const small = document.createElement("small")
      small.textContent = ia.nome
      const span = document.createElement("div")
      span.textContent = resposta
      wrapper.appendChild(small)
      wrapper.appendChild(span)
      body.appendChild(wrapper)
      rolarChatAteFim()
    }, atraso)
  }

  function gerarRespostaSimulada(iaId, pergunta) {
    const ia = IAS[iaId]
    const notas = ia.notas
    const melhorIdx = notas.indexOf(Math.max(...notas))
    const melhorCategoria = CATEGORIAS[melhorIdx].toLowerCase()

    const prefixos = [
      `Pensando como ${ia.nome}, eu responderia assim:`,
      `Seguindo o estilo da ${ia.nome}:`,
      `Se fosse a ${ia.nome} no seu fluxo hoje, ela diria:`
    ]
    const corpoBase = [
      `eu priorizaria clareza, estrutura e contexto. A primeira coisa seria decompor a sua pergunta em partes menores e responder cada uma delas de forma direta.`,
      `eu traria um resumo rápido primeiro e em seguida entraria nos detalhes, para você ter uma visão geral antes de ler a explicação completa.`,
      `eu usaria exemplos práticos e linguagem simples, evitando jargões desnecessários, mas sem perder precisão técnica.`
    ]
    const focoCategoria = [
      `Como ${ia.nome} se destaca em ${melhorCategoria}, eu provavelmente sugeriria algumas abordagens visuais ou estruturadas para deixar a resposta mais fácil de consumir.`,
      `O ponto forte aqui é justamente ${melhorCategoria}, então a resposta tenderia a ser bem consistente e estável nesse aspecto.`,
      `Esse tipo de pergunta cai muito bem no ponto forte de ${ia.nome} em ${melhorCategoria}, então você provavelmente sentiria mais segurança na resposta.`
    ]

    const p = pergunta.length > 140 ? pergunta.slice(0, 140) + "..." : pergunta

    const partes = []
    partes.push(prefixos[Math.floor(Math.random() * prefixos.length)])
    partes.push(`sobre “${p}”,`)
    partes.push(corpoBase[Math.floor(Math.random() * corpoBase.length)])
    partes.push(focoCategoria[Math.floor(Math.random() * focoCategoria.length)])

    return partes.join(" ")
  }

  function clearChatMessages() {
    state.chat.messages = []
    if (chatBodyLeft) chatBodyLeft.innerHTML = ""
    if (chatBodyRight) chatBodyRight.innerHTML = ""
    if (typingLeft) typingLeft.classList.remove("active")
    if (typingRight) typingRight.classList.remove("active")
  }

  function rolarChatAteFim() {
    if (chatBodyLeft) chatBodyLeft.scrollTop = chatBodyLeft.scrollHeight
    if (chatBodyRight) chatBodyRight.scrollTop = chatBodyRight.scrollHeight
  }

  init()
})()
