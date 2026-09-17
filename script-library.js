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


    // ========================================================
    // LIMPA INSTALAÇÃO ANTERIOR
    // ========================================================

    if (window.__AUTO_WHATSAPP_FILTER_CLEANUP) {

        try {
            window.__AUTO_WHATSAPP_FILTER_CLEANUP();
        } catch (e) {}

    }


    const processed =
        new WeakSet();


    let scanTimeout =
        null;


    // Guarda os cards que foram ocultados pelo filtro.
    // Isso permite DESAPLICAR o filtro depois.
    const whatsappOcultos =
        new WeakSet();


    // ========================================================
    // PAINEL LARANJA
    // ========================================================

    function criarPainelFiltro() {

        if (
            document.getElementById(
                'meu-filtro-whatsapp'
            )
        ) {
            return;
        }


        const painel =
            document.createElement('div');


        painel.id =
            'meu-filtro-whatsapp';


        painel.innerHTML = `

            <div id="mw-toggle-track">
                <div id="mw-toggle-ball"></div>
            </div>

            <div id="mw-gear" title="Configurações Auto Ads">
                ⚙
            </div>

        `;


        Object.assign(
            painel.style,
            {

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

                boxShadow:
                    '0 4px 16px rgba(0,0,0,.3)',

                userSelect: 'none'

            }
        );


        const track =
            painel.querySelector(
                '#mw-toggle-track'
            );


        const ball =
            painel.querySelector(
                '#mw-toggle-ball'
            );


        const gear =
            painel.querySelector(
                '#mw-gear'
            );


        // ====================================================
        // ENGRENAGEM
        // ====================================================

        Object.assign(
            gear.style,
            {

                width: '40px',

                height: '34px',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                fontSize: '20px',

                cursor: 'pointer',

                lineHeight: '1',

                borderRadius: '8px',

                transition:
                    'background .15s'

            }
        );


        gear.addEventListener(
            'mouseenter',
            () => {

                gear.style.background =
                    'rgba(0,0,0,.15)';

            }
        );


        gear.addEventListener(
            'mouseleave',
            () => {

                gear.style.background =
                    'transparent';

            }
        );


        // ====================================================
        // TOGGLE
        // ====================================================

        Object.assign(
            track.style,
            {

                width: '52px',

                height: '26px',

                borderRadius: '20px',

                background: '#111',

                position: 'relative',

                cursor: 'pointer'

            }
        );


        Object.assign(
            ball.style,
            {

                width: '22px',

                height: '22px',

                borderRadius: '50%',

                background: '#e6e6e6',

                position: 'absolute',

                top: '2px',

                transition: '.2s',

                boxShadow:
                    '0 1px 3px rgba(0,0,0,.3)'

            }
        );


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


        // ====================================================
        // TOGGLE WHATSAPP
        // ====================================================

        track.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                e.stopPropagation();


                const ligado =
                    localStorage.getItem(
                        'meuFiltroWhatsapp'
                    ) === '1';


                const novoEstado =
                    ligado
                        ? '0'
                        : '1';


                localStorage.setItem(
                    'meuFiltroWhatsapp',
                    novoEstado
                );


                atualizar();


                // ============================================
                // ATIVOU
                // ============================================

                if (
                    novoEstado === '1'
                ) {

                    scan();


                    alert(
                        'Filtro WhatsApp ATIVADO'
                    );

                }


                // ============================================
                // DESATIVOU
                // ============================================

                else {

                    desaplicarFiltroWhatsapp();


                    alert(
                        'Filtro WhatsApp DESATIVADO'
                    );

                }

            }
        );


        // ====================================================
        // ENGRENAGEM ABRE O POPUP
        // ====================================================

        gear.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                e.stopPropagation();


                const popup =
                    document.getElementById(
                        "auto-ads-popup"
                    );


                if (!popup) {

                    console.warn(
                        "[AUTO ADS] Popup não encontrado."
                    );

                    return;

                }


                popup.style.display =
                    popup.style.display === "none"
                        ? "block"
                        : "none";

            }
        );


        document.body.appendChild(
            painel
        );

    }


    // ========================================================
    // CSS DOS BOTÕES DOS ANÚNCIOS
    // ========================================================

    function injectCSS() {

        if (
            document.getElementById(
                'meu-ad-style'
            )
        ) {
            return;
        }


        const style =
            document.createElement('style');


        style.id =
            'meu-ad-style';


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

                box-sizing: border-box;

            }


            .meu-ad-btn:hover {

                background: #e4e6eb;

            }

        `;


        document.head.appendChild(
            style
        );

    }


    // ========================================================
    // CRIAR BOTÃO
    // ========================================================

    function criarBotao(
        texto,
        onClick
    ) {

        const btn =
            document.createElement(
                'button'
            );


        btn.className =
            'meu-ad-btn';


        btn.textContent =
            texto;


        btn.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                e.stopPropagation();

                onClick();

            }
        );


        return btn;

    }


    // ========================================================
    // EXTRAIR PÁGINA
    // ========================================================

    function extrairPagina(card) {

        const a =
            [...card.querySelectorAll(
                'a[href*="facebook.com/"]'
            )]
            .find(el =>

                !el.href.includes(
                    'l.facebook.com'
                ) &&

                !el.href.includes(
                    '/ads/library'
                )

            );


        if (!a) {
            return null;
        }


        const nome =
            (a.textContent || '')
                .trim();


        let pageId =
            null;


        try {

            const reactKey =
                Object.keys(card)
                    .find(k =>
                        k.startsWith(
                            '__reactProps$'
                        )
                    );


            if (reactKey) {

                const data =
                    JSON.stringify(
                        card[reactKey]
                    );


                const match =
                    data.match(
                        /"page_id"\s*:\s*"(\d+)"/
                    );


                if (match) {

                    pageId =
                        match[1];

                }

            }

        } catch (e) {}


        if (!pageId) {

            const matchHref =
                a.href.match(
                    /facebook\.com\/(\d+)\/?$/
                );


            if (matchHref) {

                pageId =
                    matchHref[1];

            }

        }


        return {
            nome,
            url: a.href,
            pageId
        };

    }


    // ========================================================
    // EXTRAIR LANDING
    // ========================================================

    function extrairLanding(card) {

        const a =
            [...card.querySelectorAll(
                'a[href]'
            )]
            .find(el =>
                el.href.includes(
                    'l.facebook.com/l.php?u='
                )
            );


        if (!a) {
            return null;
        }


        try {

            const url =
                new URL(a.href);


            const raw =
                url.searchParams.get('u');


            return raw
                ? decodeURIComponent(raw)
                : null;

        } catch {

            return null;

        }

    }


    // ========================================================
    // FILTRO WHATSAPP ATIVO?
    // ========================================================

    function filtroWhatsappAtivo() {

        return (
            localStorage.getItem(
                'meuFiltroWhatsapp'
            ) === '1'
        );

    }


    // ========================================================
    // DETECTAR API.WHATSAPP.COM
    // ========================================================

    function ehUrlWhatsapp(url) {

        if (!url) {
            return false;
        }


        try {

            const valor =
                String(url)
                    .trim()
                    .toLowerCase();


            if (
                valor ===
                'api.whatsapp.com'
            ) {
                return true;
            }


            const urlObj =
                new URL(
                    valor.startsWith('http')
                        ? valor
                        : `https://${valor}`
                );


            return (
                urlObj.hostname ===
                'api.whatsapp.com'
            );

        } catch {

            return String(url)
                .toLowerCase()
                .includes(
                    'api.whatsapp.com'
                );

        }

    }


    // ========================================================
    // PEGAR AD ID DO CARD
    // ========================================================

    function extrairAdId(card) {

        const elemento =
            card.querySelector(
                '[adid]'
            );


        if (!elemento) {
            return null;
        }


        const adId =
            elemento.getAttribute(
                'adid'
            );


        return adId
            ? String(adId).trim()
            : null;

    }


    // ========================================================
    // LER JSON DA ADS LIBRARY
    // ========================================================

    function obterAnunciosDoJSON() {

        const anuncios =
            new Map();


        const scripts =
            document.querySelectorAll(
                'script[type="application/json"]'
            );


        for (
            const script of scripts
        ) {

            const texto =
                script.textContent;


            if (
                !texto ||
                !texto.includes(
                    'ad_archive_id'
                )
            ) {
                continue;
            }


            let json;


            try {

                json =
                    JSON.parse(
                        texto
                    );

            } catch {

                continue;

            }


            percorrerJSON(
                json,
                anuncios
            );

        }


        return anuncios;

    }


    // ========================================================
    // PERCORRER JSON RECURSIVAMENTE
    // ========================================================

    function percorrerJSON(
        valor,
        anuncios
    ) {

        if (!valor) {
            return;
        }


        if (
            typeof valor !==
            'object'
        ) {
            return;
        }


        if (
            Array.isArray(valor)
        ) {

            for (
                const item of valor
            ) {

                percorrerJSON(
                    item,
                    anuncios
                );

            }


            return;

        }


        // ====================================================
        // ENCONTROU UM OBJETO DE ANÚNCIO
        // ====================================================

        if (
            valor.ad_archive_id &&
            valor.snapshot
        ) {

            const snapshot =
                valor.snapshot;


            const caption =
                typeof snapshot.caption === 'string'
                    ? snapshot.caption.trim().toLowerCase()
                    : '';


            const linkUrl =
                snapshot.link_url ||
                '';


            const ehWhatsapp =
                caption ===
                    'api.whatsapp.com' ||

                ehUrlWhatsapp(
                    linkUrl
                );


            if (ehWhatsapp) {

                anuncios.set(
                    String(
                        valor.ad_archive_id
                    ),
                    {
                        adId: String(
                            valor.ad_archive_id
                        ),

                        caption,

                        linkUrl,

                        pageId:
                            snapshot.page_id ||
                            valor.page_id ||
                            null,

                        pageName:
                            snapshot.page_name ||
                            '',

                        bodyText:
                            snapshot.body?.text ||
                            ''

                    }
                );

            }

        }


        for (
            const chave of Object.keys(valor)
        ) {

            try {

                percorrerJSON(
                    valor[chave],
                    anuncios
                );

            } catch (e) {}

        }

    }


    // ========================================================
    // PEGAR IDS WHATSAPP
    // ========================================================

    function obterIdsWhatsapp() {

        const anuncios =
            obterAnunciosDoJSON();


        return new Set(
            anuncios.keys()
        );

    }


    // ========================================================
    // OCULTAR CARD
    // ========================================================

    function ocultarCardWhatsapp(card) {

        if (!card) {
            return;
        }


        const container =
            card.closest('.card-ad') ||
            card;


        if (
            container.dataset
                .autoWhatsappOculto === '1'
        ) {
            return;
        }


        container.dataset
            .autoWhatsappOculto =
            '1';


        // Preserva o estado original.
        if (
            !container.dataset
                .autoWhatsappDisplayOriginal
        ) {

            container.dataset
                .autoWhatsappDisplayOriginal =
                container.style.display || '';

        }


        container.style.display =
            'none';


        whatsappOcultos.add(
            container
        );


        console.log(
            '[FILTRO WHATSAPP] Card ocultado:',
            extrairAdId(container)
        );

    }


    // ========================================================
    // DESAPLICAR FILTRO WHATSAPP
    // ========================================================

    function desaplicarFiltroWhatsapp() {

        const cards =
            findCards();


        for (
            const card of cards
        ) {

            const container =
                card.closest('.card-ad') ||
                card;


            if (
                container.dataset
                    .autoWhatsappOculto !== '1'
            ) {
                continue;
            }


            const displayOriginal =
                container.dataset
                    .autoWhatsappDisplayOriginal;


            container.style.display =
                displayOriginal || '';


            delete container.dataset
                .autoWhatsappOculto;


            delete container.dataset
                .autoWhatsappDisplayOriginal;


            console.log(
                '[FILTRO WHATSAPP] Card restaurado:',
                extrairAdId(container)
            );

        }

    }


    // ========================================================
    // REMOVER ANÚNCIO
    // ========================================================
    // Esta continua sendo a função REAL do botão "Fechar".
    // O filtro NÃO usa esta função, justamente para permitir
    // que o filtro seja desligado depois.
    // ========================================================

    function removerAnuncio(card) {

        const container =
            card.closest('.card-ad') ||
            card;


        if (
            container.dataset
                .autoWhatsappRemovendo === '1'
        ) {

            return;

        }


        container.dataset
            .autoWhatsappRemovendo =
            '1';


        container.style.transition =
            'opacity .15s ease';


        container.style.opacity =
            '0';


        setTimeout(() => {

            try {

                processed.delete(
                    card
                );


                container.remove();

            } catch {}

        }, 150);

    }


    // ========================================================
    // PROCESSAR CARD
    // ========================================================

    function processarCard(card) {

        if (!card) {
            return;
        }


        // ====================================================
        // ID DO ANÚNCIO
        // ====================================================

        const adId =
            extrairAdId(card);


        // ====================================================
        // FILTRO WHATSAPP
        // ====================================================

        if (
            filtroWhatsappAtivo() &&
            adId
        ) {

            const idsWhatsapp =
                obterIdsWhatsapp();


            if (
                idsWhatsapp.has(
                    adId
                )
            ) {

                ocultarCardWhatsapp(
                    card
                );


                return;

            }

        }


        // ====================================================
        // SE FILTRO ESTÁ DESLIGADO
        // RESTAURA CARD QUE FOI OCULTADO
        // ====================================================

        if (
            !filtroWhatsappAtivo()
        ) {

            const container =
                card.closest('.card-ad') ||
                card;


            if (
                container.dataset
                    .autoWhatsappOculto === '1'
            ) {

                const displayOriginal =
                    container.dataset
                        .autoWhatsappDisplayOriginal;


                container.style.display =
                    displayOriginal || '';


                delete container.dataset
                    .autoWhatsappOculto;


                delete container.dataset
                    .autoWhatsappDisplayOriginal;

            }

        }


        // ====================================================
        // PROCESSAMENTO NORMAL
        // ====================================================

        if (
            processed.has(card)
        ) {

            return;

        }


        if (
            card.querySelector(
                '.meu-ad-bar'
            )
        ) {

            processed.add(card);

            return;

        }


        const landing =
            extrairLanding(
                card
            );


        const pagina =
            extrairPagina(
                card
            );


        const temPageId =

            pagina &&

            pagina.pageId &&

            /^\d+$/.test(
                pagina.pageId
            );


        if (

            !landing &&

            !temPageId

        ) {

            return;

        }


        const bar =
            document.createElement(
                'div'
            );


        bar.className =
            'meu-ad-bar';


        // ====================================================
        // SITE
        // ====================================================

        if (landing) {

            bar.appendChild(

                criarBotao(
                    '🌐 Site',
                    () => {

                        window.open(
                            landing,
                            '_blank'
                        );

                    }
                )

            );

        }


        // ====================================================
        // ADS
        // ====================================================

        if (temPageId) {

            bar.appendChild(

                criarBotao(
                    '📘 Ads',
                    () => {

                        abrirAdsLibrary(
                            pagina.pageId
                        );

                    }
                )

            );

        }


        // ====================================================
        // IMAGEM
        // ====================================================

        if (
            card.querySelector(
                'img'
            )
        ) {

            bar.appendChild(

                criarBotao(
                    '🖼️ Imagem',
                    () => {

                        abrirImagem(
                            card
                        );

                    }
                )

            );

        }


        // ====================================================
        // VÍDEO
        // ====================================================

        if (
            card.querySelector(
                'video'
            )
        ) {

            bar.appendChild(

                criarBotao(
                    '🎥 Vídeo',
                    () => {

                        abrirVideo(
                            card
                        );

                    }
                )

            );

        }


        // ====================================================
        // BOTÃO FECHAR
        // ====================================================

        const btnFechar =
            criarBotao(
                '❌ Fechar',
                () => {

                    if (
                        btnFechar.dataset
                            .confirmando === '1'
                    ) {

                        removerAnuncio(
                            card
                        );


                        return;

                    }


                    btnFechar.dataset
                        .confirmando =
                        '1';


                    btnFechar.textContent =
                        '⚠️ Confirmar';


                    setTimeout(() => {

                        if (

                            btnFechar.isConnected &&

                            btnFechar.dataset
                                .confirmando === '1'

                        ) {

                            btnFechar.dataset
                                .confirmando =
                                '0';


                            btnFechar.textContent =
                                '❌ Fechar';

                        }

                    }, 3000);

                }
            );


        bar.appendChild(
            btnFechar
        );


        // ====================================================
        // INSERIR BARRA
        // ====================================================

        const patrocinadoContainer =
            card.querySelector(
                'div._8nrv'
            );


        if (
            patrocinadoContainer
        ) {

            patrocinadoContainer
                .insertAdjacentElement(
                    'afterend',
                    bar
                );

        } else {

            const fallback =

                card.querySelector(
                    '.ad-ui-container'
                ) ||

                card;


            fallback.prepend(
                bar
            );

        }


        processed.add(
            card
        );

    }


    // ========================================================
    // ABRIR ADS LIBRARY
    // ========================================================

    function abrirAdsLibrary(pageId) {

        if (!pageId) {

            alert(
                'Page ID não encontrado'
            );

            return;

        }


        const url =
            `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=${pageId}`;


        window.open(
            url,
            '_blank'
        );

    }


    // ========================================================
    // ABRIR IMAGEM
    // ========================================================

    function abrirImagem(card) {

        const imagens =
            [...card.querySelectorAll(
                'img'
            )];


        const img =
            imagens
                .filter(i => {

                    const src =
                        i.src || '';


                    return (

                        src.includes(
                            'scontent'
                        ) ||

                        src.includes(
                            'fbcdn'
                        )

                    );

                })
                .sort((a, b) =>
                    (
                        b.naturalWidth *
                        b.naturalHeight
                    ) -
                    (
                        a.naturalWidth *
                        a.naturalHeight
                    )
                )[0];


        if (!img) {

            alert(
                'Imagem não encontrada'
            );

            return;

        }


        window.open(
            img.src,
            '_blank'
        );

    }


    // ========================================================
    // ABRIR VÍDEO
    // ========================================================

    function abrirVideo(card) {

        const video =
            card.querySelector(
                'video'
            );


        if (!video) {

            alert(
                'Vídeo não encontrado'
            );

            return;

        }


        const src =
            video.currentSrc ||
            video.src ||
            video.querySelector(
                'source'
            )?.src;


        if (!src) {

            alert(
                'URL do vídeo não encontrada'
            );

            return;

        }


        window.open(
            src,
            '_blank'
        );

    }


    // ========================================================
    // ENCONTRAR CARDS
    // ========================================================

    function findCards() {

        const cards =
            [
                ...document.querySelectorAll(
                    '.card-ad'
                ),

                ...document.querySelectorAll(
                    '[class*="xh8yej3"]'
                )
            ];


        return [
            ...new Set(
                cards
            )
        ];

    }


    // ========================================================
    // SCAN
    // ========================================================

    function scan() {

        const cards =
            findCards();


        // Só precisamos montar o mapa uma vez por scan.
        const idsWhatsapp =
            filtroWhatsappAtivo()
                ? obterIdsWhatsapp()
                : new Set();


        for (
            const card of cards
        ) {

            // ================================================
            // FILTRO WHATSAPP
            // ================================================

            if (
                filtroWhatsappAtivo()
            ) {

                const adId =
                    extrairAdId(
                        card
                    );


                if (
                    adId &&
                    idsWhatsapp.has(
                        adId
                    )
                ) {

                    ocultarCardWhatsapp(
                        card
                    );


                    continue;

                }

            }


            processarCard(
                card
            );

        }

    }


    // ========================================================
    // START
    // ========================================================

    function start() {

        injectCSS();

        criarPainelFiltro();


        // ====================================================
        // IMPORTANTE:
        // NÃO ATIVA O FILTRO AUTOMATICAMENTE.
        //
        // Se nunca foi configurado, começa desligado.
        // ====================================================

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


        scan();


        setTimeout(
            scan,
            1000
        );


        setTimeout(
            scan,
            2500
        );


        setTimeout(
            scan,
            5000
        );


        const observer =
            new MutationObserver(
                () => {

                    clearTimeout(
                        scanTimeout
                    );


                    scanTimeout =
                        setTimeout(
                            () => {

                                scan();

                            },
                            300
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


        // ====================================================
        // LIMPEZA PARA PRÓXIMA EXECUÇÃO DO USERSCRIPT
        // ====================================================

        window.__AUTO_WHATSAPP_FILTER_CLEANUP =
            () => {

                try {
                    observer.disconnect();
                } catch {}

                clearTimeout(
                    scanTimeout
                );

            };

    }


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
