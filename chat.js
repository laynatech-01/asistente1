// - Versión Optimizada para Internet
const P1 = "hf_EFCHwWaj";
const P2 = "pAcVIvdKUoFxqmW";
const P3 = "sextSlYYQTB";
const HF_TOKEN = P1 + P2 + P3; //

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

// 1. Cargar base de datos
async function cargarConfiguracion() {
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        if (!respuesta.ok) throw new Error("Error al leer info.txt");
        PROMPT_CONFIGURACION = await respuesta.text();

        // Extraer nombre del asesor
        const lineas = PROMPT_CONFIGURACION.split('\n');
        lineas.forEach(linea => {
            if (linea.toLowerCase().includes("asesor inmobiliario:")) {
                NOMBRE_AGENTE = linea.split(':')[1].trim();
            }
        });
        document.getElementById('bot-name-display').innerText = `Asistente: ${NOMBRE_AGENTE}`;
        document.getElementById('status-monitor').innerText = "Estado: Conectado a Etapa 4";
    } catch (e) {
        document.getElementById('status-monitor').innerText = "Estado: Error de Sincronización";
    }
}

window.onload = cargarConfiguracion;

// 2. Conexión con Hugging Face
async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    const promptMaster = `<s>[INST] Eres ${NOMBRE_AGENTE}, asesor de LaynaTech. 
    DATOS ACTUALES: ${PROMPT_CONFIGURACION.substring(0, 3500)}
    REGLA: Responde corto y profesional sobre disponibilidad y precios. 
    Pregunta: ${preguntaUsuario} [/INST]</s>`;

    try {
        const response = await fetch(url, {
            headers: { 
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({
                inputs: promptMaster,
                parameters: { max_new_tokens: 250, temperature: 0.5 }
            }),
        });

        const data = await response.json();

        if (data.error && data.error.includes("loading")) {
            return "El sistema de inventario está cargando. Por favor, repite tu pregunta en 20 segundos.";
        }

        return data[0]?.generated_text || "Lo siento, ¿podrías ser más específico con el número de lote?";
    } catch (error) {
        return "Error de conexión. Por favor, intenta de nuevo en un momento.";
    }
}

// 3. Funciones de Interfaz
async function enviarMensaje() {
    const input = document.getElementById('user-input');
    const mensaje = input.value.trim();
    if (!mensaje) return;

    agregarMensaje(mensaje, 'user-msg');
    input.value = "";

    const idCarga = "loading-" + Date.now();
    agregarMensaje("Consultando disponibilidad...", 'bot-msg', idCarga);

    const respuestaIA = await consultarIA(mensaje);
    document.getElementById(idCarga).innerText = respuestaIA;
}

function agregarMensaje(texto, clase, id = null) {
    const chatBox = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `msg ${clase}`;
    div.innerText = texto;
    if (id) div.id = id;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleKeyPress(event) { if (event.key === 'Enter') enviarMensaje(); }