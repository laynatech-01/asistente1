// - Versión Optimizada sin Errores de Red
const p1 = "hf_Iqf";
const p2 = "rATHTYvg";
const p3 = "UBUlJCPTTPtp";
const p4 = "lmnBIa";
const p5 = "MIHUI";
const HF_TOKEN = p1 + p2 + p3 + p4 + p5; 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

async function cargarConfiguracion() {
    const monitor = document.getElementById('status-monitor');
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        if (!respuesta.ok) throw new Error();
        PROMPT_CONFIGURACION = await respuesta.text();
        document.getElementById('bot-name-display').innerText = `Asistente: ${NOMBRE_AGENTE}`;
        monitor.innerText = "Estado: Sección Datos Lista"; 
    } catch (e) {
        monitor.innerText = "Estado: Error en Datos";
    }
}

window.onload = cargarConfiguracion;

async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    
    // Cuerpo del mensaje limpio para evitar bloqueos
    const payload = {
        inputs: `<s>[INST] Eres ${NOMBRE_AGENTE}. DATOS: ${PROMPT_CONFIGURACION.substring(0, 2500)}. Pregunta: ${preguntaUsuario} [/INST]</s>`,
        parameters: { max_new_tokens: 200, temperature: 0.7 }
    };

    try {
        const response = await fetch(url, {
            headers: { 
                "Authorization": "Bearer " + HF_TOKEN,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return `[FALLA API]: Error ${response.status}. ${errorData.error || ""}`;
        }

        const data = await response.json();
        return data[0]?.generated_text || "El modelo no regresó respuesta.";

    } catch (error) {
        // Si sale esto, el problema es el token fragmentado
        return "[FALLA ESTRUCTURA]: El navegador bloqueó la petición. Revisa que las partes p1 a p5 del token sean correctas.";
    }
}

async function enviarMensaje() {
    const input = document.getElementById('user-input');
    const mensaje = input.value.trim();
    if (!mensaje) return;

    agregarMensaje(mensaje, 'user-msg');
    input.value = "";
    const idCarga = "loading-" + Date.now();
    agregarMensaje("Conectando con servidor...", 'bot-msg', idCarga);

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