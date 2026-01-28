console.log("chat.js cargado");

const API_URL = "https://hf-api.eligiolayna01.workers.dev";
let PROMPT_BASE = "";

document.addEventListener("DOMContentLoaded", async () => {
    const input = document.getElementById("user-input");
    const button = document.getElementById("send-btn");

    button.addEventListener("click", enviarMensaje);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") enviarMensaje();
    });

    await cargarPrompt();
    setEstado("Sistema listo");
});

async function cargarPrompt() {
    try {
        const r = await fetch("info.txt");
        PROMPT_BASE = await r.text();
        console.log("Prompt cargado");
    } catch {
        PROMPT_BASE = "";
        console.warn("No se pudo cargar info.txt");
    }
}

function setEstado(texto, error = false) {
    const e = document.getElementById("status-monitor");
    e.innerText = "Estado: " + texto;
    e.style.color = error ? "red" : "lime";
}

async function enviarMensaje() {
    const input = document.getElementById("user-input");
    const texto = input.value.trim();
    if (!texto) return;

    agregarMensaje(texto, "user-msg");
    input.value = "";

    const id = "bot_" + Date.now();
    agregarMensaje("...", "bot-msg", id);

    setEstado("Conectando...");

    try {
        const r = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pregunta: texto,
                prompt: PROMPT_BASE
            })
        });

        const data = await r.json();

        document.getElementById(id).innerText =
            data.answer || "Sin respuesta";

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
    div.innerText = texto;
    if (id) div.id = id;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
