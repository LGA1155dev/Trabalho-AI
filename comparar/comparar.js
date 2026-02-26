// Pegando todos os simbolos pra fazer a comparação...


//<==============          =======================>

const  copilot = document.getElementById('copilot')

const chatgpt = document.getElementById('chatgpt')

const gemini = document.getElementById('gemini')

const meta = document.getElementById('meta')

const ul = document.querySelector('ul.IA')

//<==============          =======================>

copilot.addEventListener('click', () => {
    let cop = document.createElement('img')
    copilot.src = '../imagens/copilot-logo.png';
    ul.appendChild(copilot)



})

chatgpt.addEventListener('click', () => {
    let chat = document.createElement('img')
    document.getElementById('chat').src = '../imagens/logo-chatgpt.png'
    ul.appendChild(chat)
})





