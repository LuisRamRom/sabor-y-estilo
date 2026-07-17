// ============================================================ //
// FUNCIONES DE SEGURIDAD PARA LOGIN
// ============================================================ //

function requireLogin() {
    const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
    if (!userData?.nombre) {
        if (typeof launchToast === 'function') {
            launchToast('⚠️ Por favor, inicia sesión para continuar', 'error');
        } else {
            alert('Por favor, inicia sesión para continuar');
        }
        setTimeout(() => {
            window.location.href = '/src/modulo_auth/registrarse.html';
        }, 1500);
        return false;
    }
    return true;
}

function guardarPedidoEnHistorial(items, total, descuento, direccion, tipoEntrega) {
    const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
    if (!userData) return;
    
    let pedidos = [];
    try {
        const stored = localStorage.getItem('sabor_estilo_pedidos');
        if (stored) {
            pedidos = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('[Pedidos] Error al leer:', e);
        pedidos = [];
    }
    
    const nuevoPedido = {
        email: userData.email,
        nombre: userData.nombre,
        items: items.map(item => ({
            name: item.name,
            price: item.price,
            qty: item.qty
        })),
        total: total,
        descuento: descuento,
        direccion: direccion || 'Recojo en Tienda',
        tipoEntrega: tipoEntrega || 'recojo',
        estado: 'completado',
        fecha: new Date().toISOString()
    };
    
    pedidos.push(nuevoPedido);
    localStorage.setItem('sabor_estilo_pedidos', JSON.stringify(pedidos));
    console.log('[Pedidos] ✅ Guardado exitosamente para:', userData.nombre);
    console.log('[Pedidos] Total de pedidos:', pedidos.length);
    return nuevoPedido;
}

// ============================================================ //
// VARIABLES GLOBALES DEL CARRITO
// ============================================================ //

let cartArray = [];
const MAX_PER_ITEM = 10;
let activeDiscount = 0;
let appliedCouponName = "";
const DEFAULT_ITEM_IMG = "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=80&auto=format&fit=crop";

// ============================================================ //
// FUNCIÓN DE TOASTS
// ============================================================ //

function launchToast(message, type = "success") {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = type === "error" ? "custom-toast error-toast" : "custom-toast";
    toast.innerText = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastFadeOut 0.3s ease forwards";
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

console.log("[Sistema] Inicializando Carrito de Compras de Sabor y Estilo...");

// ============================================================ //
// MOSTRAR USUARIO LOGUEADO
// ============================================================ //
function mostrarUsuarioLogueado() {
    const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
    if (userData?.nombre) {
        console.log('[Sistema] Usuario logueado:', userData.nombre);
        const nombreInput = document.getElementById('customer-name');
        if (nombreInput && !nombreInput.value) {
            nombreInput.value = userData.nombre;
        }
        return true;
    }
    return false;
}

// ============================================================ //
// POP-UP DE BIENVENIDA
// ============================================================ //

(function injectWelcomeModal() {
    const welcomeOverlay = document.createElement("div");
    welcomeOverlay.id = "welcome-overlay";
    welcomeOverlay.className = "welcome-overlay";
    welcomeOverlay.innerHTML = `
        <div class="welcome-card" id="welcome-card-content" style="text-align: center;">
            <h2 style="color: #ffb400; margin-bottom: 12px;">🍕 ¡Bienvenidos a Sabor y Estilo!</h2>
            <p style="font-size: 0.95rem; line-height: 1.5; color: #ccc; margin-bottom: 15px;">
                Disfruta de la mejor combinación de ingredientes artesanales y pasión culinaria.
            </p>
            <div style="background: rgba(255,180,0,0.1); padding: 15px; border-radius: 8px; font-size: 0.9rem; border: 1px dashed #ffb400; margin-bottom: 20px; color: #ffb400;">
                <strong>🔥 CUPÓN DE BIENVENIDA:</strong> Usa el código <strong>PIZZA20</strong> para obtener un 20% de descuento.
            </div>
            <button id="btn-close-welcome" style="width: 100%; background: #ffb400; color: #000; border: none; padding: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase;">Ver la Carta</button>
        </div>
    `;
    document.body.appendChild(welcomeOverlay);
    document.getElementById("btn-close-welcome").addEventListener("click", () => welcomeOverlay.remove());
})();

// ============================================================ //
// INYECCIÓN DE BURBUJA DE SOPORTE
// ============================================================ //

(function injectFloatingContactBtn() {
    if (document.querySelector(".floating-support-btn")) return;

    const contactBtn = document.createElement("a");
    contactBtn.href = "/src/modulo_feedback/contactanos.html";
    contactBtn.className = "floating-support-btn";
    contactBtn.setAttribute("title", "Contactar con Soporte");
    
    contactBtn.innerHTML = `
        <span class="support-icon">📞</span>
        <span class="support-text">Soporte</span>
    `;
    document.body.appendChild(contactBtn);
})();

// ============================================================ //
// MAPEO DE ELEMENTOS DE INTERFAZ
// ============================================================ //

const menuItems = document.querySelectorAll(".menu-item");
const selectBase = document.getElementById("select-base");
const selectExtra = document.getElementById("select-extra");
const subtotalVal = document.getElementById("subtotal-val");
const formCreacion = document.getElementById("form-creacion");
const orderDetails = document.getElementById("order-details");
const itemCount = document.getElementById("item-count");
const mobileCartBadge = document.getElementById("mobile-cart-badge");
const cartTotalVal = document.getElementById("cart-total-val");
const mobileCartToggle = document.getElementById("mobile-cart-toggle");
const cartAside = document.getElementById("cart-aside");
const mainOrderForm = document.querySelector(".pedido-sidebar form");

let deliverySelect, addressGroup, addressInput, receiptTypeSelect, rucGroup, rucInput, companyInput;

// ============================================================ //
// INYECCIÓN DE LOGÍSTICA, SUNAT Y CAMPOS REQUERIDOS
// ============================================================ //

(function injectBusinessInputs() {
    if (!mainOrderForm) return;

    const backButtonHtml = `
        <button type="button" id="btn-back-to-menu" class="btn-close-cart" style="display: none;">✕</button>
    `;

    const businessHtml = `
        <div class="input-group" style="margin-top: 15px;">
            <label>Tipo de Entrega</label>
            <select id="delivery-type">
                <option value="delivery">📍 Delivery a Domicilio</option>
                <option value="recojo">🏪 Recojo en Tienda</option>
            </select>
        </div>
        <div class="input-group" id="address-group" style="margin-top: 15px;">
            <label>Dirección de Envío</label>
            <input type="text" id="customer-address" placeholder="Ej: Av. Los Sauces 456" required />
        </div>
        <div class="input-group" style="margin-top: 15px;">
            <label>Tipo de Comprobante</label>
            <select id="receipt-type">
                <option value="boleta">📄 Boleta de Venta (DNI)</option>
                <option value="factura">🏢 Factura (RUC)</option>
            </select>
        </div>
        <div id="ruc-group" style="display: none; margin-top: 10px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 6px; border: 1px solid #333;">
            <div class="input-group" style="margin-bottom: 10px;">
                <label style="font-size:0.75rem;">Número de RUC</label>
                <input type="text" id="legal-ruc" placeholder="Ej: 20601234567" pattern="[0-9]{11}" title="El RUC debe tener 11 dígitos numéricos." />
            </div>
            <div class="input-group">
                <label style="font-size:0.75rem;">Razón Social</label>
                <input type="text" id="legal-company" placeholder="Ej: Pizza & Gourmet S.A.C." />
            </div>
        </div>
        <label style="margin-top: 15px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; color: var(--text-gray); display:block;">Productos Añadidos</label>
        <div class="cart-items-container" id="cart-items-rendered-list" style="max-height: 260px; overflow-y: auto;"></div>
        <div class="coupon-container" style="margin-top: 15px; padding: 10px; background: #1a1a1a; border-radius: 6px; border: 1px solid #333;">
            <div style="display: flex; gap: 8px;">
                <input type="text" id="coupon-input" placeholder="CUPÓN" style="flex: 1; padding: 6px 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px; font-size: 0.85rem; text-transform: uppercase;">
                <button type="button" id="btn-apply-coupon" style="background: #ffb400; color: #000; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer;">Aplicar</button>
            </div>
            <div id="coupon-status" style="font-size: 0.75rem; margin-top: 5px; font-weight: 600;"></div>
        </div>
        <div class="price-breakdown" style="margin-top: 15px; padding: 12px; background: #161616; border-radius: 6px; font-size: 0.85rem; border: 1px solid #222;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #aaa;">
                <span>Monto Bruto:</span>
                <span id="breakdown-subtotal">S/ 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #ff3333; display: none;" id="breakdown-discount-row">
                <span>Descuento Aplicado:</span>
                <span id="breakdown-discount">-S/ 0.00</span>
            </div>
        </div>
    `;
    
    if (orderDetails) {
        orderDetails.parentElement.style.display = "none";
        orderDetails.removeAttribute("required");
        mainOrderForm.insertAdjacentHTML("afterbegin", backButtonHtml);
        orderDetails.parentElement.insertAdjacentHTML("beforebegin", businessHtml);
    }

    deliverySelect = document.getElementById("delivery-type");
    addressGroup = document.getElementById("address-group");
    addressInput = document.getElementById("customer-address");
    receiptTypeSelect = document.getElementById("receipt-type");
    rucGroup = document.getElementById("ruc-group");
    rucInput = document.getElementById("legal-ruc");
    companyInput = document.getElementById("legal-company");

    const backBtn = document.getElementById("btn-back-to-menu");
    if(backBtn) {
        if (window.innerWidth <= 992) backBtn.style.display = "flex";
        window.addEventListener("resize", () => {
            backBtn.style.display = window.innerWidth <= 992 ? "flex" : "none";
        });
        backBtn.addEventListener("click", () => {
            cartAside?.classList.remove("mobile-open");
        });
    }

    if (deliverySelect) {
        deliverySelect.addEventListener("change", () => {
            if (deliverySelect.value === "recojo") {
                addressGroup.style.display = "none";
                addressInput.removeAttribute("required");
                addressInput.value = "Recojo en Tienda";
            } else {
                addressGroup.style.display = "block";
                addressInput.setAttribute("required", "true");
                addressInput.value = "";
            }
        });
    }

    if (receiptTypeSelect) {
        receiptTypeSelect.addEventListener("change", () => {
            if (receiptTypeSelect.value === "factura") {
                rucGroup.style.display = "block";
                rucInput.setAttribute("required", "true");
                companyInput.setAttribute("required", "true");
            } else {
                rucGroup.style.display = "none";
                rucInput.removeAttribute("required");
                companyInput.removeAttribute("required");
                rucInput.value = "";
                companyInput.value = "";
            }
        });
    }

    document.getElementById("btn-apply-coupon").addEventListener("click", () => {
        const code = document.getElementById("coupon-input").value.trim().toUpperCase();
        const statusEl = document.getElementById("coupon-status");
        if (code === "PIZZA20") {
            activeDiscount = 0.20;
            appliedCouponName = "PIZZA20";
            statusEl.style.color = "#00a650";
            statusEl.innerText = "✓ Cupón Aplicado (20%)";
            launchToast("¡Cupón aplicado con éxito!");
        } else {
            activeDiscount = 0;
            appliedCouponName = "";
            statusEl.style.color = "#ff3333";
            statusEl.innerText = "✕ Inválido";
            launchToast("Cupón inválido o expirado", "error");
        }
        syncCartView();
    });
})();

// ============================================================ //
// RENDERIZADO DEL CARRITO
// ============================================================ //

function syncCartView() {
    const totalUnidades = cartArray.reduce((sum, item) => sum + item.qty, 0);
    const rawSubtotal = cartArray.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = rawSubtotal * activeDiscount;
    const totalDinero = rawSubtotal - discountAmount;

    if (itemCount) itemCount.innerText = totalUnidades;
    if (mobileCartBadge) mobileCartBadge.innerText = totalUnidades;
    if (cartTotalVal) cartTotalVal.innerText = `S/ ${totalDinero.toFixed(2)}`;

    document.getElementById("breakdown-subtotal").innerText = `S/ ${rawSubtotal.toFixed(2)}`;
    const discountRow = document.getElementById("breakdown-discount-row");
    if (activeDiscount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("breakdown-discount").innerText = `-S/ ${discountAmount.toFixed(2)}`;
    } else {
        discountRow.style.display = "none";
    }

    const renderedList = document.getElementById("cart-items-rendered-list");
    if (renderedList) {
        renderedList.innerHTML = "";
        if (cartArray.length === 0) {
            renderedList.innerHTML = `<div style="text-align:center; padding:15px; color:#777; font-size:0.85rem;">Tu carrito está vacío.</div>`;
        } else {
            cartArray.forEach((item, index) => {
                const row = document.createElement("div");
                row.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:#222; padding:8px; border-radius:6px; border:1px solid #2e2e2e; gap:10px;";
                row.innerHTML = `
                    <img src="${item.img || DEFAULT_ITEM_IMG}" alt="item" style="width:40px; height:40px; border-radius:4px; object-fit:cover; border:1px solid #444;">
                    <div style="flex:1;">
                        <strong style="color:#fff; font-size:0.85rem; display:block;">${item.name}</strong>
                        <span style="font-size:0.75rem; color:#aaa;">${item.qty} x S/ ${item.price.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button type="button" class="minus-btn" data-index="${index}" style="background:#333; color:#fff; border:none; width:22px; height:22px; border-radius:4px; font-weight:bold; cursor:pointer;">-</button>
                        <span style="color:#fff; font-weight:bold; min-width:15px; text-align:center; font-size:0.85rem;">${item.qty}</span>
                        <button type="button" class="plus-btn" data-index="${index}" style="background:#333; color:#fff; border:none; width:22px; height:22px; border-radius:4px; font-weight:bold; cursor:pointer;">+</button>
                    </div>
                `;
                row.querySelector(".minus-btn").addEventListener("click", () => {
                    if (cartArray[index].qty > 1) cartArray[index].qty--;
                    else cartArray.splice(index, 1);
                    syncCartView();
                });
                
                row.querySelector(".plus-btn").addEventListener("click", () => {
                    if (cartArray[index].qty < MAX_PER_ITEM) {
                        cartArray[index].qty++;
                    } else {
                        launchToast(`Máximo permitido: ${MAX_PER_ITEM} unidades por producto`, "error");
                    }
                    syncCartView();
                });
                renderedList.appendChild(row);
            });
        }
    }
}

// ============================================================ //
// AÑADIR DESDE LA CARTA TRADICIONAL
// ============================================================ //
menuItems.forEach((article) => {
    const btnAdd = article.querySelector(".btn-add");
    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            const title = article.querySelector("h3").innerText;
            const priceText = article.querySelector(".price").innerText;
            const imgEl = article.querySelector("img");
            const imgSrc = imgEl ? imgEl.src : DEFAULT_ITEM_IMG;
            const numericalPrice = Number.parseFloat(priceText.replace(/[^0-9.]/g, ""));
            const existingItem = cartArray.find(item => item.name === title);
            
            if (existingItem) {
                if (existingItem.qty < MAX_PER_ITEM) {
                    existingItem.qty++;
                    launchToast(`Agregado: ${title}`);
                } else {
                    launchToast(`Máximo permitido: ${MAX_PER_ITEM} unidades por producto`, "error");
                }
            } else {
                cartArray.push({ name: title, price: numericalPrice, qty: 1, img: imgSrc });
                launchToast(`Agregado: ${title}`);
            }
            syncCartView();
        });
    }
});

// ============================================================ //
// LÓGICA: ARMA TU PEDIDO
// ============================================================ //
function recalculateSubtotal() {
    if (!selectBase || !selectExtra || !subtotalVal) return;
    const base = Number.parseFloat(selectBase.value) || 0;
    const extra = Number.parseFloat(selectExtra.value) || 0;
    subtotalVal.innerText = (base + extra).toFixed(2);
}

/// ============================================================ //
// FUNCIONES EXTRAS PARA REDUCIR COMPLEJIDAD COGNITIVA
// ============================================================ //

// Función para obtener el precio actual
function obtenerPrecioActual(subtotalVal) {
    return Number.parseFloat(subtotalVal.innerText) || 0;
}

// Función para validar la selección de base
function validarSeleccionBase(selectBase, subtotalVal) {
    const currentPrice = obtenerPrecioActual(subtotalVal);
    if (selectBase.value === "0" || currentPrice <= 0) {
        if (typeof launchToast === "function") {
            launchToast("Por favor, selecciona una base válida.", "error");
        } else {
            alert("Por favor, selecciona una base válida.");
        }
        return false;
    }
    return true;
}

// Función para limpiar texto de opción
function limpiarTextoOpcion(texto) {
    return texto.includes("-") ? texto.split("-")[0].trim() : texto.trim();
}

// Función para obtener nombre de la base
function obtenerNombreBase(selectBase) {
    const rawBaseText = selectBase.options[selectBase.selectedIndex].text;
    return limpiarTextoOpcion(rawBaseText);
}

// Función para obtener nombre del extra
function obtenerNombreExtra(selectExtra) {
    if (!selectExtra || selectExtra.selectedIndex <= 0) {
        return "";
    }
    const rawExtraText = selectExtra.options[selectExtra.selectedIndex].text;
    const cleanExtra = limpiarTextoOpcion(rawExtraText);
    return ` + ${cleanExtra}`;
}

// Función para crear título personalizado
function crearTituloPersonalizado(selectBase, selectExtra) {
    const nameBase = obtenerNombreBase(selectBase);
    const nameExtra = obtenerNombreExtra(selectExtra);
    return `🛠️ Personalizado: ${nameBase}${nameExtra}`;
}

// Función para agregar o actualizar item en el carrito (CORREGIDA)
function agregarOActualizarItemPersonalizado(customTitle, currentPrice) {
    const existingCustom = cartArray.find(item => item.name === customTitle);
    
    if (existingCustom) {
        if (existingCustom.qty < MAX_PER_ITEM) {
            existingCustom.qty++;
            if (typeof launchToast === "function") {
                launchToast("¡Pedido personalizado actualizado!");
            }
        } else if (typeof launchToast === "function") {
            launchToast(`Máximo permitido: ${MAX_PER_ITEM} unidades`, "error");
        }
    } else {
        cartArray.push({
            name: customTitle,
            price: currentPrice,
            qty: 1,
            img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=80&auto=format&fit=crop"
        });
        if (typeof launchToast === "function") {
            launchToast("¡Pedido personalizado añadido!");
        }
    }
}

// Función para resetear el formulario personalizado
function resetearFormularioPersonalizado(formCreacion, subtotalVal) {
    formCreacion.reset();
    subtotalVal.innerText = "0.00";
}

// Función para notificar cambios al carrito
function notificarCambioCarrito() {
    if (typeof syncCartView === "function") {
        syncCartView();
    }
}
//Función principal del submit (refactorizada)
function manejarSubmitPersonalizado(e) {
    e.preventDefault();
    
    // Validar login
    if (!requireLogin()) {
        return;
    }
    
    // Validar selección de base
    if (!validarSeleccionBase(selectBase, subtotalVal)) {
        return;
    }
    
    // Obtener datos
    const currentPrice = obtenerPrecioActual(subtotalVal);
    const customTitle = crearTituloPersonalizado(selectBase, selectExtra);
    
    // Agregar o actualizar en carrito
    agregarOActualizarItemPersonalizado(customTitle, currentPrice);
    
    // Resetear y actualizar
    resetearFormularioPersonalizado(formCreacion, subtotalVal);
    notificarCambioCarrito();
}

// ============================================================ //
// INICIALIZACIÓN DE EVENTOS
// ============================================================ //

// Eventos de cambio en selects
if (selectBase) selectBase.addEventListener("change", recalculateSubtotal);
if (selectExtra) selectExtra.addEventListener("change", recalculateSubtotal);

// Evento de submit del formulario personalizado
if (formCreacion) {
    formCreacion.addEventListener("submit", manejarSubmitPersonalizado);
}

// ============================================================ //
// PROCESAR "PROPÓN UN NUEVO PLATO"
// ============================================================ //

const formSugerencia = document.getElementById("form-sugerencia");
const btnSendSuggest = document.getElementById("btn-send-suggest");

if (btnSendSuggest && formSugerencia) {
    btnSendSuggest.addEventListener("click", () => {
        const suggestNameInput = document.getElementById("suggest-name");
        const sugerenciaNombre = suggestNameInput ? suggestNameInput.value.trim() : "";

        if (sugerenciaNombre === "") {
            if (typeof launchToast === "function") {
                launchToast("Por favor, escribe el nombre del plato soñado.", "error");
            } else {
                alert("Por favor, escribe el nombre del plato soñado.");
            }
            return;
        }

        if (typeof launchToast === "function") {
            launchToast("¡Sugerencia enviada con éxito! :)");
        } else {
            alert("Sugerencia enviada :)");
        }
        
        formSugerencia.reset();
    });
}

// ============================================================ //
// CONTROL LATERAL DEL CARRITO MÓVIL
// ============================================================ //

if (mobileCartToggle) {
    mobileCartToggle.addEventListener("click", () => cartAside?.classList.toggle("mobile-open"));
}
// ============================================================ //
// VENTANA DE CALIFICACIÓN FLOTANTE
// ============================================================ //

// Constantes para almacenamiento
const REVIEW_STORAGE_KEY = 'sabor_estilo_review_preference';
const REVIEW_SESSION_KEY = 'sabor_estilo_review_shown';

// Función para verificar si ya se mostró la review en esta sesión
function reviewShownInSession() {
    return sessionStorage.getItem(REVIEW_SESSION_KEY) === 'true';
}

// Función para guardar preferencia del usuario
function guardarPreferenciaReview(accion) {
    const data = {
        accion: accion, // 'rated', 'later', 'never'
        fecha: new Date().toISOString(),
        timestamp: Date.now()
    };
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(data));
    console.log('[Review] Preferencia guardada:', accion);
}

// Función para verificar si debemos mostrar la review
function debeMostrarReview() {
    // Si ya se mostró en esta sesión, no mostrar
    if (reviewShownInSession()) {
        console.log('[Review] Ya se mostró en esta sesión');
        return false;
    }
    
    // Verificar preferencia guardada
    const preferencia = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!preferencia) {
        return true;
    }
    
    try {
        const data = JSON.parse(preferencia);
        
        // Si dijo "never", no mostrar nunca
        if (data.accion === 'never') {
            console.log('[Review] Usuario prefirió no mostrar nunca');
            return false;
        }
        
        // Si dijo "later" y pasaron más de 7 días, mostrar
        if (data.accion === 'later') {
            const diasPasados = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
            if (diasPasados > 7) {
                console.log('[Review] Pasaron más de 7 días, mostrar nuevamente');
                return true;
            }
            console.log('[Review] Usuario pidió recordatorio en menos de 7 días');
            return false;
        }
        
        // Si dijo "rated", esperar 30 días antes de volver a preguntar
        if (data.accion === 'rated') {
            const diasPasados = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
            if (diasPasados > 30) {
                console.log('[Review] Pasaron más de 30 días desde la última calificación');
                return true;
            }
            console.log('[Review] Usuario ya calificó recientemente');
            return false;
        }
        
        return true;
    } catch (error) {
        console.warn('[Review] Error al leer preferencia:', error);
        return true;
    }
}

// Función para marcar que ya se mostró en esta sesión
function marcarReviewMostrada() {
    sessionStorage.setItem(REVIEW_SESSION_KEY, 'true');
}

function triggerReviewModal() {
    // Verificar si debemos mostrar la review
    if (!debeMostrarReview()) {
        console.log('[Review] Condiciones no cumplidas para mostrar review');
        return;
    }
    
    console.log('[Review] Mostrando ventana de calificación');
    
    const reviewOverlay = document.createElement("div");
    reviewOverlay.className = "welcome-overlay";
    reviewOverlay.style.zIndex = "6000";
    reviewOverlay.style.animation = "fadeIn 0.3s ease-out";
    reviewOverlay.innerHTML = `
        <div class="welcome-card" style="text-align: center; border-color: #ffb400; animation: slideUp 0.4s ease-out; max-width: 420px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">⭐</div>
            <h3 style="color: #ffb400; margin-bottom: 12px; font-size: 1.3rem;">¡Tu opinión nos importa!</h3>
            <p style="font-size: 0.9rem; color: #ccc; margin-bottom: 20px; line-height: 1.5;">
                ¿Te gustaría tomarnos un minuto para calificar tu experiencia de compra en <strong>Sabor y Estilo</strong>?
            </p>
            <p style="font-size: 0.8rem; color: #888; margin-bottom: 18px;">
                ⏱️ Solo te tomará 1 minuto
            </p>
            <div style="display:flex; flex-direction:column; gap:10px; width: 100%;">
                <button id="btn-rate-now" style="background: #ffb400; color:#000; font-weight:bold; border:none; padding:12px; border-radius:8px; cursor:pointer; transition: all 0.2s; font-size: 1rem; width: 100%;" 
                        onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    ⭐ Sí, calificar ahora
                </button>
                <button id="btn-rate-later" style="background: rgba(255,255,255,0.08); color:#fff; border:1px solid #444; padding:10px; border-radius:8px; cursor:pointer; transition: all 0.2s; width: 100%;"
                        onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
                    ⏰ Más tarde
                </button>
                <button id="btn-rate-never" style="background: transparent; color:#666; border:none; padding:8px; font-size:0.8rem; cursor:pointer; text-decoration:underline; width: 100%;"
                        onmouseover="this.style.color='#888'" onmouseout="this.style.color='#666'">
                    ❌ No volver a preguntar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(reviewOverlay);
    
    // Marcar como mostrada en sesión
    marcarReviewMostrada();

    // Evento: Calificar ahora
    document.getElementById("btn-rate-now").addEventListener("click", () => {
        reviewOverlay.remove();
        guardarPreferenciaReview('rated');
        launchToast("⭐ ¡Gracias por calificarnos!");
        setTimeout(() => {
            window.location.href = "/src/modulo_feedback/resenas.html";
        }, 500);
    });
    
    // Evento: Más tarde
    document.getElementById("btn-rate-later").addEventListener("click", () => {
        reviewOverlay.remove();
        guardarPreferenciaReview('later');
        launchToast("📅 Te lo recordaremos en tu próxima visita");
    });
    
    // Evento: No volver a preguntar
    document.getElementById("btn-rate-never").addEventListener("click", () => {
        reviewOverlay.remove();
        guardarPreferenciaReview('never');
        launchToast("✅ Entendido, no volveremos a preguntar");
    });
    
    // Cerrar al hacer clic fuera (mejora UX)
    reviewOverlay.addEventListener("click", (e) => {
        if (e.target === reviewOverlay) {
            reviewOverlay.remove();
            launchToast("📅 Puedes calificarnos cuando quieras en la sección Reseñas");
        }
    });
}

// ============================================================ //
// FUNCIÓN PARA FORZAR MOSTRAR REVIEW (DESDE CONSOLA)
// ============================================================ //

function forceReviewModal() {
    sessionStorage.removeItem(REVIEW_SESSION_KEY);
    triggerReviewModal();
}
// ============================================================ //
// FUNCIONES DE FORMATEO DE TARJETA
// ============================================================ //

function formatearNumeroTarjeta(input) {
    // Eliminar todo excepto numeros
    let valor = input.value.replace(/\D/g, '');
    
    // Limitar a 16 digitos
    if (valor.length > 16) {
        valor = valor.slice(0, 16);
    }
    
    // Agregar espacios cada 4 digitos
    let valorFormateado = '';
    for (let i = 0; i < valor.length; i++) {
        if (i > 0 && i % 4 === 0) {
            valorFormateado += ' ';
        }
        valorFormateado += valor[i];
    }
    
    input.value = valorFormateado;
}

function formatearFechaTarjeta(input) {
    // Eliminar todo excepto numeros
    let valor = input.value.replace(/\D/g, '');
    
    // Limitar a 4 digitos (MMAA)
    if (valor.length > 4) {
        valor = valor.slice(0, 4);
    }
    
    // Validar mes (no mayor a 12)
    if (valor.length >= 2) {
        const mes = parseInt(valor.slice(0, 2));
        if (mes > 12) {
            // Si el mes es mayor a 12, ajustar a 12
            valor = '12' + valor.slice(2);
        }
        if (mes === 0) {
            // Si el mes es 0, ajustar a 1
            valor = '1' + valor.slice(1);
        }
    }
    
    // Agregar slash despues del mes
    let valorFormateado = '';
    for (let i = 0; i < valor.length; i++) {
        if (i === 2 && valor.length > 2) {
            valorFormateado += '/';
        }
        valorFormateado += valor[i];
    }
    
    input.value = valorFormateado;
}

function validarNumeroTarjeta(input) {
    const valor = input.value.replace(/\s/g, '');
    return valor.length === 16;
}

function validarFechaTarjeta(input) {
    const valor = input.value.replace(/\//g, '');
    if (valor.length !== 4) return false;
    
    const mes = parseInt(valor.slice(0, 2));
    const anio = parseInt(valor.slice(2, 4));
    
    // Validar mes (1-12) y año (año actual o posterior)
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear() % 100;
    
    if (mes < 1 || mes > 12) return false;
    if (anio < anioActual) return false;
    if (anio === anioActual) {
        const mesActual = fechaActual.getMonth() + 1;
        if (mes < mesActual) return false;
    }
    
    return true;
}

function validarCvv(input) {
    const valor = input.value.replace(/\D/g, '');
    return valor.length >= 3 && valor.length <= 4;
}

function validarNombreTitular(input) {
    return input.value.trim().length >= 3;
}

// ============================================================ //
// PASARELA MERCADO PAGO - FINALIZAR PEDIDO
// ============================================================ //

if (mainOrderForm) {
    mainOrderForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        console.log('[Pedido] Iniciando proceso de finalizacion...');
        console.log('[Pedido] Carrito actual:', cartArray);
        
        if (!requireLogin()) {
            console.log('[Pedido] Usuario no logueado, cancelando.');
            return;
        }
        
        if (cartArray.length === 0) {
            launchToast("El carrito esta vacio", "error");
            console.log('[Pedido] Carrito vacio.');
            return;
        }
        
        const clientNameInput = document.getElementById("customer-name");
        let clientName = clientNameInput ? clientNameInput.value.trim() : "";
        
        if (!clientName) {
            const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
            if (userData && userData.nombre) {
                clientName = userData.nombre;
                if (clientNameInput) {
                    clientNameInput.value = clientName;
                }
                console.log('[Pedido] Nombre auto-completado desde login:', clientName);
            }
        }
        
        if (!clientName) {
            launchToast("Por favor, ingresa tu nombre en el campo correspondiente", "error");
            if (clientNameInput) {
                clientNameInput.focus();
                clientNameInput.style.borderColor = "#ff3333";
                setTimeout(function() {
                    clientNameInput.style.borderColor = "";
                }, 3000);
            }
            console.log('[Pedido] Error: Nombre del cliente vacio.');
            return;
        }
        
        console.log('[Pedido] Cliente:', clientName);
        
        const docType = receiptTypeSelect ? receiptTypeSelect.value : "boleta";
        const rucVal = rucInput ? rucInput.value.trim() : "";
        const companyVal = companyInput ? companyInput.value.trim() : "";
        const deliveryType = deliverySelect ? deliverySelect.value : "recojo";
        const addressVal = addressInput ? addressInput.value.trim() : "";
        
        const rawSubtotal = cartArray.reduce(function(sum, item) {
            return sum + (item.price * item.qty);
        }, 0);
        const discountAmount = rawSubtotal * activeDiscount;
        const totalFinal = rawSubtotal - discountAmount;
        
        console.log('[Pedido] Subtotal:', rawSubtotal);
        console.log('[Pedido] Descuento:', discountAmount);
        console.log('[Pedido] Total final:', totalFinal);

        // MOSTRAR PASARELA DE PAGO
        const checkoutModal = document.createElement("div");
        checkoutModal.className = "welcome-overlay";
        checkoutModal.style.zIndex = "5500";
        checkoutModal.innerHTML = 
            '<div class="welcome-card" style="max-width: 420px; border: 1px solid #00a650; background: #121212; text-align: left;">' +
                '<div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:15px;">' +
                    '<span style="font-size:1.5rem;">Tarjeta</span>' +
                    '<h3 style="color:#00a650; margin:0; font-size: 1.15rem;">Pasarela Mercado Pago</h3>' +
                '</div>' +
                '<div style="text-align:center; margin-bottom:15px; padding:10px; background:rgba(0,166,80,0.1); border-radius:6px;">' +
                    '<p style="color:#00a650; font-weight:bold;">Cliente: ' + clientName + '</p>' +
                '</div>' +
                '<form id="form-simulated-card" style="display:flex; flex-direction:column; gap:12px;">' +
                    '<div class="input-group">' +
                        '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Numero de Tarjeta</label>' +
                        '<input type="text" id="card-number" placeholder="4111 1111 1111 1111" maxlength="19" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" oninput="formatearNumeroTarjeta(this)" />' +
                        '<span id="card-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">Debe tener 16 digitos</span>' +
                    '</div>' +
                    '<div style="display:flex; gap:10px;">' +
                        '<div style="flex:1;">' +
                            '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Fecha Vencimiento</label>' +
                            '<input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" oninput="formatearFechaTarjeta(this)" />' +
                            '<span id="expiry-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">Formato MM/AA (mes valido)</span>' +
                        '</div>' +
                        '<div style="flex:1;">' +
                            '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">CVV</label>' +
                            '<input type="password" id="card-cvv" placeholder="***" maxlength="4" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" oninput="this.value = this.value.replace(/\\D/g, \'\').slice(0, 4)" />' +
                            '<span id="cvv-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">3 o 4 digitos</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="input-group">' +
                        '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Nombre del Titular</label>' +
                        '<input type="text" id="card-name" placeholder="Como figura en la tarjeta" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box; text-transform:uppercase;" />' +
                        '<span id="name-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">Ingresa el nombre del titular</span>' +
                    '</div>' +
                    '<div style="background: rgba(0,0,0,0.3); padding:10px; border-radius:6px; font-size:0.8rem; border:1px solid #222; margin-top:5px;">' +
                        '<div style="display:flex; justify-content:space-between; color:#888; margin-bottom:4px;">' +
                            '<span>Subtotal:</span><span>S/ ' + rawSubtotal.toFixed(2) + '</span>' +
                        '</div>' +
                        (activeDiscount > 0 ? 
                            '<div style="display:flex; justify-content:space-between; color:#ff6b6b; margin-bottom:4px;">' +
                                '<span>Descuento:</span><span>-S/ ' + discountAmount.toFixed(2) + '</span>' +
                            '</div>' : '') +
                        '<div style="display:flex; justify-content:space-between; font-weight:bold; color:#fff; font-size:0.9rem;">' +
                            '<span>Total a debitar:</span><span style="color:#00a650;">S/ ' + totalFinal.toFixed(2) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex; gap:10px; margin-top:10px;">' +
                        '<button type="button" id="btn-cancel-pay" style="flex:1; background:transparent; border:1px solid #555; color:#aaa; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold;">Cancelar</button>' +
                        '<button type="submit" id="btn-pay-now" style="flex:2; background:#00a650; color:#fff; font-weight:bold; border:none; padding:10px; border-radius:6px; cursor:pointer;">PAGAR AHORA</button>' +
                    '</div>' +
                '</form>' +
            '</div>';
        document.body.appendChild(checkoutModal);
        
        document.getElementById("btn-cancel-pay").addEventListener("click", function() {
            checkoutModal.remove();
            launchToast("Pago cancelado", "error");
        });
        
        document.getElementById("form-simulated-card").addEventListener("submit", function(subEv) {
            subEv.preventDefault();
            
            // Obtener campos
            const cardNumber = document.getElementById("card-number");
            const cardExpiry = document.getElementById("card-expiry");
            const cardCvv = document.getElementById("card-cvv");
            const cardName = document.getElementById("card-name");
            const cardError = document.getElementById("card-error");
            const expiryError = document.getElementById("expiry-error");
            const cvvError = document.getElementById("cvv-error");
            const nameError = document.getElementById("name-error");
            
            // Ocultar mensajes de error anteriores
            cardError.style.display = "none";
            expiryError.style.display = "none";
            cvvError.style.display = "none";
            nameError.style.display = "none";
            
            let camposCompletos = true;
            
            // Validar numero de tarjeta
            if (!validarNumeroTarjeta(cardNumber)) {
                cardNumber.style.borderColor = "#ff3333";
                cardError.style.display = "block";
                camposCompletos = false;
            } else {
                cardNumber.style.borderColor = "#00a650";
            }
            
            // Validar fecha de vencimiento
            if (!validarFechaTarjeta(cardExpiry)) {
                cardExpiry.style.borderColor = "#ff3333";
                expiryError.style.display = "block";
                camposCompletos = false;
            } else {
                cardExpiry.style.borderColor = "#00a650";
            }
            
            // Validar CVV
            if (!validarCvv(cardCvv)) {
                cardCvv.style.borderColor = "#ff3333";
                cvvError.style.display = "block";
                camposCompletos = false;
            } else {
                cardCvv.style.borderColor = "#00a650";
            }
            
            // Validar nombre del titular
            if (!validarNombreTitular(cardName)) {
                cardName.style.borderColor = "#ff3333";
                nameError.style.display = "block";
                camposCompletos = false;
            } else {
                cardName.style.borderColor = "#00a650";
            }
            
            if (!camposCompletos) {
                launchToast("Por favor, completa todos los campos correctamente", "error");
                return;
            }
            
            checkoutModal.remove();
            launchToast("Pago procesado exitosamente");
            
            const pedidoGuardado = guardarPedidoEnHistorial(
                cartArray,
                totalFinal,
                activeDiscount,
                addressVal,
                deliveryType
            );
            
            console.log('[Pedido] Pedido guardado en historial:', pedidoGuardado);
            
            const fecha = new Date();
            const currentDate = fecha.toLocaleDateString();
            const currentTime = fecha.toLocaleTimeString();

            const randomNum = String(crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000).padStart(6, '0');
            const fullDocumentId = (docType === "factura" ? "FFF" : "BBB") + "-" + randomNum;

            const receiptWindow = window.open("", "_blank");
            if (receiptWindow) {
                receiptWindow.document.write(
                    '<html>' +
                    '<head>' +
                        '<title>' + docType.toUpperCase() + ' - ' + fullDocumentId + '</title>' +
                        '<style>' +
                            'body { font-family: "Courier New", Courier, monospace; margin: 0; padding: 10px; color: #000; font-size: 13px; }' +
                            '.ticket { max-width: 380px; margin: auto; padding: 10px; }' +
                            '.center { text-align: center; }' +
                            '.bold { font-weight: bold; }' +
                            '.separator { border-top: 1px dashed #000; margin: 10px 0; }' +
                            '.flex-space { display: flex; justify-content: space-between; }' +
                            '.items-list { padding: 0; list-style: none; margin: 5px 0; }' +
                            '.btn-print { width: 100%; padding: 10px; background: #000; color: #fff; border: none; font-weight: bold; cursor: pointer; margin-top: 15px; font-family: inherit; }' +
                            '@media print { .btn-print { display: none; } }' +
                        '</style>' +
                    '</head>' +
                    '<body>' +
                        '<div class="ticket">' +
                            '<h2 class="center" style="margin-bottom: 4px;">SABOR Y ESTILO</h2>' +
                            '<p class="center" style="margin-top: 0; font-size: 11px;">SABOR Y ESTILO S.A.C.<br>AV. CENTRAL 123 - LIMA</p>' +
                            '<div class="separator"></div>' +
                            '<p class="bold center" style="font-size: 14px; margin: 5px 0;">' + docType.toUpperCase() + ' ELECTRONICA</p>' +
                            '<p class="center" style="margin: 0;"><b>SERIE:</b> ' + fullDocumentId + '</p>' +
                            '<div class="separator"></div>' +
                            '<p><b>FECHA EMISION:</b> ' + currentDate + ' ' + currentTime + '</p>' +
                            '<p><b>CLIENTE:</b> ' + (docType === "factura" ? companyVal : clientName) + '</p>' +
                            (docType === "factura" ? '<p><b>RUC:</b> ' + rucVal + '</p>' : "") +
                            '<p><b>ENTREGA:</b> ' + (deliveryType === "recojo" ? "Recojo en Tienda" : "Delivery") + '</p>' +
                            (deliveryType === "delivery" ? '<p><b>DIRECCION:</b> ' + addressVal + '</p>' : "") +
                            '<div class="separator"></div>' +
                            '<p class="bold">DETALLE DEL PEDIDO:</p>' +
                            '<ul class="items-list">' +
                                cartArray.map(function(i) {
                                    return '<li class="flex-space" style="margin-bottom: 5px;">' +
                                        '<span>' + i.qty + ' x ' + i.name + '</span>' +
                                        '<span>S/ ' + (i.price * i.qty).toFixed(2) + '</span>' +
                                    '</li>';
                                }).join("") +
                            '</ul>' +
                            '<div class="separator"></div>' +
                            '<div class="flex-space"><span>OP. GRAVADA:</span><span>S/ ' + (totalFinal / 1.18).toFixed(2) + '</span></div>' +
                            '<div class="flex-space"><span>I.G.V. (18%):</span><span>S/ ' + (totalFinal - (totalFinal / 1.18)).toFixed(2) + '</span></div>' +
                            (activeDiscount > 0 ? '<div class="flex-space" style="color: red;"><span>DSCTO APLICADO:</span><span>-S/ ' + discountAmount.toFixed(2) + '</span></div>' : "") +
                            '<div class="flex-space bold" style="font-size: 15px; margin-top: 5px;"><span>TOTAL A PAGAR:</span><span>S/ ' + totalFinal.toFixed(2) + '</span></div>' +
                            '<div class="separator"></div>' +
                            '<p class="center" style="font-size: 11px; font-style: italic;">Representacion impresa de la ' + docType + '.<br>Gracias por tu preferencia</p>' +
                            '<button class="btn-print" onclick="window.print()">IMPRIMIR COMPROBANTE</button>' +
                        '</div>' +
                    '</body>' +
                    '</html>'
                );
                receiptWindow.document.close();
            }

            cartArray = [];
            syncCartView();
            mainOrderForm.reset();
            if (rucGroup) rucGroup.style.display = "none";
            if (cartAside) cartAside.classList.remove("mobile-open");

            setTimeout(function() {
                triggerReviewModal();
            }, 800);
        });
    });
}
// ============================================================ //
// PASARELA MERCADO PAGO - FINALIZAR PEDIDO
// ============================================================ //

if (mainOrderForm) {
    mainOrderForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        console.log('[Pedido] Iniciando proceso de finalizacion...');
        console.log('[Pedido] Carrito actual:', cartArray);
        
        if (!requireLogin()) {
            console.log('[Pedido] Usuario no logueado, cancelando.');
            return;
        }
        
        if (cartArray.length === 0) {
            launchToast("El carrito esta vacio", "error");
            console.log('[Pedido] Carrito vacio.');
            return;
        }
        
        const clientNameInput = document.getElementById("customer-name");
        let clientName = clientNameInput ? clientNameInput.value.trim() : "";
        
        if (!clientName) {
            const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
            if (userData && userData.nombre) {
                clientName = userData.nombre;
                if (clientNameInput) {
                    clientNameInput.value = clientName;
                }
                console.log('[Pedido] Nombre auto-completado desde login:', clientName);
            }
        }
        
        if (!clientName) {
            launchToast("Por favor, ingresa tu nombre en el campo correspondiente", "error");
            if (clientNameInput) {
                clientNameInput.focus();
                clientNameInput.style.borderColor = "#ff3333";
                setTimeout(function() {
                    clientNameInput.style.borderColor = "";
                }, 3000);
            }
            console.log('[Pedido] Error: Nombre del cliente vacio.');
            return;
        }
        
        console.log('[Pedido] Cliente:', clientName);
        
        const docType = receiptTypeSelect ? receiptTypeSelect.value : "boleta";
        const rucVal = rucInput ? rucInput.value.trim() : "";
        const companyVal = companyInput ? companyInput.value.trim() : "";
        const deliveryType = deliverySelect ? deliverySelect.value : "recojo";
        const addressVal = addressInput ? addressInput.value.trim() : "";
        
        const rawSubtotal = cartArray.reduce(function(sum, item) {
            return sum + (item.price * item.qty);
        }, 0);
        const discountAmount = rawSubtotal * activeDiscount;
        const totalFinal = rawSubtotal - discountAmount;
        
        console.log('[Pedido] Subtotal:', rawSubtotal);
        console.log('[Pedido] Descuento:', discountAmount);
        console.log('[Pedido] Total final:', totalFinal);

        // MOSTRAR PASARELA DE PAGO
        const checkoutModal = document.createElement("div");
        checkoutModal.className = "welcome-overlay";
        checkoutModal.style.zIndex = "5500";
        checkoutModal.innerHTML = 
            '<div class="welcome-card" style="max-width: 420px; border: 1px solid #00a650; background: #121212; text-align: left;">' +
                '<div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:15px;">' +
                    '<span style="font-size:1.5rem;">Tarjeta</span>' +
                    '<h3 style="color:#00a650; margin:0; font-size: 1.15rem;">Pasarela Mercado Pago</h3>' +
                '</div>' +
                '<div style="text-align:center; margin-bottom:15px; padding:10px; background:rgba(0,166,80,0.1); border-radius:6px;">' +
                    '<p style="color:#00a650; font-weight:bold;">Cliente: ' + clientName + '</p>' +
                '</div>' +
                '<form id="form-simulated-card" style="display:flex; flex-direction:column; gap:12px;">' +
                    '<div class="input-group">' +
                        '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Numero de Tarjeta</label>' +
                        '<input type="text" id="card-number" placeholder="4111 1111 1111 1111" maxlength="19" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" oninput="formatearNumeroTarjeta(this)" />' +
                        '<span id="card-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">Debe tener 16 digitos</span>' +
                    '</div>' +
                    '<div style="display:flex; gap:10px;">' +
                        '<div style="flex:1;">' +
                            '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Fecha Vencimiento</label>' +
                            '<input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" oninput="formatearFechaTarjeta(this)" />' +
                            '<span id="expiry-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">Formato MM/AA (mes valido)</span>' +
                        '</div>' +
                        '<div style="flex:1;">' +
                            '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">CVV</label>' +
                            '<input type="password" id="card-cvv" placeholder="*" maxlength="4" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" oninput="this.value = this.value.replace(/\\D/g, \'\').slice(0, 4)" />' +
                            '<span id="cvv-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">3 o 4 digitos</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="input-group">' +
                        '<label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Nombre del Titular</label>' +
                        '<input type="text" id="card-name" placeholder="Como figura en la tarjeta" required style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box; text-transform:uppercase;" />' +
                        '<span id="name-error" style="color:#ff3333; font-size:0.75rem; display:none; margin-top:4px;">Ingresa el nombre del titular</span>' +
                    '</div>' +
                    '<div style="background: rgba(0,0,0,0.3); padding:10px; border-radius:6px; font-size:0.8rem; border:1px solid #222; margin-top:5px;">' +
                        '<div style="display:flex; justify-content:space-between; color:#888; margin-bottom:4px;">' +
                            '<span>Subtotal:</span><span>S/ ' + rawSubtotal.toFixed(2) + '</span>' +
                        '</div>' +
                        (activeDiscount > 0 ? 
                            '<div style="display:flex; justify-content:space-between; color:#ff6b6b; margin-bottom:4px;">' +
                                '<span>Descuento:</span><span>-S/ ' + discountAmount.toFixed(2) + '</span>' +
                            '</div>' : '') +
                        '<div style="display:flex; justify-content:space-between; font-weight:bold; color:#fff; font-size:0.9rem;">' +
                            '<span>Total a debitar:</span><span style="color:#00a650;">S/ ' + totalFinal.toFixed(2) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex; gap:10px; margin-top:10px;">' +
                        '<button type="button" id="btn-cancel-pay" style="flex:1; background:transparent; border:1px solid #555; color:#aaa; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold;">Cancelar</button>' +
                        '<button type="submit" id="btn-pay-now" style="flex:2; background:#00a650; color:#fff; font-weight:bold; border:none; padding:10px; border-radius:6px; cursor:pointer;">PAGAR AHORA</button>' +
                    '</div>' +
                '</form>' +
            '</div>';
        document.body.appendChild(checkoutModal);
        
        document.getElementById("btn-cancel-pay").addEventListener("click", function() {
            checkoutModal.remove();
            launchToast("Pago cancelado", "error");
        });
        
        document.getElementById("form-simulated-card").addEventListener("submit", function(subEv) {
            subEv.preventDefault();
            
            // Obtener campos
            const cardNumber = document.getElementById("card-number");
            const cardExpiry = document.getElementById("card-expiry");
            const cardCvv = document.getElementById("card-cvv");
            const cardName = document.getElementById("card-name");
            const cardError = document.getElementById("card-error");
            const expiryError = document.getElementById("expiry-error");
            const cvvError = document.getElementById("cvv-error");
            const nameError = document.getElementById("name-error");
            
            // Ocultar mensajes de error anteriores
            cardError.style.display = "none";
            expiryError.style.display = "none";
            cvvError.style.display = "none";
            nameError.style.display = "none";
            
            let camposCompletos = true;
            
            // Validar numero de tarjeta
            if (!validarNumeroTarjeta(cardNumber)) {
                cardNumber.style.borderColor = "#ff3333";
                cardError.style.display = "block";
                camposCompletos = false;
            } else {
                cardNumber.style.borderColor = "#00a650";
            }
            
            // Validar fecha de vencimiento
            if (!validarFechaTarjeta(cardExpiry)) {
                cardExpiry.style.borderColor = "#ff3333";
                expiryError.style.display = "block";
                camposCompletos = false;
            } else {
                cardExpiry.style.borderColor = "#00a650";
            }
            
            // Validar CVV
            if (!validarCvv(cardCvv)) {
                cardCvv.style.borderColor = "#ff3333";
                cvvError.style.display = "block";
                camposCompletos = false;
            } else {
                cardCvv.style.borderColor = "#00a650";
            }
            
            // Validar nombre del titular
            if (!validarNombreTitular(cardName)) {
                cardName.style.borderColor = "#ff3333";
                nameError.style.display = "block";
                camposCompletos = false;
            } else {
                cardName.style.borderColor = "#00a650";
            }
            
            if (!camposCompletos) {
                launchToast("Por favor, completa todos los campos correctamente", "error");
                return;
            }
            
            checkoutModal.remove();
            launchToast("Pago procesado exitosamente");
            
            const pedidoGuardado = guardarPedidoEnHistorial(
                cartArray,
                totalFinal,
                activeDiscount,
                addressVal,
                deliveryType
            );
            
            console.log('[Pedido] Pedido guardado en historial:', pedidoGuardado);
            
            const fecha = new Date();
            const currentDate = fecha.toLocaleDateString();
            const currentTime = fecha.toLocaleTimeString();

            const randomNum = String(crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000).padStart(6, '0');
            const fullDocumentId = (docType === "factura" ? "FFF" : "BBB") + "-" + randomNum;

            const receiptWindow = window.open("", "_blank");
            if (receiptWindow) {
                receiptWindow.document.write(
                    '<html>' +
                    '<head>' +
                        '<title>' + docType.toUpperCase() + ' - ' + fullDocumentId + '</title>' +
                        '<style>' +
                            'body { font-family: "Courier New", Courier, monospace; margin: 0; padding: 10px; color: #000; font-size: 13px; }' +
                            '.ticket { max-width: 380px; margin: auto; padding: 10px; }' +
                            '.center { text-align: center; }' +
                            '.bold { font-weight: bold; }' +
                            '.separator { border-top: 1px dashed #000; margin: 10px 0; }' +
                            '.flex-space { display: flex; justify-content: space-between; }' +
                            '.items-list { padding: 0; list-style: none; margin: 5px 0; }' +
                            '.btn-print { width: 100%; padding: 10px; background: #000; color: #fff; border: none; font-weight: bold; cursor: pointer; margin-top: 15px; font-family: inherit; }' +
                            '@media print { .btn-print { display: none; } }' +
                        '</style>' +
                    '</head>' +
                    '<body>' +
                        '<div class="ticket">' +
                            '<h2 class="center" style="margin-bottom: 4px;">SABOR Y ESTILO</h2>' +
                            '<p class="center" style="margin-top: 0; font-size: 11px;">SABOR Y ESTILO S.A.C.<br>AV. CENTRAL 123 - LIMA</p>' +
                            '<div class="separator"></div>' +
                            '<p class="bold center" style="font-size: 14px; margin: 5px 0;">' + docType.toUpperCase() + ' ELECTRONICA</p>' +
                            '<p class="center" style="margin: 0;"><b>SERIE:</b> ' + fullDocumentId + '</p>' +
                            '<div class="separator"></div>' +
                            '<p><b>FECHA EMISION:</b> ' + currentDate + ' ' + currentTime + '</p>' +
                            '<p><b>CLIENTE:</b> ' + (docType === "factura" ? companyVal : clientName) + '</p>' +
                            (docType === "factura" ? '<p><b>RUC:</b> ' + rucVal + '</p>' : "") +
                            '<p><b>ENTREGA:</b> ' + (deliveryType === "recojo" ? "Recojo en Tienda" : "Delivery") + '</p>' +
                            (deliveryType === "delivery" ? '<p><b>DIRECCION:</b> ' + addressVal + '</p>' : "") +
                            '<div class="separator"></div>' +
                            '<p class="bold">DETALLE DEL PEDIDO:</p>' +
                            '<ul class="items-list">' +
                                cartArray.map(function(i) {
                                    return '<li class="flex-space" style="margin-bottom: 5px;">' +
                                        '<span>' + i.qty + ' x ' + i.name + '</span>' +
                                        '<span>S/ ' + (i.price * i.qty).toFixed(2) + '</span>' +
                                    '</li>';
                                }).join("") +
                            '</ul>' +
                            '<div class="separator"></div>' +
                            '<div class="flex-space"><span>OP. GRAVADA:</span><span>S/ ' + (totalFinal / 1.18).toFixed(2) + '</span></div>' +
                            '<div class="flex-space"><span>I.G.V. (18%):</span><span>S/ ' + (totalFinal - (totalFinal / 1.18)).toFixed(2) + '</span></div>' +
                            (activeDiscount > 0 ? '<div class="flex-space" style="color: red;"><span>DSCTO APLICADO:</span><span>-S/ ' + discountAmount.toFixed(2) + '</span></div>' : "") +
                            '<div class="flex-space bold" style="font-size: 15px; margin-top: 5px;"><span>TOTAL A PAGAR:</span><span>S/ ' + totalFinal.toFixed(2) + '</span></div>' +
                            '<div class="separator"></div>' +
                            '<p class="center" style="font-size: 11px; font-style: italic;">Representacion impresa de la ' + docType + '.<br>Gracias por tu preferencia</p>' +
                            '<button class="btn-print" onclick="window.print()">IMPRIMIR COMPROBANTE</button>' +
                        '</div>' +
                    '</body>' +
                    '</html>'
                );
                receiptWindow.document.close();
            }

            cartArray = [];
            syncCartView();
            mainOrderForm.reset();
            if (rucGroup) rucGroup.style.display = "none";
            if (cartAside) cartAside.classList.remove("mobile-open");

            setTimeout(function() {
                triggerReviewModal();
            }, 800);
        });
    });
}
// ============================================================ //
// AUTO-COMPLETAR NOMBRE DEL USUARIO AL CARGAR
// ============================================================ //

document.addEventListener('DOMContentLoaded', function() {
    mostrarUsuarioLogueado();
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'sabor_estilo_user') {
            mostrarUsuarioLogueado();
        }
    });
});

console.log('✅ [Sistema] Carrito de compras inicializado correctamente.');