// ============================================================
// AUTO ADS LIBRARY
// ATUALIZADO 17.09.2026
// ============================================================

(() => {

    'use strict';

    // ========================================================
    // LIMPA INSTALAÇÃO ANTERIOR
    // ========================================================

    if (window.AUTO_ADS?.timer) {
        clearInterval(window.AUTO_ADS.timer);
    }

    if (window.AUTO_ADS?.limitMonitor) {
        clearInterval(window.AUTO_ADS.limitMonitor);
    }

    if (window.AUTO_ADS?.actionTimeout) {
        clearTimeout(window.AUTO_ADS.actionTimeout);
    }

    if (window.autoAdsToastTimer) {
        clearTimeout(window.autoAdsToastTimer);
    }

    document.getElementById("auto-ads-config-btn")?.remove();
    document.getElementById("auto-ads-popup")?.remove();
    document.getElementById("auto-ads-toast")?.remove();


    // ========================================================
    // TOAST
    // ========================================================

    const mostrarMensagem = (texto) => {

        let toast =
            document.getElementById("auto-ads-toast");

        if (!toast) {

            toast =
                document.createElement("div");

            toast.id =
                "auto-ads-toast";

            Object.assign(
                toast.style,
                {
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    zIndex: "2147483647",
                    padding: "12px 18px",
                    background: "#111",
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "Arial, sans-serif",
                    boxShadow: "0 4px 12px rgba(0,0,0,.3)",
                    transition: "opacity .2s",
                    pointerEvents: "none"
                }
            );

            document.body.appendChild(
                toast
            );
        }

        toast.textContent =
            texto;

        toast.style.opacity =
            "1";

        clearTimeout(
            window.autoAdsToastTimer
        );

        window.autoAdsToastTimer =
            setTimeout(() => {

                toast.style.opacity =
                    "0";

            }, 2500);
    };


    // ========================================================
    // AUTO ADS
    // ========================================================

    window.AUTO_ADS = {

        timer: null,

        limitMonitor: null,

        actionTimeout: null,

        executando: false,

        intervalo: 3000,

        // ====================================================
        // LIMITE PADRÃO = 3500
        // ====================================================

        limite: parseInt(
            localStorage.getItem("autoAdsLimite") || "3500",
            10
        ),


        // ====================================================
        // FORMATA NÚMERO
        // ====================================================

        formatarNumero(numero) {

            return Number(numero)
                .toLocaleString("pt-BR");

        },


        // ====================================================
        // LÊ CONTADOR DA ADS LIBRARY
        // ====================================================

        obterQuantidadeAnuncios() {

            let badge =
                document.querySelector(
                    "#filtered-ads-toggle-btn .ui-btn-badge"
                );


            if (!badge) {

                badge =
                    document.querySelector(
                        "#filtered-ads-toggle-btn"
                    );

            }


            if (!badge) {
                return null;
            }


            const texto = (

                badge.textContent ||

                badge.innerText ||

                ""

            ).trim();


            if (!texto) {
                return null;
            }


            /*
             * FORMATO PRINCIPAL
             *
             * Exemplos:
             *
             * 92/92
             * 1.245/1.245
             * 3.000/3.000
             * 4000/4000
             *
             * Mantemos o comportamento original:
             * pegar o SEGUNDO número.
             */

            const matchBarra =
                texto.match(
                    /\/\s*([\d.,]+)/
                );


            if (matchBarra) {

                let numeroTexto =
                    matchBarra[1];

                numeroTexto =
                    numeroTexto
                        .replace(/\./g, "")
                        .replace(/,/g, "");

                const numero =
                    parseInt(
                        numeroTexto,
                        10
                    );

                if (!isNaN(numero)) {
                    return numero;
                }

            }


            /*
             * FALLBACK
             *
             * Caso o Facebook altere o formato para algo como:
             *
             * "1–100 de 3.500"
             *
             * usamos o segundo número.
             */

            const matchDe =
                texto.match(
                    /(?:de|of)\s*([\d.,]+)/i
                );


            if (matchDe) {

                let numeroTexto =
                    matchDe[1];

                numeroTexto =
                    numeroTexto
                        .replace(/\./g, "")
                        .replace(/,/g, "");

                const numero =
                    parseInt(
                        numeroTexto,
                        10
                    );

                if (!isNaN(numero)) {
                    return numero;
                }

            }


            /*
             * OUTRO FALLBACK
             *
             * Exemplos:
             *
             * "3500 resultados"
             * "3.500 anúncios"
             */

            const matchResultado =
                texto.match(
                    /([\d.,]+)\s*(?:resultados?|anúncios?)/i
                );


            if (matchResultado) {

                let numeroTexto =
                    matchResultado[1];

                numeroTexto =
                    numeroTexto
                        .replace(/\./g, "")
                        .replace(/,/g, "");

                const numero =
                    parseInt(
                        numeroTexto,
                        10
                    );

                if (!isNaN(numero)) {
                    return numero;
                }

            }


            return null;
        },


        // ====================================================
        // VERIFICA LIMITE
        // ====================================================

        verificarLimite() {

            const quantidade =
                this.obterQuantidadeAnuncios();


            /*
             * IMPORTANTE:
             *
             * Se o contador não puder ser lido,
             * NÃO deixamos a automação continuar cegamente.
             *
             * Isso evita justamente o problema de ficar
             * rolando e clicando infinitamente quando o
             * Facebook muda o DOM.
             */

            if (quantidade === null) {

                console.warn(
                    "[AUTO ADS] Não foi possível ler o contador da Ads Library."
                );

                return true;
            }


            if (
                quantidade >=
                this.limite
            ) {

                if (this.timer) {

                    clearInterval(
                        this.timer
                    );

                    this.timer =
                        null;

                }


                if (this.actionTimeout) {

                    clearTimeout(
                        this.actionTimeout
                    );

                    this.actionTimeout =
                        null;

                }


                this.executando =
                    false;


                mostrarMensagem(
                    `🛑 Limite atingido: ${this.formatarNumero(quantidade)} anúncios`
                );


                console.log(
                    "[AUTO ADS] Limite atingido:",
                    quantidade,
                    "de",
                    this.limite
                );


                return true;
            }


            return false;
        },


        // ====================================================
        // EXECUTA SCROLL + VER MAIS
        // ====================================================

        executar() {

            /*
             * Impede duas execuções simultâneas.
             */

            if (this.executando) {
                return;
            }


            /*
             * Verifica o limite antes de qualquer ação.
             */

            if (this.verificarLimite()) {
                return;
            }


            this.executando =
                true;


            /*
             * SCROLL
             */

            window.scrollBy({

                top: 1200,

                /*
                 * Mantido smooth para preservar
                 * o comportamento visual original.
                 */

                behavior: "smooth"

            });


            /*
             * Cancela qualquer timeout anterior
             * que eventualmente ainda exista.
             */

            if (this.actionTimeout) {

                clearTimeout(
                    this.actionTimeout
                );

            }


            /*
             * Aguarda o DOM atualizar após o scroll.
             */

            this.actionTimeout =
                setTimeout(() => {

                    this.actionTimeout =
                        null;


                    /*
                     * Reconfere o limite antes
                     * de clicar em "Ver mais".
                     */

                    if (
                        this.verificarLimite()
                    ) {

                        this.executando =
                            false;

                        return;

                    }


                    /*
                     * Procura apenas o primeiro
                     * "Ver mais".
                     *
                     * O código antigo clicava em TODOS.
                     * Isso podia gerar uma sequência enorme
                     * de carregamentos simultâneos.
                     */

                    const elementos =
                        document.querySelectorAll(
                            'a[role="button"], button, div[role="button"], span'
                        );


                    let clicou =
                        false;


                    for (
                        const el of elementos
                    ) {

                        const texto = (

                            el.innerText ||

                            el.textContent ||

                            ""

                        )
                            .trim()
                            .toLowerCase();


                        if (

                            texto === "ver mais" ||

                            texto.startsWith(
                                "ver mais"
                            ) ||

                            texto.includes(
                                "ver mais"
                            )

                        ) {

                            try {

                                el.click();

                                clicou =
                                    true;

                                console.log(
                                    "[AUTO ADS] Ver Mais clicado."
                                );

                            } catch (erro) {

                                console.warn(
                                    "[AUTO ADS] Erro ao clicar em Ver Mais:",
                                    erro
                                );

                            }


                            /*
                             * SOMENTE UM POR CICLO.
                             */

                            break;

                        }

                    }


                    this.executando =
                        false;


                    /*
                     * Pequeno monitoramento após
                     * o clique para detectar rapidamente
                     * se o limite foi alcançado.
                     */

                    if (clicou) {

                        setTimeout(() => {

                            this.verificarLimite();

                        }, 500);

                    }


                }, 350);

        },


        // ====================================================
        // INICIAR
        // ====================================================

        iniciar() {

            if (
                this.verificarLimite()
            ) {
                return;
            }


            if (this.timer) {

                mostrarMensagem(
                    `Já rodando (${this.intervalo / 1000}s)`
                );

                return;

            }


            this.timer =
                setInterval(() => {

                    this.executar();

                }, this.intervalo);


            mostrarMensagem(
                `🚀 Iniciado (${this.intervalo / 1000}s) | Limite ${this.formatarNumero(this.limite)}`
            );


            console.log(
                "[AUTO ADS] Iniciado."
            );

        },


        // ====================================================
        // PARAR
        // ====================================================

        parar() {

            /*
             * SEMPRE cancela o intervalo.
             */

            if (this.timer) {

                clearInterval(
                    this.timer
                );

                this.timer =
                    null;

            }


            /*
             * Cancela o "Ver Mais" agendado.
             */

            if (this.actionTimeout) {

                clearTimeout(
                    this.actionTimeout
                );

                this.actionTimeout =
                    null;

            }


            this.executando =
                false;


            mostrarMensagem(
                "🛑 Parado"
            );


            console.log(
                "[AUTO ADS] Parado."
            );

        },


        // ====================================================
        // ALTERAR VELOCIDADE
        // ====================================================

        alterarVelocidade() {

            const atual =
                this.intervalo / 1000;


            const valor =
                prompt(
                    `Velocidade atual: ${atual}s\n\nDigite a nova velocidade em segundos:`,
                    atual
                );


            if (valor === null) {
                return;
            }


            const segundos =
                parseFloat(
                    valor.replace(",", ".")
                );


            if (

                isNaN(segundos) ||

                segundos <= 0

            ) {

                mostrarMensagem(
                    "❌ Valor inválido"
                );

                return;

            }


            this.intervalo =
                segundos * 1000;


            const estavaRodando =
                !!this.timer;


            if (estavaRodando) {

                clearInterval(
                    this.timer
                );

                this.timer =
                    null;

                this.iniciar();

            }


            mostrarMensagem(
                `⚡ Velocidade: ${segundos}s`
            );


            console.log(
                "[AUTO ADS] Intervalo atualizado:",
                segundos,
                "segundos"
            );

        },


        // ====================================================
        // CONVERTER LIMITE
        // ====================================================

        converterLimite(valor) {

            if (!valor) {
                return null;
            }


            let texto =
                String(valor)
                    .trim()
                    .toLowerCase()
                    .replace(/\s/g, "");


            // -----------------------------------------------
            // 3k / 4k / 10k
            // -----------------------------------------------

            if (
                texto.endsWith("k")
            ) {

                const numero =
                    parseFloat(
                        texto
                            .slice(0, -1)
                            .replace(",", ".")
                    );


                if (

                    isNaN(numero) ||

                    numero <= 0

                ) {

                    return null;

                }


                return Math.round(
                    numero * 1000
                );

            }


            // -----------------------------------------------
            // 3000 / 3.000 / 10000
            // -----------------------------------------------

            texto =
                texto.replace(
                    /\./g,
                    ""
                );


            const numero =
                parseInt(
                    texto,
                    10
                );


            if (

                isNaN(numero) ||

                numero <= 0

            ) {

                return null;

            }


            return numero;

        },


        // ====================================================
        // ALTERAR LIMITE
        // ====================================================

        alterarLimite() {

            const atual =
                this.formatarNumero(
                    this.limite
                );


            const valor =
                prompt(
                    `Limite atual: ${atual} anúncios\n\nDigite o novo limite:\n\nExemplos: 3500, 3.5k, 4k, 5000`,
                    atual
                );


            if (valor === null) {
                return;
            }


            const novoLimite =
                this.converterLimite(
                    valor
                );


            if (

                novoLimite === null ||

                novoLimite < 1

            ) {

                mostrarMensagem(
                    "❌ Limite inválido"
                );

                return;

            }


            this.limite =
                novoLimite;


            localStorage.setItem(
                "autoAdsLimite",
                String(novoLimite)
            );


            atualizarTextoLimite();


            mostrarMensagem(
                `🔢 Limite definido: ${this.formatarNumero(novoLimite)}`
            );


            console.log(
                "[AUTO ADS] Novo limite:",
                novoLimite
            );


            this.verificarLimite();

        },


        // ====================================================
        // MONITORAMENTO DO CONTADOR
        // ====================================================

        iniciarMonitorLimite() {

            if (
                this.limitMonitor
            ) {

                clearInterval(
                    this.limitMonitor
                );

            }


            this.limitMonitor =
                setInterval(() => {

                    this.verificarLimite();

                }, 500);

        }

    };


    // ========================================================
    // POPUP
    // ========================================================

    const popup =
        document.createElement("div");


    popup.id =
        "auto-ads-popup";


    Object.assign(
        popup.style,
        {

            position: "fixed",

            bottom: "20px",

            right: "105px",

            width: "210px",

            background: "#111",

            color: "#fff",

            borderRadius: "12px",

            padding: "10px",

            zIndex: "2147483646",

            boxShadow:
                "0 6px 20px rgba(0,0,0,.4)",

            fontFamily:
                "Arial, sans-serif",

            display: "none",

            boxSizing: "border-box",

            border:
                "1px solid rgba(255,255,255,.08)"

        }
    );


    popup.innerHTML = `

        <div style="
            font-size:13px;
            font-weight:bold;
            margin-bottom:8px;
            padding:2px 4px;
        ">
            ⚙ Auto Ads
        </div>

        <button id="auto-ads-speed-btn">
            ⚡ Velocidade
        </button>

        <button id="auto-ads-limit-btn">
            🔢 Limite: ${window.AUTO_ADS.formatarNumero(window.AUTO_ADS.limite)}
        </button>

    `;


    // ========================================================
    // ESTILO DOS BOTÕES
    // ========================================================

    popup
        .querySelectorAll("button")
        .forEach(button => {

            Object.assign(
                button.style,
                {

                    width: "100%",

                    border: "none",

                    background: "#222",

                    color: "#fff",

                    padding: "10px",

                    marginBottom: "6px",

                    borderRadius: "7px",

                    cursor: "pointer",

                    fontSize: "12px",

                    textAlign: "left",

                    boxSizing: "border-box"

                }
            );


            button.addEventListener(
                "mouseenter",
                () => {

                    button.style.background =
                        "#333";

                }
            );


            button.addEventListener(
                "mouseleave",
                () => {

                    button.style.background =
                        "#222";

                }
            );

        });


    document.body.appendChild(
        popup
    );


    // ========================================================
    // ATUALIZA TEXTO DO LIMITE
    // ========================================================

    function atualizarTextoLimite() {

        const button =
            document.getElementById(
                "auto-ads-limit-btn"
            );


        if (!button) {
            return;
        }


        button.textContent =
            `🔢 Limite: ${window.AUTO_ADS.formatarNumero(window.AUTO_ADS.limite)}`;

    }


    // ========================================================
    // BOTÃO VELOCIDADE
    // ========================================================

    document
        .getElementById(
            "auto-ads-speed-btn"
        )
        .addEventListener(
            "click",
            (e) => {

                e.preventDefault();

                e.stopPropagation();

                window.AUTO_ADS
                    .alterarVelocidade();

            }
        );


    // ========================================================
    // BOTÃO LIMITE
    // ========================================================

    document
        .getElementById(
            "auto-ads-limit-btn"
        )
        .addEventListener(
            "click",
            (e) => {

                e.preventDefault();

                e.stopPropagation();

                window.AUTO_ADS
                    .alterarLimite();

            }
        );


    // ========================================================
    // BOTÃO FLUTUANTE AUTO ADS
    // ========================================================

    const btn =
        document.createElement("div");


    btn.id =
        "auto-ads-config-btn";


    btn.innerHTML =
        "⚙";


    Object.assign(
        btn.style,
        {

            position: "fixed",

            bottom: "20px",

            right: "20px",

            width: "50px",

            height: "50px",

            borderRadius: "50%",

            background: "#ff3b30",

            color: "#fff",

            display: "none",

            alignItems: "center",

            justifyContent: "center",

            fontSize: "24px",

            cursor: "pointer",

            zIndex: "2147483647",

            boxShadow:
                "0 4px 12px rgba(0,0,0,.4)",

            userSelect: "none"

        }
    );


    btn.title =
        "Configurações";


    btn.addEventListener(
        "click",
        (e) => {

            e.preventDefault();

            e.stopPropagation();


            popup.style.display =
                popup.style.display === "none"
                    ? "block"
                    : "none";

        }
    );


    document.body.appendChild(
        btn
    );


    // ========================================================
    // FECHAR POPUP CLICANDO FORA
    // ========================================================

    document.addEventListener(
        "click",
        (e) => {

            const alvo =
                e.target;


            if (

                popup.contains(alvo) ||

                alvo === btn ||

                document
                    .getElementById("mw-gear")
                    ?.contains(alvo)

            ) {

                return;

            }


            popup.style.display =
                "none";

        },
        true
    );


    // ========================================================
    // ATALHOS
    // ========================================================

    document.addEventListener(
        "keydown",
        (e) => {

            const tecla =
                e.key.toLowerCase();


            if (
                ["input", "textarea"]
                    .includes(
                        document.activeElement
                            ?.tagName
                            ?.toLowerCase()
                    )
            ) {

                return;

            }


            if (
                tecla === "p"
            ) {

                window.AUTO_ADS
                    .parar();

            }


            if (
                tecla === "ç"
            ) {

                window.AUTO_ADS
                    .iniciar();

            }

        }
    );


    // ========================================================
    // MONITORAMENTO
    // ========================================================

    window.AUTO_ADS
        .iniciarMonitorLimite();


    mostrarMensagem(
        `Ativado | Ç iniciar | P parar | ⚙ configurações | Limite ${window.AUTO_ADS.formatarNumero(window.AUTO_ADS.limite)}`
    );


})();


// ============================================================
// SCRIPT 02
// FILTRO WHATSAPP + BOTÕES DOS ANÚNCIOS
// ============================================================

(function () {
    'use strict';

    // ============================================================
    // LIMPA INSTALAÇÃO ANTERIOR
    // ============================================================

    if (window.__AUTO_WHATSAPP_FILTER_CLEANUP) {
        try {
            window.__AUTO_WHATSAPP_FILTER_CLEANUP();
        } catch (e) {}
    }

    // ============================================================
    // CONTROLE
    // ============================================================

    const processed = new WeakSet();
    let scanTimeout = null;

    // Guarda IDs que já foram removidos pelo filtro nesta execução.
    // Isso evita tentar remover o mesmo anúncio repetidamente.
    const whatsappRemovidos = new WeakSet();

    // ============================================================
    // ESTILO
    // ============================================================

    function injectCSS() {

        if (document.getElementById('auto-whatsapp-style')) return;

        const style = document.createElement('style');

        style.id = 'auto-whatsapp-style';

        style.textContent = `

            /* =====================================================
               BARRA DOS BOTÕES
               ===================================================== */

            .meu-ad-bar {
                display: flex !important;
                gap: 6px !important;
                align-items: center !important;
                justify-content: center !important;

                margin-top: 8px !important;
                padding: 6px !important;

                background: #f5f5f5 !important;
                border-radius: 8px !important;

                position: relative !important;
                z-index: 9999 !important;
            }

            .meu-ad-btn {
                border: none !important;
                border-radius: 6px !important;

                padding: 6px 9px !important;

                font-size: 12px !important;
                font-weight: 600 !important;

                cursor: pointer !important;

                color: white !important;

                transition: opacity .15s ease !important;
            }

            .meu-ad-btn:hover {
                opacity: .8 !important;
            }

            .meu-ad-site {
                background: #1877f2 !important;
            }

            .meu-ad-ads {
                background: #4267B2 !important;
            }

            .meu-ad-img {
                background: #00a884 !important;
            }

            .meu-ad-video {
                background: #e91e63 !important;
            }

            .meu-ad-close {
                background: #ff3b30 !important;
            }

            /* =====================================================
               PAINEL
               ===================================================== */

            #auto-whatsapp-panel {
                position: fixed !important;

                right: 20px !important;
                bottom: 20px !important;

                width: 70px !important;
                height: 110px !important;

                background: #ff3b30 !important;

                border-radius: 35px !important;

                z-index: 2147483647 !important;

                display: flex !important;
                flex-direction: column !important;

                align-items: center !important;
                justify-content: center !important;

                box-shadow: 0 4px 15px rgba(0,0,0,.25) !important;

                user-select: none !important;
            }

            #auto-whatsapp-title {
                color: white !important;

                font-size: 11px !important;
                font-weight: 700 !important;

                margin-bottom: 7px !important;

                text-align: center !important;
            }

            #auto-whatsapp-toggle {
                width: 52px !important;
                height: 26px !important;

                border-radius: 15px !important;

                background: rgba(255,255,255,.35) !important;

                position: relative !important;

                cursor: pointer !important;
            }

            #auto-whatsapp-ball {
                width: 22px !important;
                height: 22px !important;

                border-radius: 50% !important;

                background: white !important;

                position: absolute !important;

                top: 2px !important;
                left: 2px !important;

                transition: left .2s ease !important;

                box-shadow: 0 1px 4px rgba(0,0,0,.25) !important;
            }

            #auto-whatsapp-gear {
                color: white !important;

                font-size: 14px !important;

                margin-top: 8px !important;

                cursor: pointer !important;

                opacity: .9 !important;
            }

        `;

        document.head.appendChild(style);
    }

    // ============================================================
    // FILTRO WHATSAPP — ESTADO
    // ============================================================

    function filtroWhatsappAtivo() {
        return localStorage.getItem('meuFiltroWhatsapp') === '1';
    }

    // ============================================================
    // PAINEL
    // ============================================================

    function criarPainelFiltro() {

        const antigo = document.getElementById('auto-whatsapp-panel');

        if (antigo) antigo.remove();

        const panel = document.createElement('div');

        panel.id = 'auto-whatsapp-panel';

        panel.innerHTML = `

            <div id="auto-whatsapp-title">
                WhatsApp
            </div>

            <div id="auto-whatsapp-toggle">

                <div id="auto-whatsapp-ball"></div>

            </div>

            <div id="auto-whatsapp-gear">
                ⚙️
            </div>

        `;

        document.body.appendChild(panel);

        const toggle = document.getElementById('auto-whatsapp-toggle');
        const ball = document.getElementById('auto-whatsapp-ball');

        function atualizarToggle() {

            if (filtroWhatsappAtivo()) {

                ball.style.left = '28px';

            } else {

                ball.style.left = '2px';

            }
        }

        atualizarToggle();

        toggle.addEventListener('click', function () {

            const ativo = filtroWhatsappAtivo();

            if (ativo) {

                localStorage.setItem('meuFiltroWhatsapp', '0');

                atualizarToggle();

                alert('Filtro WhatsApp DESATIVADO');

            } else {

                localStorage.setItem('meuFiltroWhatsapp', '1');

                atualizarToggle();

                // Executa imediatamente nos cards atuais
                scan();

                alert('Filtro WhatsApp ATIVADO');

            }

        });

        const gear = document.getElementById('auto-whatsapp-gear');

        gear.addEventListener('click', function () {

            alert(
                'Filtro WhatsApp\\n\\n' +
                'Quando ativado, anúncios cujo link exibido é api.whatsapp.com ' +
                'serão fechados automaticamente.'
            );

        });

    }

    // ============================================================
    // IDENTIFICA AD ID DO CARD
    // ============================================================

    function extrairAdId(card) {

        if (!card) return null;

        try {

            // O Ads Library coloca o ID diretamente no atributo adid
            const elementoComAdId = card.querySelector('[adid]');

            if (elementoComAdId) {

                const id = elementoComAdId.getAttribute('adid');

                if (id) return String(id);

            }

            // Caso o próprio card possua o atributo
            const proprio = card.getAttribute('adid');

            if (proprio) {
                return String(proprio);
            }

        } catch (e) {}

        return null;
    }

    // ============================================================
    // URL WHATSAPP
    // ============================================================

    function ehUrlWhatsapp(url) {

        if (!url || typeof url !== 'string') {
            return false;
        }

        try {

            const parsed = new URL(url);

            return parsed.hostname.toLowerCase() === 'api.whatsapp.com';

        } catch (e) {

            return url.toLowerCase().includes('api.whatsapp.com');

        }

    }

    // ============================================================
    // PERCORRE JSON RECURSIVAMENTE
    // ============================================================

    function percorrerJSON(valor, callback) {

        if (!valor) return;

        if (Array.isArray(valor)) {

            for (const item of valor) {

                percorrerJSON(item, callback);

            }

            return;
        }

        if (typeof valor !== 'object') {
            return;
        }

        callback(valor);

        for (const chave in valor) {

            if (!Object.prototype.hasOwnProperty.call(valor, chave)) {
                continue;
            }

            try {

                percorrerJSON(valor[chave], callback);

            } catch (e) {}

        }

    }

    // ============================================================
    // LÊ OS ANÚNCIOS DOS JSONs DA PÁGINA
    // ============================================================

    function obterAnunciosDoJSON() {

        const anuncios = new Map();

        const scripts = document.querySelectorAll(
            'script[type="application/json"]'
        );

        scripts.forEach(script => {

            const texto = script.textContent || '';

            if (!texto.includes('ad_archive_id')) {
                return;
            }

            try {

                const json = JSON.parse(texto);

                percorrerJSON(json, function (obj) {

                    if (
                        !obj ||
                        !obj.ad_archive_id ||
                        !obj.snapshot
                    ) {
                        return;
                    }

                    const id = String(obj.ad_archive_id);

                    const snapshot = obj.snapshot;

                    const caption =
                        typeof snapshot.caption === 'string'
                            ? snapshot.caption.trim().toLowerCase()
                            : '';

                    const linkUrl =
                        typeof snapshot.link_url === 'string'
                            ? snapshot.link_url
                            : '';

                    /*
                     * DETECÇÃO PRINCIPAL
                     *
                     * O que interessa é:
                     *
                     * ad_archive_id
                     * +
                     * snapshot.caption = api.whatsapp.com
                     *
                     * ou link_url apontando para api.whatsapp.com
                     */

                    const ehWhatsapp =
                        caption === 'api.whatsapp.com' ||
                        ehUrlWhatsapp(linkUrl);

                    anuncios.set(id, {

                        id: id,

                        ehWhatsapp: ehWhatsapp,

                        caption: caption,

                        linkUrl: linkUrl

                    });

                });

            } catch (e) {

                // Alguns scripts JSON podem não ser parseáveis.
                // Ignora e continua.

            }

        });

        return anuncios;
    }

    // ============================================================
    // OBTÉM IDS DOS ANÚNCIOS WHATSAPP
    // ============================================================

    function obterIdsWhatsapp() {

        const anuncios = obterAnunciosDoJSON();

        const ids = new Set();

        anuncios.forEach(anuncio => {

            if (anuncio.ehWhatsapp) {

                ids.add(String(anuncio.id));

            }

        });

        return ids;
    }

    // ============================================================
    // ENCONTRA CARDS
    // ============================================================

    function findCards() {

        const cards = new Set();

        document
            .querySelectorAll('.card-ad')
            .forEach(card => cards.add(card));

        document
            .querySelectorAll('[class*="xh8yej3"]')
            .forEach(card => {

                /*
                 * Só considera elementos que realmente parecem
                 * conter um anúncio.
                 */

                if (
                    card.querySelector('.card-ad') ||
                    card.hasAttribute('adid') ||
                    card.querySelector('[adid]')
                ) {

                    cards.add(card);

                }

            });

        return Array.from(cards);
    }

    // ============================================================
    // ENCONTRA CONTAINER REAL DO CARD
    // ============================================================

    function obterContainerCard(card) {

        if (!card) return null;

        /*
         * Primeiro tenta o próprio card.
         */
        if (card.matches('.card-ad')) {
            return card;
        }

        /*
         * Depois tenta encontrar o .card-ad dentro dele.
         */
        const interno = card.querySelector('.card-ad');

        if (interno) {
            return interno;
        }

        return card;
    }

    // ============================================================
    // REMOVE ANÚNCIO
    // MESMA FUNÇÃO USADA PELO BOTÃO "FECHAR"
    // ============================================================

    function removerAnuncio(card) {

        if (!card) return;

        const container = obterContainerCard(card);

        if (!container) return;

        /*
         * Evita executar duas vezes.
         */

        if (container.dataset.autoRemovendo === '1') {
            return;
        }

        container.dataset.autoRemovendo = '1';

        /*
         * Mantém o comportamento visual do botão Fechar:
         * primeiro desaparece e depois é removido do DOM.
         */

        container.style.transition = 'opacity 0.25s ease';

        container.style.opacity = '0';

        setTimeout(() => {

            try {

                container.remove();

            } catch (e) {}

        }, 250);

    }

    // ============================================================
    // EXTRAI LANDING PAGE
    // ============================================================

    function extrairLanding(card) {

        if (!card) return null;

        const links = Array.from(
            card.querySelectorAll('a[href]')
        );

        for (const a of links) {

            const href = a.href;

            if (!href) continue;

            if (
                href.includes('facebook.com') ||
                href.includes('instagram.com') ||
                href.includes('l.facebook.com') ||
                href.includes('fb.me')
            ) {
                continue;
            }

            if (href.startsWith('javascript:')) {
                continue;
            }

            return href;
        }

        return null;
    }

    // ============================================================
    // EXTRAI PÁGINA DO ANUNCIANTE
    // ============================================================

    function extrairPagina(card) {

        if (!card) return null;

        const links = Array.from(
            card.querySelectorAll('a[href]')
        );

        for (const a of links) {

            const href = a.href || '';

            if (
                href.includes('facebook.com') &&
                href.includes('/ads/library')
            ) {
                return href;
            }

        }

        const adId = extrairAdId(card);

        if (!adId) return null;

        return (
            'https://www.facebook.com/ads/library/?id=' +
            encodeURIComponent(adId)
        );

    }

    // ============================================================
    // BOTÃO
    // ============================================================

    function criarBotao(texto, classe, callback) {

        const button = document.createElement('button');

        button.type = 'button';

        button.className =
            'meu-ad-btn ' + classe;

        button.textContent = texto;

        button.addEventListener('click', function (event) {

            event.preventDefault();

            event.stopPropagation();

            try {
                callback();
            } catch (e) {
                console.error(
                    '[AUTO ADS] Erro no botão:',
                    e
                );
            }

        });

        return button;
    }

    // ============================================================
    // PROCESSA CARD
    // ============================================================

    function processarCard(card, idsWhatsapp) {

        if (!card) return;

        if (!document.body.contains(card)) {
            return;
        }

        const container = obterContainerCard(card);

        if (!container) return;

        /*
         * Se este card já está sendo removido, não mexe.
         */

        if (container.dataset.autoRemovendo === '1') {
            return;
        }

        // ========================================================
        // FILTRO WHATSAPP
        // ========================================================

        if (filtroWhatsappAtivo()) {

            const adId = extrairAdId(card);

            if (
                adId &&
                idsWhatsapp.has(String(adId))
            ) {

                /*
                 * IMPORTANTE:
                 *
                 * Não escondemos.
                 * Não usamos display:none.
                 *
                 * Chamamos exatamente a mesma função
                 * utilizada pelo botão "Fechar".
                 */

                if (!whatsappRemovidos.has(container)) {

                    whatsappRemovidos.add(container);

                    removerAnuncio(container);

                }

                return;

            }

        }

        // ========================================================
        // EVITA DUPLICAR BOTÕES
        // ========================================================

        if (processed.has(container)) {
            return;
        }

        if (
            container.querySelector('.meu-ad-bar')
        ) {

            processed.add(container);

            return;
        }

        processed.add(container);

        // ========================================================
        // CRIA BARRA
        // ========================================================

        const bar = document.createElement('div');

        bar.className = 'meu-ad-bar';

        // ========================================================
        // SITE
        // ========================================================

        const landing = extrairLanding(container);

        if (landing) {

            const btnSite = criarBotao(
                '🌐 Site',
                'meu-ad-site',
                function () {

                    window.open(
                        landing,
                        '_blank'
                    );

                }
            );

            bar.appendChild(btnSite);

        }

        // ========================================================
        // ADS
        // ========================================================

        const pagina = extrairPagina(container);

        if (pagina) {

            const btnAds = criarBotao(
                '📢 Ads',
                'meu-ad-ads',
                function () {

                    window.open(
                        pagina,
                        '_blank'
                    );

                }
            );

            bar.appendChild(btnAds);

        }

        // ========================================================
        // IMAGEM
        // ========================================================

        const imagem = container.querySelector(
            'img[src]'
        );

        if (imagem && imagem.src) {

            const btnImagem = criarBotao(
                '🖼️ Imagem',
                'meu-ad-img',
                function () {

                    window.open(
                        imagem.src,
                        '_blank'
                    );

                }
            );

            bar.appendChild(btnImagem);

        }

        // ========================================================
        // VÍDEO
        // ========================================================

        const video = container.querySelector(
            'video'
        );

        if (video) {

            const btnVideo = criarBotao(
                '🎬 Vídeo',
                'meu-ad-video',
                function () {

                    const src =
                        video.currentSrc ||
                        video.src ||
                        video.querySelector('source')?.src;

                    if (src) {

                        window.open(
                            src,
                            '_blank'
                        );

                    } else {

                        alert(
                            'Não foi possível encontrar a URL do vídeo.'
                        );

                    }

                }
            );

            bar.appendChild(btnVideo);

        }

        // ========================================================
        // FECHAR
        // ========================================================

        const btnFechar = criarBotao(
            '❌ Fechar',
            'meu-ad-close',
            function () {

                const primeiraConfirmacao =
                    confirm(
                        'Fechar este anúncio?'
                    );

                if (!primeiraConfirmacao) {
                    return;
                }

                const segundaConfirmacao =
                    confirm(
                        'Tem certeza que deseja remover este anúncio?'
                    );

                if (!segundaConfirmacao) {
                    return;
                }

                removerAnuncio(container);

            }
        );

        bar.appendChild(btnFechar);

        // ========================================================
        // INSERE BARRA
        // ========================================================

        container.appendChild(bar);

    }

    // ============================================================
    // SCAN
    // ============================================================

    function scan() {

        const cards = findCards();

        /*
         * Só processa os JSONs quando o filtro está ativo.
         *
         * Isso evita trabalho desnecessário quando o filtro
         * está desligado.
         */

        const idsWhatsapp =
            filtroWhatsappAtivo()
                ? obterIdsWhatsapp()
                : new Set();

        cards.forEach(card => {

            if (!card) return;

            if (!document.body.contains(card)) {
                return;
            }

            processarCard(
                card,
                idsWhatsapp
            );

        });

    }

    // ============================================================
    // MUTATION OBSERVER
    // ============================================================

    const observer =
        new MutationObserver(function () {

            clearTimeout(scanTimeout);

            scanTimeout = setTimeout(
                function () {

                    scan();

                },
                300
            );

        });

    // ============================================================
    // START
    // ============================================================

    function start() {

        injectCSS();

        /*
         * Se ainda não existe configuração,
         * começa DESLIGADO.
         */

        if (
            localStorage.getItem(
                'meuFiltroWhatsapp'
            ) === null
        ) {

            localStorage.setItem(
                'meuFiltroWhatsapp',
                '0'
            );

        }

        criarPainelFiltro();

        // Scan imediato
        scan();

        // Alguns anúncios/JSONs aparecem depois
        setTimeout(scan, 1000);

        setTimeout(scan, 2500);

        setTimeout(scan, 5000);

        // Observa novos anúncios carregados
        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }

    // ============================================================
    // CLEANUP
    // ============================================================

    window.__AUTO_WHATSAPP_FILTER_CLEANUP =
        function () {

            try {

                observer.disconnect();

            } catch (e) {}

            clearTimeout(scanTimeout);

            const panel =
                document.getElementById(
                    'auto-whatsapp-panel'
                );

            if (panel) {
                panel.remove();
            }

            const style =
                document.getElementById(
                    'auto-whatsapp-style'
                );

            if (style) {
                style.remove();
            }

        };

    // ============================================================
    // EXECUTA
    // ============================================================

    start();

})(); 
// ============================================================
// SCRIPT 03
// OTIMIZAR RAM
// ============================================================

(function () {

    'use strict';


    if (
        window.__adsLibraryOptimizerLoaded
    ) {
        return;
    }


    window.__adsLibraryOptimizerLoaded =
        true;


    const STYLE_ID =
        'ads-library-memory-optimizer';


    // ========================================================
    // CSS
    // ========================================================

    function injectCSS() {

        if (
            document.getElementById(
                STYLE_ID
            )
        ) {
            return;
        }


        const style =
            document.createElement(
                'style'
            );


        style.id =
            STYLE_ID;


        style.textContent = `

            .card-ad {

                content-visibility:
                    auto !important;

                contain-intrinsic-size:
                    1200px !important;

                contain:
                    content !important;

                overflow:
                    hidden !important;

            }


            video {

                contain:
                    layout paint style !important;

            }


            img {

                will-change:
                    auto !important;

            }

        `;


        document.head.appendChild(
            style
        );

    }


    // ========================================================
    // OTIMIZAR VÍDEOS
    // ========================================================

    function optimizeVideos() {

        const videos =
            document.querySelectorAll(
                'video'
            );


        videos.forEach(
            video => {

                if (
                    video.dataset.memoryOptimized
                ) {
                    return;
                }


                video.dataset.memoryOptimized =
                    '1';


                video.preload =
                    'metadata';

            }
        );

    }


    // ========================================================
    // OTIMIZAR IMAGENS
    // ========================================================

    function optimizeImages() {

        const images =
            document.querySelectorAll(
                'img'
            );


        images.forEach(
            img => {

                if (
                    img.dataset.memoryOptimized
                ) {
                    return;
                }


                img.dataset.memoryOptimized =
                    '1';


                img.loading =
                    'lazy';


                img.decoding =
                    'async';

            }
        );

    }


    // ========================================================
    // RODAR OTIMIZAÇÕES
    // ========================================================

    function runOptimizations() {

        optimizeVideos();

        optimizeImages();

    }


    injectCSS();

    runOptimizations();


    const observer =
        new MutationObserver(
            mutations => {

                let encontrouNovoConteudo =
                    false;


                for (
                    const mutation of mutations
                ) {

                    if (
                        mutation.addedNodes.length
                    ) {

                        encontrouNovoConteudo =
                            true;

                        break;

                    }

                }


                if (
                    !encontrouNovoConteudo
                ) {
                    return;
                }


                clearTimeout(
                    window.__adsOptimizerTimeout
                );


                window.__adsOptimizerTimeout =
                    setTimeout(
                        runOptimizations,
                        1000
                    );

            }
        );


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    console.log(
        '[Ads Library Optimizer] ativo'
    );

})();
