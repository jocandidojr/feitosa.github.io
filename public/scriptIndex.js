document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu a, .menu .button');
    const currentPageText = document.getElementById('current-page');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNavbar = document.querySelector('.main-navbar');
    const pcSlides = document.querySelectorAll('.slide-pc img');
    const mobileSlides = document.querySelectorAll('.slide-mobile img');
    const indicators = document.querySelectorAll('.slide-indicator');
    const menuPc = document.querySelector('.menu-pc');
    let currentSlide = 0;

    // Define "Página inicial" como o texto padrão
    if (currentPageText) {
        currentPageText.textContent = "";
    }

    // Atualiza o texto da navbar superior ao clicar em um link
    menuLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Impede o comportamento padrão do link
            
            const pageName = this.getAttribute('data-page');
            if (currentPageText) {
                currentPageText.textContent = ``;
            }
            
            // Rolagem suave para a seção desejada
            const targetId = this.getAttribute('href').substring(1);
            if (targetId) {
                document.getElementById(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }

            // Fechar o menu quando um item é clicado (para a versão desktop)
            if (mainNavbar.classList.contains('menu-active')) {
                mainNavbar.classList.remove('menu-active');
            }
        });
    });

    // Alterna a visibilidade do menu ao clicar no botão de menu
    if (menuToggle && mainNavbar) {
        menuToggle.addEventListener('click', () => {
            mainNavbar.classList.toggle('menu-active');
            
            // Verifica se o menu está ativo para mostrar ou ocultar os links
            const isActive = mainNavbar.classList.contains('menu-active');
            if (menuPc) {
                menuPc.style.display = isActive ? 'flex' : 'none';
            }
        });
    }

    // Função para mostrar o slide atual e atualizar o indicador
    function showSlide(index) {
        // Exibe o slide atual para PC
        pcSlides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        // Exibe o slide atual para Mobile
        mobileSlides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
        
        // Atualiza os indicadores
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    // Configuração do intervalo para alternar os slides a cada 5 segundos
    setInterval(() => {
        currentSlide = (currentSlide + 1) % pcSlides.length;
        showSlide(currentSlide);
    }, 5000);

    // Inicializa o primeiro slide
    showSlide(currentSlide);

    // Previne o menu de contexto e o arrasto de imagens
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault(); 
        }
    });

    // Função para rolar para o topo ao clicar no botão
    document.querySelector('.up-button')?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Rola suavemente para o topo
        });
    });

    // Adiciona funcionalidade para os botões "Anterior" e "Próximo" nos slides
    document.getElementById('nextSlide')?.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % pcSlides.length;
        showSlide(currentSlide);
    });

    document.getElementById('prevSlide')?.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + pcSlides.length) % pcSlides.length;
        showSlide(currentSlide);
    });

    const images = document.querySelectorAll("#plan-img img");
    let currentIndex = 0;

    function showNextImage() {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add("active");
    }

    // Inicializar a primeira imagem
    images[currentIndex].classList.add("active");

    // Alterar imagens a cada 3 segundos
    setInterval(showNextImage, 3000);
});

    // Formulário de contato
    document.getElementById('contact-form')?.addEventListener('submit', function(event) {
        event.preventDefault(); // Previne o comportamento padrão do formulário
        
        // Captura os dados do formulário
        const nome = event.target.nome.value;
        const celular = event.target.celular.value;
        const mensagem = event.target.mensagem.value;
        
        // Formata a mensagem para o WhatsApp
        const formattedMessage = `Nome: ${nome}%0AContato: ${celular}%0AMensagem: ${mensagem}`;
        
        // URL para o WhatsApp
        const whatsappUrl = `https://wa.me/55839999888759?text=${encodeURIComponent(formattedMessage)}`;
        
        // Redireciona para o WhatsApp
        window.open(whatsappUrl, '_blank');
    });


    document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        // Fecha todas as FAQs
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('active');
        });

        // Abre a FAQ clicada
        const parent = item.parentElement;
        parent.classList.toggle('active');
    });
});