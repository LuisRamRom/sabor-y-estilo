# SABOR Y ESTILO

Plataforma web integral para la gestión de pedidos, reservas y experiencia del cliente en el restaurante "Sabor y Estilo".

---

## DESCRIPCIÓN DEL PROYECTO

**Sabor y Estilo** es una plataforma digital desarrollada para optimizar la experiencia gastronómica, permitiendo a los clientes realizar pedidos en línea, reservar mesas, dejar reseñas y gestionar su historial de compras desde un solo lugar.

### Objetivo

Desarrollar una plataforma web funcional y responsiva que integre:

- Sistema de pedidos en línea con carrito de compras
- Gestión de reservas con validación de disponibilidad
- Autenticación de usuarios con historial de compras
- Sistema de reseñas y sugerencias
- Interfaz atractiva y adaptativa

---

## TECNOLOGÍAS UTILIZADAS

| Tecnología                | Versión | Propósito                                |
| ------------------------- | ------- | ---------------------------------------- |
| **HTML5**                 | -       | Estructura semántica de las páginas      |
| **CSS3**                  | -       | Estilos visuales y diseño responsivo     |
| **JavaScript**            | ES6+    | Lógica de negocio y manipulación del DOM |
| **Google Fonts**          | -       | Tipografía "Poppins"                     |
| **Google Maps Embed API** | -       | Ubicación del restaurante                |
| **LocalStorage API**      | -       | Persistencia de datos en el navegador    |

---

## FUNCIONALIDADES PRINCIPALES

### Autenticación de Usuarios

- Registro de nuevos usuarios con validación de email
- Inicio de sesión con persistencia en localStorage
- Menú desplegable con acceso a:
  - Mi Perfil
  - Mis Pedidos
  - Mis Reservas
  - Cerrar Sesión

### Sistema de Pedidos

- Carta digital con imágenes y precios
- Carrito de compras con ajuste de cantidades
- Límite de 10 unidades por producto
- Cupón de descuento **PIZZA20** (20% de descuento)
- Personalización de pedidos (base + extras)
- Pasarela de pago simulada (Mercado Pago)
- Generación de ticket de compra estilo SUNAT
- Modal de calificación post-compra

### Sistema de Reservas

- Formulario completo con fecha, hora y número de sillas
- Validación de horario: 12:00 PM - 11:00 PM
- Verificación de disponibilidad (evita dobles reservas)
- Listado de reservas (activas y pasadas)
- Cancelación de reservas

### Sistema de Feedback

- Reseñas con calificación por estrellas (★ ★ ★ ★ ★)
- Sugerencias de nuevos platos
- Formulario de contacto con validación de email
- Mapa de ubicación (Google Maps)

### Galería

- Visualización de imágenes con Lightbox
- Interfaz responsiva
- Animaciones de entrada

---

## REQUISITOS DE INSTALACIÓN

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar fuentes y mapas)
