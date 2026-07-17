// ============================================================ //
// MÓDULO: MIS PEDIDOS - Sabor y Estilo
// ============================================================ //

console.log('[Mis Pedidos] Inicializando...');

function cargarPedidos() {
    return JSON.parse(localStorage.getItem('sabor_estilo_pedidos') || '[]');
}

function getCurrentUserPedidos() {
    const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
    if (!userData) return [];
    const todos = cargarPedidos();
    return todos.filter(p => p.email === userData.email);
}

function renderizarPedidos() {
    const container = document.getElementById('pedidos-list');
    if (!container) return;

    const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');

    if (!userData) {
        container.innerHTML = `
            <div class="pedido-vacia">
                <p style="font-size: 2rem; margin-bottom: 15px;">🔒</p>
                <p style="font-size: 1.2rem; color: var(--text-gray);">Inicia sesión para ver tus pedidos</p>
                <a href="/src/modulo_auth/registrarse.html" class="btn-order" style="margin-top: 20px; display: inline-block;">Iniciar Sesión</a>
            </div>
        `;
        return;
    }

    const pedidos = getCurrentUserPedidos();

    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="pedido-vacia">
                <p style="font-size: 2rem; margin-bottom: 15px;">📦</p>
                <p style="font-size: 1.2rem; color: var(--text-gray);">No tienes pedidos aún</p>
                <p style="color: var(--text-gray); font-size: 0.9rem;">¡Explora nuestra carta!</p>
                <a href="/src/modulo_menu/carta.html" class="btn-order" style="margin-top: 20px; display: inline-block;">Ver Carta</a>
            </div>
        `;
        return;
    }

    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let html = '<div class="pedidos-grid">';

    pedidos.forEach((pedido, index) => {
        const fecha = new Date(pedido.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const total = pedido.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const descuento = pedido.descuento || 0;
        const totalFinal = total - (total * descuento);

        html += `
            <div class="pedido-card login-card">
                <div class="pedido-header">
                    <span class="pedido-id">#${String(index + 1).padStart(4, '0')}</span>
                    <span class="pedido-fecha">${fechaFormateada}</span>
                    <span class="pedido-estado ${pedido.estado || 'completado'}">${(pedido.estado || 'Completado').toUpperCase()}</span>
                </div>
                <div class="pedido-body">
                    <div class="pedido-items">
                        ${pedido.items.map(item => `
                            <div class="pedido-item">
                                <span class="item-cantidad">${item.qty}×</span>
                                <span class="item-nombre">${item.name}</span>
                                <span class="item-precio">S/ ${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${pedido.direccion ? `<p class="pedido-direccion"><strong>📍 Entrega:</strong> ${pedido.direccion}</p>` : ''}
                    ${pedido.tipoEntrega ? `<p class="pedido-tipo"><strong>📦 Tipo:</strong> ${pedido.tipoEntrega === 'delivery' ? 'Delivery' : 'Recojo en Tienda'}</p>` : ''}
                </div>
                <div class="pedido-footer">
                    ${descuento > 0 ? `<span class="pedido-descuento">Descuento: -${(descuento * 100)}%</span>` : ''}
                    <span class="pedido-total"><strong>Total:</strong> S/ ${totalFinal.toFixed(2)}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    renderizarPedidos();

    window.addEventListener('storage', function(e) {
        if (e.key === 'sabor_estilo_user' || e.key === 'sabor_estilo_pedidos') {
            renderizarPedidos();
        }
    });
});