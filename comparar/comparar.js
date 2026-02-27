// Pegando todos os simbolos pra fazer a comparação...

// Declarar as variaveis que preenchem cada local de carta com null e se alguem clicar em uma ia e o slot1 um por exemplo estiver vasio colocar a ia dentro delo, se não se o slot 2 estiver vasio colocar dentro dele, se não se os dois tiverem preenchidos decide se exlui a ia ou substitui....

slot1 = null;
slot2 = null;

//<==============          =======================>

const  copilot = document.getElementById('copilot')

const chatgpt = document.getElementById('chatgpt')

const gemini = document.getElementById('gemini')

const meta = document.getElementById('meta')

const deepseek = document.getElementById('deepseek')

let card_1 = document.getElementById("card_1")

let card_2 = document.getElementById("card_2")

const ul = document.querySelector('ul.IA')

//<==============          =======================>


//Aqui eu coloco todas as informações das IA's dentro de um objeto, vou usar mais tarde pra puxar as infos de qual é melhor.

const copilot_infos = {
    imagens: 6,
    explicacao: 9,
    tarefas: 9,
    resumo: 8,
    trabalhos: 8,
    corrigir_textos: 9,
}

const chatgpt_infos = {
    imagens: 8,
    explicacao: 8,
    tarefas: 9,
    resumo: 8,
    trabalhos: 8,
    corrigir_textos: 9,
}

const gemini_infos = {

    imagens: 10,
    explicacao: 9,
    tarefas: 9,
    resumo: 9,
    trabalhos: 8,
    corrigir_textos: 7,
}

const meta_infos = {
    imagens: 6,
    explicacao: 8,
    tarefas: 7,
    resumo: 8,
    trabalhos: 6,
    corrigir_textos: 7,
}

const deepseek_infos = {
    imagens: 7,
    explicacao: 7,
    tarefas: 8,
    resumo: 7,
    trabalhos: 9,
    corrigir_textos: 8,
}

//Aqui eu vou faser o js escutar o evento de click do user, e se o js escutar, vou faser o js adicionar ele no primeiro card.


copilot.addEventListener('click', () => {
    if (slot1 == null){
        console.log(slot1)
    }
})

chatgpt.addEventListener('click', () => {

})

gemini.addEventListener('click', () => {

})

meta.addEventListener('click', () => {

})

deepseek.addEventListener('click', () => {
    
})





