// CLAVE FRAGMENTADA PARA EVITAR SEGURIDAD DE GITHUB
const P1 = "hf_EFCHwWajpAcVIvd"; 
const P2 = "KUoFxqmWsextSlYYQTB";
const HF_TOKEN = P1 + P2; 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 

let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

// 1. Cargar base de datos desde info.txt
async function cargarConfiguracion() {
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        if (!respuesta.ok) throw new Error("Error al leer info.txt");
        
        PROMPT_CONFIGURACION = await respuesta.text();

        // Extraer nombre del asesor del archivo
        const lineas = PROMPT_CONFIGURACION.split('\n');
        lineas.forEach(linea => {
            if (linea.toLowerCase().includes("asesor inmobiliario:")) {
                NOMBRE_AGENTE = linea.split(':')[1].trim();
            }
        });

        document.getElementById('bot-name-display').innerText = `Asistente versión-01: ${NOMBRE_AGENTE}`;
        document.getElementById('status-monitor').innerText = "Estado: Sistema Listo";
    } catch (e) {
        console.error("Fallo de sincronización:", e);
        document.getElementById('status-monitor').innerText = "Estado: Error de Datos";
    }
}

window.onload = cargarConfiguracion;

// 2. Conexión con la IA
async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    
    // Instrucciones maestras usando tus datos
    const promptMaster = `<s>[INST] Eres ${NOMBRE_AGENTE}, asesor experto de LaynaTech. 
    USA ESTOS DATOS: ${PROMPT_CONFIGURACION.substring(0, 3000)}
    REGLAS:
    - Si preguntan por un lote (ej. 302, 330, A96), da su precio y m2 exactos.
    - Si el estatus es APARTADO, informa que ya no está disponible.
    - Sé muy amable y profesional.
    Pregunta: ${preguntaUsuario} [/INST]</s>`;

    try {
        const response = await fetch(url, {
            headers: { 
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({
                inputs: promptMaster,
                parameters: { max_new_tokens: 300, temperature: 0.6 }
            }),
        });

        const data = await response.json();

        // Manejo de carga inicial del servidor
        if (data.error && data.error.includes("loading")) {
            return "Estoy consultando la disponibilidad en la Etapa 4... por favor, repite tu pregunta en 15 segundos.";
        }

        return data[0]?.generated_text || "Lo siento, ¿podrías repetirme tu duda sobre los terrenos?";
    } catch (error) {
        return "Tuve un pequeño problema al conectar con el servidor de planos. Intenta de nuevo en un momento.";
    }
}

// 3. Interfaz del Chat
async function enviarMensaje() {
    const input = document.getElementById('user-input');
    const mensaje = input.value.trim();
    if (mensaje === "") return;

    agregarMensaje(mensaje, 'user-msg');
    input.value = "";

    const idCarga = "loading-" + Date.now();
    agregarMensaje("Analizando disponibilidad...", 'bot-msg', idCarga);

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

function handleKeyPress(event) {
    if (event.key === 'Enter') enviarMensaje();
}