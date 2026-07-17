// ============================================================ //
// CONFIGURACIÓN E INICIALIZACIÓN DEL MÓDULO DE RESEÑAS //
// ============================================================ //
console.log("[Reseñas] Inicializando contenedor interactivo de opiniones...");

// Mapeo de elementos de la interfaz basados en tu HTML
const reviewsGrid = document.querySelector(".reviews-grid");
const reviewForm = document.querySelector(".auth-form");

// Reutilización segura de la alerta Toast del proyecto
function safeToast(message, type = "success") {
    if (typeof launchToast === "function") {
        launchToast(message, type);
    } else {
        alert(message);
    }
}

// Mapas de conversión para transformar la opción del select en caracteres de estrellas
const starMap = {
    "5": "★★★★★",
    "4": "★★★★☆",
    "3": "★★★☆☆"
};

// ============================================================ //
// 1. CONTROLADORES DEL FLUJO DE INSERCIÓN (CREATE & READ) //
// ============================================================ //
if (reviewForm && reviewsGrid) {
    // Captura segura de los controles internos del formulario
    const nameInput = reviewForm.querySelector('input[type="text"]');
    const textInput = reviewForm.querySelector('textarea');
    const ratingSelect = reviewForm.querySelector('select');

    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("[Formulario Reseñas] Capturando datos para inserción de fila...");

        const authorName = nameInput ? nameInput.value.trim() : "";
        const reviewText = textInput ? textInput.value.trim() : "";
        const selectValue = ratingSelect ? ratingSelect.value : "5";

        // Extraer el primer carácter numérico del select (ej: "5 Estrellas" -> "5")
        const ratingNumeric = selectValue.charAt(0); 
        const visualStars = starMap[ratingNumeric] || "★★★★★";

        // --- VALIDACIONES ESTRICTAS ---
        if (authorName === "") {
            safeToast("Por favor, introduce tu nombre.", "error");
            console.log("[Formulario Reseñas] Error: Validación rechazada por nombre vacío.");
            return;
        }

        if (reviewText === "") {
            safeToast("Por favor, cuéntanos tu experiencia en el comentario.", "error");
            console.log("[Formulario Reseñas] Error: Validación rechazada por texto vacío.");
            return;
        }

        console.log("[Formulario Reseñas] Validaciones aprobadas con éxito.");

        // --- CONSTRUCCIÓN DINÁMICA DEL NUEVO COMPONENTE (CREATE) ---
        // Creamos la tarjeta respetando exactamente la estructura de clases del CSS
        const newReviewCard = document.createElement("div");
        newReviewCard.className = "login-card review-item";
        
        // Efecto de entrada suave para el nuevo elemento inyectado
        newReviewCard.style.opacity = "0";
        newReviewCard.style.transform = "scale(0.9) translateY(20px)";
        newReviewCard.style.transition = "all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)";

        newReviewCard.innerHTML = `
            <div class="stars">${visualStars}</div>
            <p class="review-text">"${reviewText}"</p>
            <div class="review-author">
                <strong>- ${authorName}</strong>
            </div>
        `;

        // Insertar al inicio de la grilla (prepend) para que se vea inmediatamente
        reviewsGrid.insertBefore(newReviewCard, reviewsGrid.firstChild);
        console.log("[Estructura DOM] Inyectando nueva tarjeta de opinión en el contenedor principal.");

        // Forzar reflow para activar la animación de entrada suave de CSS/JS
        setTimeout(() => {
            newReviewCard.style.opacity = "1";
            newReviewCard.style.transform = "scale(1) translateY(0)";
        }, 50);

        // --- ÉXITO Y REINICIO ---
        safeToast("¡Tu reseña ha sido publicada con éxito!");
        console.log("[Persistencia Simulada] Éxito: Reseña guardada temporalmente. Autor: " + authorName + " (" + ratingNumeric + " estrellas).");

        // Limpiar el formulario para nuevos ingresos
        reviewForm.reset();
        console.log("[Formulario Reseñas] Restableciendo inputs a valores base.");
    });
} else {
    console.log("[Error Crítico] No se localizó el contenedor .reviews-grid o el formulario .auth-form.");
}