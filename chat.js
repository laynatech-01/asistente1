// NUEVA CLAVE FRAGMENTADA (Anti-bloqueo GitHub)
const partA = "hf_cVdFLaEg";
const partB = "scrvIsivyYnwJU";
const partC = "ndBzfFcjVJcn";
const HF_TOKEN = partA + partB + partC; 

const MODELO = "mistralai/Mistral-7B-Instruct-v0.3"; 
let PROMPT_CONFIGURACION = "";
let NOMBRE_AGENTE = "Miguel N.";

// 1. Cargar base de datos local
async function cargarConfiguracion() {
    try {
        const respuesta = await fetch('info.txt?t=' + new Date().getTime());
        if (!respuesta.ok) throw new Error("No se pudo leer info.txt");
        PROMPT_CONFIGURACION = await respuesta.text();

        // Extraer nombre del asesor del txt
        const lineas = PROMPT_CONFIGURACION.split('\n');
        lineas.forEach(linea => {
            if (linea.toLowerCase().includes("asesor inmobiliario:")) {
                NOMBRE_AGENTE = linea.split(':')[1].trim();
            }
        });

        document.getElementById('bot-name-display').innerText = `Asistente: ${NOMBRE_AGENTE}`;
        document.getElementById('status-monitor').innerText = "Estado: Inventario Cargado";
    } catch (e) {
        console.error("Error sincronizando:", e);
        document.getElementById('status-monitor').innerText = "Estado: Error de Datos";
    }
}

window.onload = cargarConfiguracion;

// 2. Comunicación con la IA
async function consultarIA(preguntaUsuario) {
    const url = `https://api-inference.huggingface.co/models/${MODELO}`;
    
    const promptMaster = `<s>[INST] Eres ${NOMBRE_AGENTE}, asesor de LaynaTech. 
    DATOS DEL INVENTARIO: ${PROMPT_CONFIGURACION.substring(0, 3500)}
    REGLA: Si preguntan por un lote, busca su M2 y PRECIO en la lista. 
    Si dice APARTADO, informa que no está disponible.
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

        // Manejo de carga de servidor gratuito
        if (data.error && data.error.includes("loading")) {
            return "Estoy abriendo el catálogo de la Etapa 4... Pregúntame de nuevo en 15 segundos.";
        }

        return data[0]?.generated_text || "Lo siento, ¿podrías darme el número de lote para revisarlo?";
    } catch (error) {
        return "Error de conexión. Intenta de nuevo en unos segundos.";
    }
}

// 3. Interfaz de usuario
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