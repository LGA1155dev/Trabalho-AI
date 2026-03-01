let user = document.querySelector('input#user')
const pass = document.querySelector('input#senha')

const btn = document.querySelector('input#entrar')


    const relacionados = ['O que é uma IA?',
                          'Como funciona uma IA?',
                          'Qual IA usar?',
    ];

    user = document.querySelector('input#user');
    let name = document.querySelector('span#name')

    const senha = document.querySelector('input#senha')


    btn.addEventListener('click', () => {
     
    name.textContent = `${user.value}`;


   
})

