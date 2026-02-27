// Pegando todos os simbolos pra fazer a comparação...


//<==============          =======================>

const  copilot = document.getElementById('copilot')

const chatgpt = document.getElementById('chatgpt')

const gemini = document.getElementById('gemini')

const meta = document.getElementById('meta')

const deepseek = document.getElementById('deepseek')

const ul = document.querySelector('ul.IA')

//<==============          =======================>

const cop = {
    imagens: 6,
    explicacao: 9,
    tarefas: 9,
    resumo: 8,
    trabalhos: 8,
    corrigir_textos: 9,
}

const chat = {
    imagens: 8,
    explicacao: 8,
    tarefas: 9,
    resumo: 8,
    trabalhos: 8,
    corrigir_textos: 9,
}

const geminiAI = {

    imagens: 10,
    explicacao: 9,
    tarefas: 9,
    resumo: 9,
    trabalhos: 8,
    corrigir_textos: 7,
}

const metaAI = {
    imagens: 6,
    explicacao: 8,
    tarefas: 7,
    resumo: 8,
    trabalhos: 6,
    corrigir_textos: 7,
}

const deepseekAI = {
    imagens: 7,
    explicacao: 7,
    tarefas: 8,
    resumo: 7,
    trabalhos: 9,
    corrigir_textos: 8,
}

copilot.addEventListener('click', () => {
    let cop = document.createElement('img')
    copilot.src = '../imagens/copilot-logo.png';
})

chatgpt.addEventListener('click', () => {
    let chat = document.createElement('img')
    document.getElementById('chat').src = '../imagens/logo-chatgpt.png'
    ul.appendChild(chat)
})






