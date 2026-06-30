
//ATUALIZADO 15.06.2026
(() => {

    // Mata instalação anterior
    if (window.AUTO_ADS?.timer) {
        clearInterval(window.AUTO_ADS.timer);
    }

    document.getElementById("auto-ads-config-btn")?.remove();
    document.getElementById("auto-ads-toast")?.remove();

    const mostrarMensagem = (texto) => {

        let toast = document.getElementById("auto-ads-toast");

        if (!toast) {

            toast = document.createElement("div");
            toast.id = "auto-ads-toast";

            Object.assign(toast.style, {
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: "2147483647",
                padding: "12px 18px",
                background: "#111",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "Arial",
                boxShadow: "0 4px 12px rgba(0,0,0,.3)"
            });

            document.body.appendChild(toast);
        }

        toast.textContent = texto;
        toast.style.opacity = "1";

        clearTimeout(window.autoAdsToastTimer);

        window.autoAdsToastTimer = setTimeout(() => {
            toast.style.opacity = "0";
        }, 2500);
    };

    window.AUTO_ADS = {

        timer: null,

        // velocidade padrão
        intervalo: 3000,

        executar() {

            window.scrollBy({
                top: 1200,
                behavior: "smooth"
            });

            document
                .querySelectorAll(
                    'a[role="button"], button, div[role="button"], span'
                )
                .forEach(el => {

                    const texto = (
                        el.innerText || ""
                    ).trim().toLowerCase();

                    if (
                        texto === "ver mais" ||
                        texto.startsWith("ver mais") ||
                        texto.includes("ver mais")
                    ) {
                        try {
                            el.click();
                        } catch {}
                    }
                });
        },

        iniciar() {

            if (this.timer) {
                mostrarMensagem(
                    `Já rodando (${this.intervalo / 1000}s)`
                );
                return;
            }

            this.timer = setInterval(() => {
                this.executar();
            }, this.intervalo);

            mostrarMensagem(
                `🚀 Iniciado (${this.intervalo / 1000}s)`
            );
        },

        parar() {

            if (!this.timer) {
                mostrarMensagem("Já parado");
                return;
            }

            clearInterval(this.timer);

            this.timer = null;

            mostrarMensagem("🛑 Parado");
        },

        alterarVelocidade() {

            const atual = this.intervalo / 1000;

            const valor = prompt(
                `Velocidade atual: ${atual}s\n\nDigite a nova velocidade em segundos:`,
                atual
            );

            if (valor === null) return;

            const segundos = parseFloat(
                valor.replace(",", ".")
            );

            if (
                isNaN(segundos) ||
                segundos <= 0
            ) {
                mostrarMensagem("❌ Valor inválido");
                return;
            }

            this.intervalo = segundos * 1000;

            const estavaRodando = !!this.timer;

            if (estavaRodando) {

                clearInterval(this.timer);

                this.timer = null;

                this.iniciar();
            }

            mostrarMensagem(
                `⚡ Velocidade alterada para ${segundos}s`
            );

            console.log(
                "[AUTO ADS] Intervalo atualizado:",
                segundos,
                "segundos"
            );
        }
    };

    // Botão flutuante
    const btn = document.createElement("div");

    btn.id = "auto-ads-config-btn";
    btn.innerHTML = "⚙";

    Object.assign(btn.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "#ff3b30",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: "2147483647",
        boxShadow: "0 4px 12px rgba(0,0,0,.4)",
        userSelect: "none"
    });

    btn.title = "Alterar velocidade";

    btn.addEventListener("click", () => {
        window.AUTO_ADS.alterarVelocidade();
    });

    document.body.appendChild(btn);

    // Teclas de atalho
    document.addEventListener("keydown", (e) => {

        const tecla = e.key.toLowerCase();

        if (
            ["input", "textarea"].includes(
                document.activeElement?.tagName?.toLowerCase()
            )
        ) {
            return;
        }

        if (tecla === "p") {
            window.AUTO_ADS.parar();
        }

        if (tecla === "ç") {
            window.AUTO_ADS.iniciar();
        }

    });

    mostrarMensagem(
        "Ativado | Ç iniciar | P parar | ⚙ velocidade"
    );

})();






(function () {
    'use strict';

    const processed = new WeakSet();
    let scanTimeout;
function criarPainelFiltro() {

    if (
        document.getElementById(
            'meu-filtro-whatsapp'
        )
    ) {
        return;
    }

    const ativo =
        localStorage.getItem(
            'meuFiltroWhatsapp'
        ) === '1';

    const painel = document.createElement('div');

    painel.id = 'meu-filtro-whatsapp';

    painel.innerHTML = `
        <div id="mw-toggle-track">
            <div id="mw-toggle-ball"></div>
        </div>
        <div id="mw-gear">⚙</div>
    `;

   Object.assign(painel.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: '70px',
    height: '110px',
    background: '#ff3b30',
    borderRadius: '35px',
    zIndex: '2147483647',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    boxShadow: '0 4px 16px rgba(0,0,0,.3)',
    userSelect: 'none'
});

    const track =
        painel.querySelector(
            '#mw-toggle-track'
        );

    const ball =
        painel.querySelector(
            '#mw-toggle-ball'
        );
    const gear =
    painel.querySelector('#mw-gear');

Object.assign(gear.style, {
    fontSize: '18px',
    cursor: 'pointer',
    lineHeight: '1'
});

    Object.assign(track.style, {
        width: '52px',
        height: '26px',
        borderRadius: '20px',
        background: '#111',
        position: 'relative',
        cursor: 'pointer'
    });

    Object.assign(ball.style, {
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: '#e6e6e6',
        position: 'absolute',
        top: '2px',
        transition: '.2s'
    });

    function atualizar() {

        const ligado =
            localStorage.getItem(
                'meuFiltroWhatsapp'
            ) === '1';

        ball.style.left =
            ligado
                ? '28px'
                : '2px';
    }

    atualizar();

    track.addEventListener(
        'click',
        () => {

            const ligado =
                localStorage.getItem(
                    'meuFiltroWhatsapp'
                ) === '1';

            localStorage.setItem(
                'meuFiltroWhatsapp',
                ligado ? '0' : '1'
            );

            atualizar();

            alert(
                ligado
                    ? 'Filtro WhatsApp DESATIVADO'
                    : 'Filtro WhatsApp ATIVADO'
            );
        }
    );

painel
    .querySelector('#mw-gear')
    .addEventListener(
        'click',
        (e) => {

            e.stopPropagation();

            if (window.AUTO_ADS) {
                window.AUTO_ADS.alterarVelocidade();
            }
        }
    );
    document.body.appendChild(
        painel
    );
}
    function injectCSS() {
        if (document.getElementById('meu-ad-style')) return;

        const style = document.createElement('style');
        style.id = 'meu-ad-style';

        style.textContent = `
            .meu-ad-bar {
                display: flex;
                gap: 6px;
                margin-top: 4px;
                margin-bottom: 4px;
                flex-wrap: wrap;
                position: relative;
                z-index: 9999;
            }

            .meu-ad-btn {
                all: unset;
                cursor: pointer;
                padding: 5px 8px;
                font-size: 11px;
                border-radius: 5px;
                background: #f0f2f5;
                border: 1px solid rgba(0,0,0,0.12);
                display: inline-flex;
                align-items: center;
                white-space: nowrap;
                user-select: none;
            }

            .meu-ad-btn:hover {
                background: #e4e6eb;
            }
        `;

        document.head.appendChild(style);
    }

    function criarBotao(texto, onClick) {
        const btn = document.createElement('button');
        btn.className = 'meu-ad-btn';
        btn.textContent = texto;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        });

        return btn;
    }

   function extrairPagina(card) {

    const a = [...card.querySelectorAll('a[href*="facebook.com/"]')]
        .find(el =>
            !el.href.includes('l.facebook.com') &&
            !el.href.includes('/ads/library')
        );

    if (!a) return null;

    const nome = (a.textContent || '').trim();

    let pageId = null;

    try {

        const reactKey = Object.keys(card)
            .find(k => k.startsWith('__reactProps$'));

        if (reactKey) {

            const data = JSON.stringify(card[reactKey]);

            const match = data.match(
                /"page_id"\s*:\s*"(\d+)"/
            );

            if (match) {
                pageId = match[1];
            }
        }

    } catch (e) {}

    if (!pageId) {

        const matchHref = a.href.match(
            /facebook\.com\/(\d+)\/?$/
        );

        if (matchHref) {
            pageId = matchHref[1];
        }
    }

    return {
        nome,
        url: a.href,
        pageId
    };
}
function extrairLanding(card) {

    const a = [...card.querySelectorAll('a[href]')]
        .find(el =>
            el.href.includes('l.facebook.com/l.php?u=')
        );

    if (!a) return null;

    try {

        const url = new URL(a.href);

        const raw =
            url.searchParams.get('u');

        return raw
            ? decodeURIComponent(raw)
            : null;

    } catch {

        return null;
    }
}

    function filtroWhatsappAtivo() {
    return localStorage.getItem('meuFiltroWhatsapp') === '1';
}

function ehLinkWhatsapp(url) {

    if (!url) return false;

    url = url.toLowerCase();

    return (
        url.startsWith('https://api.whatsapp.com/send') ||
        url.startsWith('http://api.whatsapp.com/send') ||
        url.startsWith('https://wa.me/') ||
        url.startsWith('http://wa.me/') ||
        url.includes('whatsapp.com/send') ||
        url.includes('wa.me/')
    );
}
function abrirAdsLibrary(pageId) {

    if (!pageId) {
        alert('Page ID não encontrado');
        return;
    }

    const url =
        `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=${pageId}`;

    window.open(url, '_blank');
}

    function abrirImagem(card) {

        const imagens = [...card.querySelectorAll('img')];

        const img = imagens
            .filter(i => {
                const src = i.src || '';

                return (
                    src.includes('scontent') ||
                    src.includes('fbcdn')
                );
            })
            .sort((a, b) =>
                (b.naturalWidth * b.naturalHeight) -
                (a.naturalWidth * a.naturalHeight)
            )[0];

        if (!img) {
            alert('Imagem não encontrada');
            return;
        }

        window.open(img.src, '_blank');
    }

    function abrirVideo(card) {

        const video = card.querySelector('video');

        if (!video) {
            alert('Vídeo não encontrado');
            return;
        }

        const src =
            video.currentSrc ||
            video.src ||
            video.querySelector('source')?.src;

        if (!src) {
            alert('URL do vídeo não encontrada');
            return;
        }

        window.open(src, '_blank');
    }

    function removerAnuncio(card) {

        const container =
            card.closest('.card-ad') ||
            card;

        container.style.transition =
            'opacity .15s ease';

        container.style.opacity = '0';

        setTimeout(() => {
            try {
                processed.delete(card);
                container.remove();
            } catch {}
        }, 150);
    }
function ehAnuncioWhatsapp(card) {

    const texto = (
        card.innerText ||
        card.textContent ||
        ''
    ).toUpperCase();

    return (
        texto.includes('API.WHATSAPP.COM') ||
        texto.includes('WHATSAPP.COM') ||
        texto.includes('ENVIAR MENSAGEM PELO WHATSAPP')
    );
}
   function processarCard(card) {
if (
    filtroWhatsappAtivo() &&
    ehAnuncioWhatsapp(card)
) {

    removerAnuncio(card);
    return;
}
    if (processed.has(card)) {
        return;
    }

    if (card.querySelector('.meu-ad-bar')) {
        return;
    }

    const landing = extrairLanding(card);

console.log('LANDING REAL:', landing);
    const pagina = extrairPagina(card);
if (
    filtroWhatsappAtivo() &&
    ehLinkWhatsapp(landing)
) {
    removerAnuncio(card);
    return;
}
    const temPageId =
        pagina &&
        pagina.pageId &&
        /^\d+$/.test(pagina.pageId);

    if (!landing && !temPageId) {
        return;
    }

    const bar = document.createElement('div');
    bar.className = 'meu-ad-bar';

    if (landing) {
        bar.appendChild(
            criarBotao('🌐 Site', () => {
                window.open(landing, '_blank');
            })
        );
    }

    if (temPageId) {
        bar.appendChild(
            criarBotao('📘 Ads', () => {
                abrirAdsLibrary(pagina.pageId);
            })
        );
    }

    if (card.querySelector('img')) {
        bar.appendChild(
            criarBotao('🖼️ Imagem', () => {
                abrirImagem(card);
            })
        );
    }

    if (card.querySelector('video')) {
        bar.appendChild(
            criarBotao('🎥 Vídeo', () => {
                abrirVideo(card);
            })
        );
    }

    const btnFechar = criarBotao(
        '❌ Fechar',
        () => {

            if (btnFechar.dataset.confirmando === '1') {
                removerAnuncio(card);
                return;
            }

            btnFechar.dataset.confirmando = '1';
            btnFechar.textContent = '⚠️ Confirmar';

            setTimeout(() => {

                if (
                    btnFechar.isConnected &&
                    btnFechar.dataset.confirmando === '1'
                ) {

                    btnFechar.dataset.confirmando = '0';
                    btnFechar.textContent = '❌ Fechar';
                }

            }, 3000);
        }
    );

    bar.appendChild(btnFechar);

    const patrocinadoContainer =
        card.querySelector('div._8nrv');

    if (patrocinadoContainer) {

        patrocinadoContainer.insertAdjacentElement(
            'afterend',
            bar
        );

    } else {

        const fallback =
            card.querySelector('.ad-ui-container') ||
            card;

        fallback.prepend(bar);
    }

    processed.add(card);
}

    function findCards() {

    return [
        ...document.querySelectorAll('.card-ad'),
        ...document.querySelectorAll('[class*="xh8yej3"]')
    ];

}

    function scan() {

        const cards = findCards();

        for (const card of cards) {
            processarCard(card);
        }
    }

    function start() {

        injectCSS();
   criarPainelFiltro();
        scan();

setTimeout(scan, 1000);
setTimeout(scan, 2500);
setTimeout(scan, 5000);

        const observer = new MutationObserver(() => {

            clearTimeout(scanTimeout);

            scanTimeout = setTimeout(() => {
                scan();
            }, 300);

        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    start();

})();


//SCRIPT 03 - OTIMIZAR RAM
(function () {
    'use strict';

    if (window.__adsLibraryOptimizerLoaded) return;
    window.__adsLibraryOptimizerLoaded = true;

    const STYLE_ID = 'ads-library-memory-optimizer';

    function injectCSS() {

        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;

        style.textContent = `

    .card-ad {
    content-visibility: auto !important;
    contain-intrinsic-size: 1200px !important;
    contain: content !important;
    overflow: hidden !important;
}

       video {
    contain: layout paint style !important;
}

        img {
            will-change: auto !important;
        }

        `;

        document.head.appendChild(style);
    }

    function optimizeVideos() {

        const videos = document.querySelectorAll('video');

        videos.forEach(video => {

            if (video.dataset.memoryOptimized) return;

            video.dataset.memoryOptimized = '1';

            video.preload = 'metadata';

        });
    }

    function optimizeImages() {

        const images = document.querySelectorAll('img');

        images.forEach(img => {

            if (img.dataset.memoryOptimized) return;

            img.dataset.memoryOptimized = '1';

            img.loading = 'lazy';
            img.decoding = 'async';

        });
    }

    function runOptimizations() {

        optimizeVideos();
        optimizeImages();

    }

    injectCSS();

    runOptimizations();

    const observer = new MutationObserver(mutations => {

    let encontrouNovoConteudo = false;

    for (const mutation of mutations) {

        if (mutation.addedNodes.length) {
            encontrouNovoConteudo = true;
            break;
        }

    }

    if (!encontrouNovoConteudo) return;

    clearTimeout(window.__adsOptimizerTimeout);

    window.__adsOptimizerTimeout =
        setTimeout(runOptimizations, 1000);

});

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log(
        '[Ads Library Optimizer] ativo'
    );

})();
