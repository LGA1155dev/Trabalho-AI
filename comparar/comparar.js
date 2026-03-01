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
const radar=document.getElementById("radarChart")
const chatSection=document.getElementById("chatSection")
const chatBtn=document.getElementById("chatBtn")
const chatInput=document.getElementById("chatInput")
const chat1=document.getElementById("chat1")
const chat2=document.getElementById("chat2")

let estado={slot1:null,slot2:null}

imagens.forEach(img=>{
img.addEventListener("click",()=>{
if(!estado.slot1){colocar(slots[0],img.dataset.id)}
else if(!estado.slot2){colocar(slots[1],img.dataset.id)}
})
})

function colocar(slot,id){
const ia=ias[id]
slot.innerHTML=`<img src="${ia.img}"><h3>${ia.nome}</h3>`
if(slot.id==="slot1")estado.slot1=id
else estado.slot2=id
botao.disabled=!(estado.slot1&&estado.slot2)
}

botao.addEventListener("click",comparar)

function comparar(){
let p1=0,p2=0
categorias.forEach((cat,i)=>{
let v1=ias[estado.slot1].notas[i]
let v2=ias[estado.slot2].notas[i]
if(v1>v2)p1++
else if(v2>v1)p2++
})
resultado.innerHTML=p1>p2?`🏆 ${ias[estado.slot1].nome} venceu!`:
p2>p1?`🏆 ${ias[estado.slot2].nome} venceu!`:"⚖ EMPATE"

desenharRadar()
chatSection.style.display="block"
}

function desenharRadar(){
const ctx=radar.getContext("2d")
ctx.clearRect(0,0,400,400)
ctx.strokeStyle="#00eaff"
ctx.beginPath()
ctx.moveTo(200,50)
ctx.lineTo(350,200)
ctx.lineTo(200,350)
ctx.lineTo(50,200)
ctx.closePath()
ctx.stroke()
}

chatBtn.addEventListener("click",()=>{
const pergunta=chatInput.value
if(!pergunta)return
chat1.innerHTML+=`<p><strong>Você:</strong> ${pergunta}</p>`
chat2.innerHTML+=`<p><strong>Você:</strong> ${pergunta}</p>`

responder(chat1,estado.slot1,pergunta)
responder(chat2,estado.slot2,pergunta)

chatInput.value=""
})

function responder(chat,id,pergunta){
let texto=`Resposta simulada da ${ias[id].nome} sobre "${pergunta}".`
if(pergunta.toLowerCase().includes("imagem")){
const img=`https://picsum.photos/seed/${id+pergunta}/300/200`
chat.innerHTML+=`<p>${texto}</p><img src="${img}">`
}else{
chat.innerHTML+=`<p>${texto}</p>`
}
}

document.getElementById("btnReset").addEventListener("click",()=>{
location.reload()
})