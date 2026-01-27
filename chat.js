const API_URL = "https://hf-api.eligiolayna01.workers.dev/";

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
            body: JSON.stringify({ pregunta: texto }) // Enviamos "pregunta"
        });

        const data = await r.json();

        // data.answer es lo que el Worker devuelve arriba
        document.getElementById(id).innerText = data.answer || "Sin respuesta";

        setEstado("Listo");

    } catch (e) {
        console.error(e);
        document.getElementById(id).innerText = "Error de conexión";
        setEstado("Error", true);
    }
}

// Nota: Mantén tus funciones agregarMensaje y setEstado tal como las tenías.