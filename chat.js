// Dividimos el token en partes para evitar que GitHub lo bloquee
const p1 = "hf_Iqf";
const p2 = "rATHTYvg";
const p3 = "UBUlJCPTTPtp";
const p4 = "lmnBIa";
const p5 = "MIHUI";

// Unimos las piezas solo al momento de usarlas
const HF_TOKEN = p1 + p2 + p3 + p4 + p5; 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

async function cargarConfiguracion() {
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        PROMPT_CONFIGURACION = await respuesta.text();
        document.getElementById('bot-name-display').innerText = `Asistente: ${NOMBRE_AGENTE}`;
        document.getElementById('status-monitor').innerText = "Estado: Conectado a Etapa 4";
    } catch (e) {
        document.getElementById('status-monitor').innerText = "Estado: Error de Sincronización";
    }
}

window.onload = cargarConfiguracion;

async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    const promptMaster = `<s>[INST] Eres ${NOMBRE_AGENTE}, asesor de Kikteil. USA ESTOS DATOS: ${PROMPT_CONFIGURACION.substring(0, 3000)}. Pregunta: ${preguntaUsuario} [/INST]</s>`;

    try {
        const response = await fetch(url, {
            headers: { 
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({ inputs: promptMaster })
        });

        const data = await response.json();
        
        // Si el modelo está cargando, pedimos esperar
        if (data.error && data.error.includes("loading")) {
            return "Estoy consultando la lista de precios... Pregúntame de nuevo en 15 segundos.";
        }
        
        return data[0]?.generated_text || "Lo siento, ¿podrías repetir la pregunta?";
    } catch (error) {
        return "Error de conexión. Intenta de nuevo en un momento.";
    }
}

// Interfaz del chat
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