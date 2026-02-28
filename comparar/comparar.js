const categoriasOrdem = [
"imagens",
"explicacao",
"tarefas",
"resumo",
"trabalhos",
"corrigir_textos"
]

const estado = {
slot1:null,
slot2:null
}

const imagensIA = document.querySelectorAll(".ia-list img")
const slot1 = document.getElementById("slot1")
const slot2 = document.getElementById("slot2")
const botaoConfirmar = document.getElementById("confirmar")
const resultadoFinal = document.getElementById("resultadoFinal")

const ias = {
copilot:{nome:"Copilot",gif:"../imagens/copilot-logo.png",notas:{imagens:6,explicacao:9,tarefas:9,resumo:8,trabalhos:8,corrigir_textos:9}},
chatgpt:{nome:"ChatGPT",gif:"../imagens/logo-chatgpt.png",notas:{imagens:8,explicacao:8,tarefas:9,resumo:8,trabalhos:8,corrigir_textos:9}},
gemini:{nome:"Gemini",gif:"../imagens/logo-gemini.png",notas:{imagens:10,explicacao:9,tarefas:9,resumo:9,trabalhos:8,corrigir_textos:7}},
meta:{nome:"Meta AI",gif:"../imagens/meta-ai-logo.png",notas:{imagens:6,explicacao:8,tarefas:7,resumo:8,trabalhos:6,corrigir_textos:7}},
deepseek:{nome:"DeepSeek",gif:"../imagens/deepseek-logo.png",notas:{imagens:7,explicacao:7,tarefas:8,resumo:7,trabalhos:9,corrigir_textos:8}}
}

imagensIA.forEach(img=>{
img.addEventListener("dragstart",e=>{
e.dataTransfer.setData("text/plain",img.id)
})
})

;[slot1,slot2].forEach(slot=>{
slot.addEventListener("dragover",e=>{
e.preventDefault()
slot.classList.add("drag-over")
})
slot.addEventListener("dragleave",()=>{
slot.classList.remove("drag-over")
})
slot.addEventListener("drop",e=>{
e.preventDefault()
slot.classList.remove("drag-over")
const idIA=e.dataTransfer.getData("text/plain")
adicionarIA(slot,idIA)
})
})

function adicionarIA(slot,idIA){

if(!ias[idIA])return
if(slot.id==="slot1"&&estado.slot2===idIA)return
if(slot.id==="slot2"&&estado.slot1===idIA)return

resultadoFinal.innerHTML=""
slot1.classList.remove("campeao")
slot2.classList.remove("campeao")

if(slot.id==="slot1")estado.slot1=idIA
else estado.slot2=idIA

renderSlot(slot,idIA)
verificarBotao()
}

function renderSlot(slot,idIA){
const ia=ias[idIA]
slot.innerHTML=`
<img src="${ia.gif}" class="ia-avatar">
<h3>${ia.nome}</h3>
<div class="comparacao"></div>
`
}

function verificarBotao(){
botaoConfirmar.disabled=!(estado.slot1&&estado.slot2)
}

botaoConfirmar.addEventListener("click",iniciarComparacao)

function iniciarComparacao(){

let pontos1=0
let pontos2=0

const comp1=slot1.querySelector(".comparacao")
const comp2=slot2.querySelector(".comparacao")

comp1.innerHTML=""
comp2.innerHTML=""
resultadoFinal.innerHTML=""

categoriasOrdem.forEach(cat=>{

const v1=ias[estado.slot1].notas[cat]
const v2=ias[estado.slot2].notas[cat]

let simbolo1="⚖"
let simbolo2="⚖"
let classe1=""
let classe2=""

if(v1>v2){simbolo1="✔";simbolo2="✖";classe1="vencedor";classe2="perdedor";pontos1++}
else if(v2>v1){simbolo2="✔";simbolo1="✖";classe2="vencedor";classe1="perdedor";pontos2++}

comp1.innerHTML+=criarLinha(cat,v1,simbolo1,classe1)
comp2.innerHTML+=criarLinha(cat,v2,simbolo2,classe2)
})

destacarVencedor(pontos1,pontos2)
}

function criarLinha(cat,valor,simbolo,classe){
return`
<div class="linha ${classe}">
<span>${cat.toUpperCase()}</span>
<div class="barra-container">
<div class="barra" style="width:${valor*10}%"></div>
</div>
<span>${valor} ${simbolo}</span>
</div>
`
}

function destacarVencedor(p1,p2){

if(p1>p2){
slot1.classList.add("campeao")
resultadoFinal.innerHTML=`<h2>${ias[estado.slot1].nome} VENCEU 🏆</h2>`
}
else if(p2>p1){
slot2.classList.add("campeao")
resultadoFinal.innerHTML=`<h2>${ias[estado.slot2].nome} VENCEU 🏆</h2>`
}
else{
resultadoFinal.innerHTML=`<h2>EMPATE ⚖</h2>`
}
}