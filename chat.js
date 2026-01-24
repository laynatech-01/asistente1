// - Versión Final de Limpieza
const p1 = "hf_Iqf";
const p2 = "rATHTYvg";
const p3 = "UBUlJCPTTPtp";
const p4 = "lmnBIa";
const p5 = "MIHUI";

// Unimos y limpiamos cualquier espacio accidental
const HF_TOKEN = (p1 + p2 + p3 + p4 + p5).trim(); 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";

async function cargarConfiguracion() {
    const monitor = document.getElementById('status-monitor');
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        if (!respuesta.ok) throw new Error();
        PROMPT_CONFIGURACION = await respuesta.text();
        document.getElementById('bot-name-display').innerText = "Asistente: Miguel N.";
        monitor.innerText = "Estado: Sección Datos Lista"; 
    } catch (e) {
        monitor.innerText = "Estado: Error en Datos";
    }
}

window.onload = cargarConfiguracion;

async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    
    const payload = {
        inputs: `<s>[INST] Eres Miguel N. DATOS: ${PROMPT_CONFIGURACION.substring(0, 2500)}. Pregunta: ${preguntaUsuario} [/INST]</s>`,
        parameters: { max_new_tokens: 250, temperature: 0.7 }
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

        // Si el token es incorrecto, aquí recibiremos el código 401
        if (!response.ok) {
            const errorData = await response.json();
            return `[FALLA TOKEN]: Error ${response.status}. Verifica cada letra de p1 a p5.`;
        }

        const data = await response.json();
        return data[0]?.generated_text || "El modelo no regresó respuesta.";

    } catch (error) {
        return "[FALLA CONEXIÓN]: El navegador bloqueó la salida. Revisa el orden de p1 a p5.";
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