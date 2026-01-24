//
const P1 = "hf_EFCHwWajpAcVIvd"; 
const P2 = "KUoFxqmWsextSlYYQTB";
const HF_TOKEN = P1 + P2; 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

// 1. Cargar base de datos
async function cargarConfiguracion() {
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        PROMPT_CONFIGURACION = await respuesta.text();
        const lineas = PROMPT_CONFIGURACION.split('\n');
        lineas.forEach(linea => {
            if (linea.toLowerCase().includes("asesor inmobiliario:")) {
                NOMBRE_AGENTE = linea.split(':')[1].trim();
            }
        });
        document.getElementById('bot-name-display').innerText = `Asistente versión-01: ${NOMBRE_AGENTE}`;
    } catch (e) {
        console.error("Error cargando info.txt");
    }
}

window.onload = cargarConfiguracion;

// 2. Conexión con Hugging Face
async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    const promptMaster = `<s>[INST] Eres ${NOMBRE_AGENTE}, asesor de LaynaTech. USA ESTOS DATOS: ${PROMPT_CONFIGURACION.substring(0, 3000)}. Pregunta: ${preguntaUsuario} [/INST]</s>`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: promptMaster, parameters: { max_new_tokens: 300 } }),
        });

        const data = await response.json();
        if (data.error && data.error.includes("loading")) {
            return "El servidor de planos está despertando. Por favor, repite tu pregunta en 20 segundos.";
        }
        return data[0]?.generated_text || "No pude encontrar esa información.";
    } catch (error) {
        return "Error de conexión. Revisa que tu clave de Hugging Face esté activa.";
    }
}

// 3. Interfaz del Chat
async function enviarMensaje() {
    const input = document.getElementById('user-input');
    const mensaje = input.value.trim();
    if (!mensaje) return;
    agregarMensaje(mensaje, 'user-msg');
    input.value = "";
    const idCarga = "loading-" + Date.now();
    agregarMensaje("Consultando...", 'bot-msg', idCarga);
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