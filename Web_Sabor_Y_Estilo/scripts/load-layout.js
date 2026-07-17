document.addEventListener("DOMContentLoaded", () => {
    // 1. CARGA DINÁMICA DEL NAV (AHORA EN /src/nav.html)
    fetch('/src/nav.html') 
        .then(response => response.text())
        .then(html => {
            const navContainer = document.getElementById('global-nav');
            if (navContainer) {
                navContainer.innerHTML = html;
                inicializarNavToggle();
                marcarPaginaActiva();
                inicializarSesionUI();
                inicializarUserDropdown();
            }
        })
        .catch(error => console.error("Error cargando el menú:", error));

    // 2. CARGA DINÁMICA DEL FOOTER (AHORA EN /src/footer.html)
    fetch('/src/footer.html')
        .then(response => response.text())
        .then(html => {
            const footerContainer = document.getElementById('global-footer');
            if (footerContainer) {
                footerContainer.innerHTML = html;
            }
        })
        .catch(error => console.error("Error cargando el pie de página:", error));
});

/**
 * Activa los listeners para el menú hamburguesa móvil
 */
function inicializarNavToggle() {
    const toggleBtn = document.getElementById('nav-btn-toggle');
    const menuList = document.getElementById('nav-menu-list');

    if (toggleBtn && menuList) {
        toggleBtn.addEventListener('click', () => {
            toggleBtn.classList.toggle('active');
            menuList.classList.toggle('open');
        });

        const navLinks = menuList.querySelectorAll('.nav-link:not(.nav-user-btn)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleBtn.classList.remove('active');
                menuList.classList.remove('open');
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuList.classList.contains('open')) {
                toggleBtn.classList.remove('active');
                menuList.classList.remove('open');
            }
        });
    }
}

/**
 * Marca la página activa en el menú
 */
function marcarPaginaActiva() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');

        if (linkHref && (currentPath.endsWith(linkHref) || 
           (linkHref.includes('index.html') && (currentPath === '/' || currentPath.endsWith('index.html'))))) {
            link.classList.add('active');
        }
    });
}

function inicializarSesionUI() {
    const userDisplay = document.getElementById('user-display-name');
    const userBtn = document.getElementById('nav-user-btn');
    const dropdownProfile = document.getElementById('dropdown-profile');
    const dropdownLogout = document.getElementById('dropdown-logout');

    const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');

    const estaLogueado = userData?.nombre;

    if (estaLogueado) {
        if (userDisplay) userDisplay.textContent = userData.nombre.split(' ')[0];
        if (userBtn) userBtn.classList.add('logged-in');
        if (dropdownProfile) {
            dropdownProfile.textContent = `👤 ${userData.nombre}`;
            dropdownProfile.href = '#';
        }
    } else {
        if (userDisplay) userDisplay.textContent = 'Cuenta';
        if (userBtn) userBtn.classList.remove('logged-in');
        if (dropdownProfile) {
            dropdownProfile.textContent = '👤 Iniciar Sesión';
            dropdownProfile.href = '/src/modulo_auth/registrarse.html';
        }
    }

    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }
}
/**
 * CIERRA LA SESIÓN DEL USUARIO
 */
function cerrarSesion() {
    localStorage.removeItem('sabor_estilo_user');
    
    const userDisplay = document.getElementById('user-display-name');
    const userBtn = document.getElementById('nav-user-btn');
    const dropdownProfile = document.getElementById('dropdown-profile');

    if (userDisplay) userDisplay.textContent = 'Cuenta';
    if (userBtn) userBtn.classList.remove('logged-in');
    if (dropdownProfile) {
        dropdownProfile.textContent = '👤 Iniciar Sesión';
        dropdownProfile.href = '/src/modulo_auth/registrarse.html';
    }

    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.remove('open');

    if (typeof launchToast === 'function') {
        launchToast('Sesión cerrada correctamente');
    } else {
        alert('Sesión cerrada correctamente');
    }

    // Rutas protegidas
    const protectedPaths = ['/src/modulo_pedidos/', '/src/modulo_reservas/'];
    const currentPath = window.location.pathname;
    if (protectedPaths.some(p => currentPath.includes(p))) {
        window.location.href = '/index.html';
    }
}

/**
 * INICIALIZA EL MENÚ DESPLEGABLE DEL USUARIO
 */
function inicializarUserDropdown() {
    const userBtn = document.getElementById('nav-user-btn');
    const dropdown = document.getElementById('user-dropdown');

    if (userBtn && dropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') dropdown.classList.remove('open');
        });
    }
}

/**
 * VERIFICA SI EL USUARIO ESTÁ LOGUEADO
 */
function isUserLoggedIn() {
    const userData = JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
    return userData !== null && userData.nombre;
}

/**
 * OBTIENE LOS DATOS DEL USUARIO ACTUAL
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('sabor_estilo_user') || 'null');
}

/**
 * SOLICITA LOGIN PARA ACCIONES PROTEGIDAS
 */
function requireLogin() {
    if (!isUserLoggedIn()) {
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