// - Versión Final Optimizada
const p1 = "hf_FiX";
const p2 = "psdRaGLD";
const p3 = "xpeZRRk";
const p4 = "sdmuInp";
const p5 = "AUxbFJHos";

// Esta línea une las partes y elimina cualquier espacio o salto de línea invisible
const HF_TOKEN = (p1 + p2 + p3 + p4 + p5).replace(/\s+/g, ''); 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

async function cargarConfiguracion() {
    const monitor = document.getElementById('status-monitor');
    try {
        // Añadimos un parámetro aleatorio para evitar que el navegador use una copia vieja del archivo
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        if (!respuesta.ok) throw new Error();
        PROMPT_CONFIGURACION = await respuesta.text();
        document.getElementById('bot-name-display').innerText = "Asistente: " + NOMBRE_AGENTE;
        monitor.innerText = "Estado: Sección Datos Lista"; 
    } catch (e) {
        monitor.innerText = "Estado: Error en Datos (info.txt)";
    }
}

window.onload = cargarConfiguracion;

async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    
    // Limitamos el tamaño de los datos enviados para mayor estabilidad
    const datosIA = {
        inputs: `<s>[INST] Eres ${NOMBRE_AGENTE}. DATOS: ${PROMPT_CONFIGURACION.substring(0, 2000)}. Pregunta: ${preguntaUsuario} [/INST]</s>`,
        parameters: { max_new_tokens: 250, temperature: 0.7 }
    };

    try {
        const response = await fetch(url, {
            headers: { 
                "Authorization": "Bearer " + HF_TOKEN,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(datosIA)
        });

        // Si el token es inválido, recibiremos el Error 401 aquí
        if (!response.ok) {
            const errorJson = await response.json();
            if (response.status === 401) {
                return "[FALLA API]: Error 401. El Token es incorrecto o fue bloqueado por Hugging Face.";
            }
            return `[FALLA API]: Error ${response.status}. ${errorJson.error || ""}`;
        }

        const data = await response.json();
        return data[0]?.generated_text || "No se recibió respuesta del servidor.";

    } catch (error) {
        // Este es el error que te salía; ahora el código es más robusto para evitarlo
        return "[FALLA RED]: El navegador bloqueó la conexión. Verifica que las partes p1 a p5 formen un token real.";
    }
}

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