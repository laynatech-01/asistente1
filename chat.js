const API_URL = "https://hf-api.eligiolayna01.workers.dev";
let PROMPT_BASE = "";
let historial = []; // Memoria de la plática actual

document.addEventListener("DOMContentLoaded", async () => {
    const input = document.getElementById("user-input");
    const button = document.getElementById("send-btn");
    button.addEventListener("click", enviarMensaje);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") enviarMensaje(); });
    await cargarPrompt();
});

async function cargarPrompt() {
    try {
        const r = await fetch("info.txt");
        PROMPT_BASE = await r.text();
        setEstado("Sistema listo");
    } catch {
        setEstado("Error info.txt", true);
    }
}

async function enviarMensaje() {
    const input = document.getElementById("user-input");
    const texto = input.value.trim();
    if (!texto) return;

    historial.push({ role: "user", content: texto });
    agregarMensaje(texto, "user-msg");
    input.value = "";

    const id = "bot_" + Date.now();
    agregarMensaje("...", "bot-msg", id);
    setEstado("Pensando...");

    try {
        const r = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                pregunta: texto, 
                prompt: PROMPT_BASE,
                historial: historial 
            })
        });
        const data = await r.json();
        
        historial.push({ role: "assistant", content: data.answer });
        // Usar marked para convertir asteriscos en HTML
        document.getElementById(id).innerHTML = marked.parse(data.answer);
        setEstado("Listo");
    } catch (e) {
        document.getElementById(id).innerText = "Error de conexión";
        setEstado("Error", true);
    }
}

function agregarMensaje(texto, clase, id = null) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = "msg " + clase;
    if (id) div.id = id;
    div.innerHTML = texto; 
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function setEstado(t, err) {
    const e = document.getElementById("status-monitor");
    e.innerText = "Estado: " + t;
    e.style.color = err ? "red" : "lime";
}