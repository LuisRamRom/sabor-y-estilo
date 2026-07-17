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
    if (userData && userData.nombre) {
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
            const numericalPrice = parseFloat(priceText.replace(/[^0-9.]/g, ""));
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
    const base = parseFloat(selectBase.value) || 0;
    const extra = parseFloat(selectExtra.value) || 0;
    subtotalVal.innerText = (base + extra).toFixed(2);
}

if (selectBase) selectBase.addEventListener("change", recalculateSubtotal);
if (selectExtra) selectExtra.addEventListener("change", recalculateSubtotal);

if (formCreacion) {
    formCreacion.addEventListener("submit", (e) => {
        e.preventDefault();
        
        if (!requireLogin()) {
            return;
        }
        
        const currentPrice = parseFloat(subtotalVal.innerText) || 0;
        
        if (selectBase.value === "0" || currentPrice <= 0) {
            if (typeof launchToast === "function") {
                launchToast("Por favor, selecciona una base válida.", "error");
            } else {
                alert("Por favor, selecciona una base válida.");
            }
            return;
        }

        const rawBaseText = selectBase.options[selectBase.selectedIndex].text;
        const nameBase = rawBaseText.includes("-") ? rawBaseText.split("-")[0].trim() : rawBaseText.trim();
        
        let nameExtra = "";
        if (selectExtra && selectExtra.selectedIndex > 0) {
            const rawExtraText = selectExtra.options[selectExtra.selectedIndex].text;
            const cleanExtra = rawExtraText.includes("-") ? rawExtraText.split("-")[0].trim() : rawExtraText.trim();
            nameExtra = ` + ${cleanExtra}`;
        }
        
        const customTitle = `🛠️ Personalizado: ${nameBase}${nameExtra}`;

        const existingCustom = cartArray.find(item => item.name === customTitle);
        if (existingCustom) {
            if (existingCustom.qty < MAX_PER_ITEM) {
                existingCustom.qty++;
                if (typeof launchToast === "function") launchToast("¡Pedido personalizado actualizado!");
            } else {
                if (typeof launchToast === "function") launchToast(`Máximo permitido: ${MAX_PER_ITEM} unidades`, "error");
            }
        } else {
            cartArray.push({
                name: customTitle,
                price: currentPrice,
                qty: 1,
                img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=80&auto=format&fit=crop"
            });
            if (typeof launchToast === "function") launchToast("¡Pedido personalizado añadido!");
        }

        formCreacion.reset();
        subtotalVal.innerText = "0.00";
        if (typeof syncCartView === "function") syncCartView();
    });
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

function triggerReviewModal() {
    const reviewOverlay = document.createElement("div");
    reviewOverlay.className = "welcome-overlay";
    reviewOverlay.style.zIndex = "6000";
    reviewOverlay.innerHTML = `
        <div class="welcome-card" style="text-align: center; border-color: #ffb400;">
            <h3 style="color: #ffb400; margin-bottom: 12px;">⭐ ¡Tu opinión nos importa!</h3>
            <p style="font-size: 0.9rem; color: #ccc; margin-bottom: 20px; line-height: 1.4;">
                ¿Te gustaría tomarnos un minuto para calificar tu experiencia de compra en Sabor y Estilo?
            </p>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button id="btn-rate-now" style="background: #ffb400; color:#000; font-weight:bold; border:none; padding:10px; border-radius:6px; cursor:pointer;">Sí, calificar</button>
                <button id="btn-rate-later" style="background: rgba(255,255,255,0.08); color:#fff; border:none; padding:10px; border-radius:6px; cursor:pointer;">Más tarde</button>
                <button id="btn-rate-never" style="background: transparent; color:#777; border:none; padding:5px; font-size:0.8rem; cursor:pointer; text-decoration:underline;">En otra ocasión</button>
            </div>
        </div>
    `;
    document.body.appendChild(reviewOverlay);

    document.getElementById("btn-rate-now").addEventListener("click", () => {
        reviewOverlay.remove();
        window.location.href = "../modulo_feedback/resenas.html";
    });
    document.getElementById("btn-rate-later").addEventListener("click", () => {
        reviewOverlay.remove();
        launchToast("¡Te lo recordaremos en tu próxima visita!");
    });
    document.getElementById("btn-rate-never").addEventListener("click", () => {
        reviewOverlay.remove();
    });
}

// ============================================================ //
// ⭐ PASARELA MERCADO PAGO - FINALIZAR PEDIDO
// ============================================================ //

if (mainOrderForm) {
    mainOrderForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        console.log('🛒 [Pedido] Iniciando proceso de finalización...');
        console.log('🛒 [Pedido] Carrito actual:', cartArray);
        
        // 1. VERIFICAR LOGIN
        if (!requireLogin()) {
            console.log('❌ [Pedido] Usuario no logueado, cancelando.');
            return;
        }
        
        // 2. VERIFICAR CARRITO VACÍO
        if (cartArray.length === 0) {
            launchToast("El carrito está vacío", "error");
            console.log('❌ [Pedido] Carrito vacío.');
            return;
        }
        
        // 3. OBTENER Y VALIDAR NOMBRE DEL CLIENTE
        const clientNameInput = document.getElementById("customer-name");
        let clientName = clientNameInput ? clientNameInput.value.trim() : "";
        
        if (!clientName) {
            const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
            if (userData && userData.nombre) {
                clientName = userData.nombre;
                if (clientNameInput) {
                    clientNameInput.value = clientName;
                }
                console.log('✅ [Pedido] Nombre auto-completado desde login:', clientName);
            }
        }
        
        if (!clientName) {
            launchToast("Por favor, ingresa tu nombre en el campo correspondiente", "error");
            if (clientNameInput) {
                clientNameInput.focus();
                clientNameInput.style.borderColor = "#ff3333";
                setTimeout(() => {
                    clientNameInput.style.borderColor = "";
                }, 3000);
            }
            console.log('❌ [Pedido] Error: Nombre del cliente vacío.');
            return;
        }
        
        console.log('✅ [Pedido] Cliente:', clientName);
        
        // 4. OBTENER DATOS DEL PEDIDO
        const docType = receiptTypeSelect ? receiptTypeSelect.value : "boleta";
        const rucVal = rucInput ? rucInput.value.trim() : "";
        const companyVal = companyInput ? companyInput.value.trim() : "";
        const deliveryType = deliverySelect ? deliverySelect.value : "recojo";
        const addressVal = addressInput ? addressInput.value.trim() : "";
        
        const rawSubtotal = cartArray.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const discountAmount = rawSubtotal * activeDiscount;
        const totalFinal = rawSubtotal - discountAmount;
        
        console.log('✅ [Pedido] Subtotal:', rawSubtotal);
        console.log('✅ [Pedido] Descuento:', discountAmount);
        console.log('✅ [Pedido] Total final:', totalFinal);

        // 5. MOSTRAR PASARELA DE PAGO
        const checkoutModal = document.createElement("div");
        checkoutModal.className = "welcome-overlay";
        checkoutModal.style.zIndex = "5500";
        checkoutModal.innerHTML = `
            <div class="welcome-card" style="max-width: 420px; border: 1px solid #00a650; background: #121212; text-align: left;">
                <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:15px;">
                    <span style="font-size:1.5rem;">💳</span>
                    <h3 style="color:#00a650; margin:0; font-size: 1.15rem;">Pasarela Mercado Pago</h3>
                </div>
                <div style="text-align:center; margin-bottom:15px; padding:10px; background:rgba(0,166,80,0.1); border-radius:6px;">
                    <p style="color:#00a650; font-weight:bold;">👤 ${clientName}</p>
                </div>
                <form id="form-simulated-card" style="display:flex; flex-direction:column; gap:12px;">
                    <div class="input-group">
                        <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Número de Tarjeta</label>
                        <input type="text" placeholder="4111 1111 1111 1111" maxlength="19" required
                               style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" />
                    </div>
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">F. Vencimiento</label>
                            <input type="text" placeholder="MM/AA" maxlength="5" required
                                   style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" />
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">CVV</label>
                            <input type="password" placeholder="***" maxlength="4" required
                                   style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box;" />
                        </div>
                    </div>
                    <div class="input-group">
                        <label style="font-size:0.75rem; color:#aaa; display:block; margin-bottom:4px;">Nombre del Titular</label>
                        <input type="text" placeholder="Como figura en la tarjeta" required
                               style="width:100%; padding:10px; background:#222; border:1px solid #444; color:#fff; border-radius:6px; box-sizing:border-box; text-transform:uppercase;" />
                    </div>

                    <div style="background: rgba(0,0,0,0.3); padding:10px; border-radius:6px; font-size:0.8rem; border:1px solid #222; margin-top:5px;">
                        <div style="display:flex; justify-content:space-between; color:#888; margin-bottom:4px;">
                            <span>Subtotal:</span><span>S/ ${rawSubtotal.toFixed(2)}</span>
                        </div>
                        ${activeDiscount > 0 ? `
                        <div style="display:flex; justify-content:space-between; color:#ff6b6b; margin-bottom:4px;">
                            <span>Descuento:</span><span>-S/ ${discountAmount.toFixed(2)}</span>
                        </div>` : ''}
                        <div style="display:flex; justify-content:space-between; font-weight:bold; color:#fff; font-size:0.9rem;">
                            <span>Total a debitar:</span><span style="color:#00a650;">S/ ${totalFinal.toFixed(2)}</span>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button type="button" id="btn-cancel-pay" style="flex:1; background:transparent; border:1px solid #555; color:#aaa; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold;">Cancelar</button>
                        <button type="submit" style="flex:2; background:#00a650; color:#fff; font-weight:bold; border:none; padding:10px; border-radius:6px; cursor:pointer;">PAGAR AHORA</button>
                    </div>
                </form>
            </div>`;
        document.body.appendChild(checkoutModal);
        
        document.getElementById("btn-cancel-pay").addEventListener("click", function() {
            checkoutModal.remove();
            launchToast("Pago cancelado", "error");
        });
        
        document.getElementById("form-simulated-card").addEventListener("submit", function(subEv) {
            subEv.preventDefault();
            checkoutModal.remove();
            launchToast("✅ ¡Pago procesado exitosamente!");
            
            // 🔥 GUARDAR PEDIDO EN HISTORIAL
            const pedidoGuardado = guardarPedidoEnHistorial(
                cartArray,
                totalFinal,
                activeDiscount,
                addressVal,
                deliveryType
            );
            
            console.log('✅ [Pedido] Pedido guardado en historial:', pedidoGuardado);
            
          // Mostrar ticket de impresión
            const fecha = new Date();
            const currentDate = fecha.toLocaleDateString();
            const currentTime = fecha.toLocaleTimeString();

        //  Generar ID seguro
            const randomNum = String(crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000).padStart(6, '0');
            const fullDocumentId = `${docType === "factura" ? "FFF" : "BBB"}-${randomNum}`;

            const receiptWindow = window.open("", "_blank");
            if (receiptWindow) {
                receiptWindow.document.write(`
                    <html>
                    <head>
                        <title>${docType.toUpperCase()} - ${fullDocumentId}</title>
                        <style>
                            body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 10px; color: #000; font-size: 13px; }
                            .ticket { max-width: 380px; margin: auto; padding: 10px; }
                            .center { text-align: center; }
                            .bold { font-weight: bold; }
                            .separator { border-top: 1px dashed #000; margin: 10px 0; }
                            .flex-space { display: flex; justify-content: space-between; }
                            .items-list { padding: 0; list-style: none; margin: 5px 0; }
                            .btn-print { width: 100%; padding: 10px; background: #000; color: #fff; border: none; font-weight: bold; cursor: pointer; margin-top: 15px; font-family: inherit; }
                            @media print { .btn-print { display: none; } }
                        </style>
                    </head>
                    <body>
                        <div class="ticket">
                            <h2 class="center" style="margin-bottom: 4px;">🍕 SABOR Y ESTILO</h2>
                            <p class="center" style="margin-top: 0; font-size: 11px;">SABOR Y ESTILO S.A.C.<br>AV. CENTRAL 123 - LIMA</p>
                            <div class="separator"></div>
                            <p class="bold center" style="font-size: 14px; margin: 5px 0;">${docType.toUpperCase()} ELECTRÓNICA</p>
                            <p class="center" style="margin: 0;"><b>SERIE:</b> ${fullDocumentId}</p>
                            <div class="separator"></div>
                            <p><b>FECHA EMISIÓN:</b> ${currentDate} ${currentTime}</p>
                            <p><b>CLIENTE:</b> ${docType === "factura" ? companyVal : clientName}</p>
                            ${docType === "factura" ? `<p><b>RUC:</b> ${rucVal}</p>` : ""}
                            <p><b>ENTREGA:</b> ${deliveryType === "recojo" ? "Recojo en Tienda" : "Delivery"}</p>
                            ${deliveryType === "delivery" ? `<p><b>DIRECCIÓN:</b> ${addressVal}</p>` : ""}
                            <div class="separator"></div>
                            <p class="bold">DETALLE DEL PEDIDO:</p>
                            <ul class="items-list">
                                ${cartArray.map(i => `
                                    <li class="flex-space" style="margin-bottom: 5px;">
                                        <span>${i.qty} x ${i.name}</span>
                                        <span>S/ ${(i.price * i.qty).toFixed(2)}</span>
                                    </li>
                                `).join("")}
                            </ul>
                            <div class="separator"></div>
                            <div class="flex-space"><span>OP. GRAVADA:</span><span>S/ ${(totalFinal / 1.18).toFixed(2)}</span></div>
                            <div class="flex-space"><span>I.G.V. (18%):</span><span>S/ ${(totalFinal - (totalFinal / 1.18)).toFixed(2)}</span></div>
                            ${activeDiscount > 0 ? `<div class="flex-space" style="color: red;"><span>DSCTO APLICADO:</span><span>-S/ ${discountAmount.toFixed(2)}</span></div>` : ""}
                            <div class="flex-space bold" style="font-size: 15px; margin-top: 5px;"><span>TOTAL A PAGAR:</span><span>S/ ${totalFinal.toFixed(2)}</span></div>
                            <div class="separator"></div>
                            <p class="center" style="font-size: 11px; font-style: italic;">Representación impresa de la ${docType}.<br>¡Gracias por tu preferencia!</p>
                            <button class="btn-print" onclick="window.print()">IMPRIMIR COMPROBANTE</button>
                        </div>
                    </body>
                    </html>
                `);
                receiptWindow.document.close();
            }

            // Limpiar carrito
            cartArray = [];
            syncCartView();
            mainOrderForm.reset();
            if (rucGroup) rucGroup.style.display = "none";
            cartAside?.classList.remove("mobile-open");

            // Mostrar modal de reseña
            setTimeout(() => {
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