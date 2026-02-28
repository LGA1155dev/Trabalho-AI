const categorias=["IMAGENS","EXPLICAÇÃO","TAREFAS","RESUMO","TRABALHOS","CORRIGIR_TEXTOS"]

const ias={
copilot:{nome:"Copilot",img:"../imagens/copilot-logo.png",notas:[6,9,9,8,8,9]},
chatgpt:{nome:"ChatGPT",img:"../imagens/logo-chatgpt.png",notas:[8,8,9,8,8,9]},
gemini:{nome:"Gemini",img:"../imagens/logo-gemini.png",notas:[10,9,9,9,8,7]},
meta:{nome:"Meta AI",img:"../imagens/meta-ai-logo.png",notas:[6,8,7,8,6,7]},
deepseek:{nome:"DeepSeek",img:"../imagens/deepseek-logo.png",notas:[7,7,8,7,9,8]}
}

const imagens=document.querySelectorAll(".ia-list img")
const slots=document.querySelectorAll(".drop-zone")
const botao=document.getElementById("confirmar")
const resultado=document.getElementById("resultadoFinal")

let estado={slot1:null,slot2:null}

/* ================= MOBILE CLICK ================= */

imagens.forEach(img=>{
img.addEventListener("click",()=>{
const id=img.dataset.id

if(!estado.slot1){
colocar(slots[0],id)
}else if(!estado.slot2){
colocar(slots[1],id)
}
})
})

/* ================= DESKTOP DRAG ================= */

imagens.forEach(img=>{
img.setAttribute("draggable",true)

img.addEventListener("dragstart",(e)=>{
e.dataTransfer.setData("id",img.dataset.id)
})
})

slots.forEach(slot=>{
slot.addEventListener("dragover",(e)=>e.preventDefault())

slot.addEventListener("drop",(e)=>{
e.preventDefault()
const id=e.dataTransfer.getData("id")
colocar(slot,id)
})
})

function colocar(slot,id){

const ia=ias[id]

slot.innerHTML=`<img src="${ia.img}">
<h3>${ia.nome}</h3>
<div class="comparacao"></div>`

if(slot.id==="slot1") estado.slot1=id
else estado.slot2=id

botao.disabled=!(estado.slot1&&estado.slot2)
}

botao.addEventListener("click",comparar)

function comparar(){

let p1=0,p2=0
const c1=slots[0].querySelector(".comparacao")
const c2=slots[1].querySelector(".comparacao")

c1.innerHTML=""
c2.innerHTML=""
resultado.innerHTML=""

categorias.forEach((cat,i)=>{
let v1=ias[estado.slot1].notas[i]
let v2=ias[estado.slot2].notas[i]

let classe1="",classe2=""
let simb1="⚖",simb2="⚖"

if(v1>v2){p1++;classe1="vencedor";classe2="perdedor";simb1="✔";simb2="✖"}
else if(v2>v1){p2++;classe2="vencedor";classe1="perdedor";simb2="✔";simb1="✖"}

c1.innerHTML+=`<div class="linha ${classe1}">${cat} ${v1} ${simb1}</div>`
c2.innerHTML+=`<div class="linha ${classe2}">${cat} ${v2} ${simb2}</div>`
})

slots[0].classList.remove("campeao")
slots[1].classList.remove("campeao")

if(p1>p2){
slots[0].classList.add("campeao")
resultado.innerHTML=`🏆 ${ias[estado.slot1].nome} VENCEU`
}else if(p2>p1){
slots[1].classList.add("campeao")
resultado.innerHTML=`🏆 ${ias[estado.slot2].nome} VENCEU`
}else{
resultado.innerHTML="⚖ EMPATE"
}
}