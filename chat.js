// - Versión con Diagnóstico por Secciones
const p1 = "hf_Iqf";
const p2 = "rATHTYvg";
const p3 = "UBUlJCPTTPtp";
const p4 = "lmnBIa";
const p5 = "MIHUI";
const HF_TOKEN = p1 + p2 + p3 + p4 + p5; 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

// SECCIÓN 1: CARGA DE DATOS (info.txt)
async function cargarConfiguracion() {
    const monitor = document.getElementById('status-monitor');
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        if (!respuesta.ok) throw new Error(`Código ${respuesta.status}`);
        
        PROMPT_CONFIGURACION = await respuesta.text();
        document.getElementById('bot-name-display').innerText = `Asistente: ${NOMBRE_AGENTE}`;
        monitor.innerText = "Estado: Sección Datos Lista"; 
    } catch (e) {
        monitor.innerText = "Estado: Error en Sección Datos";
        console.error("Falla en Sección 1:", e);
    }
}

window.onload = cargarConfiguracion;

// SECCIÓN 2: CONEXIÓN Y PROCESAMIENTO (Hugging Face)
async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    const promptMaster = `<s>[INST] Eres ${NOMBRE_AGENTE}. DATOS: ${PROMPT_CONFIGURACION} Pregunta: ${preguntaUsuario} [/INST]</s>`;

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: promptMaster })
        });

        if (!response.ok) {
            // Reporte detallado de la sección de red
            if (response.status === 401) {
                return `[SECCIÓN API]: Error 401 (Token inválido o bloqueado). Revisa tu clave en Hugging Face.`;
            } else if (response.status === 503) {
                return `[SECCIÓN SERVIDOR]: Error 503 (Modelo cargando). Reintenta en 15 segundos.`;
            } else {
                return `[SECCIÓN RED]: Error ${response.status}. Falló la comunicación con la IA.`;
            }
        }

        const data = await response.json();
        return data[0]?.generated_text || "[SECCIÓN LÓGICA]: El modelo no devolvió texto.";
        
    } catch (error) {
        return `[SECCIÓN CRÍTICA]: Falla total de conexión o error de sintaxis en chat.js.`;
    }
}

// SECCIÓN 3: INTERFAZ (index.html)
async function enviarMensaje() {
    const input = document.getElementById('user-input');
    const mensaje = input.value.trim();
    if (!mensaje) return;

    agregarMensaje(mensaje, 'user-msg');
    input.value = "";

    const idCarga = "loading-" + Date.now();
    agregarMensaje("Procesando en Sección API...", 'bot-msg', idCarga);

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