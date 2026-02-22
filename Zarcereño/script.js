import { database } from "./firebase-config.js";
import { ref, onChildAdded, remove, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Contador para colores secuenciales
let contadorPedidos = 0;

// Bloquear el botón de retroceso
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

function iniciarEscuchaPedidos() {
    const pedidosRef = ref(database, 'pedidos');
    
    onChildAdded(pedidosRef, (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        
        if (pedido && pedido.items) {
            crearTablaPedido(pedido, pedidoId);
        }
    });

    onChildRemoved(pedidosRef, (snapshot) => {
        const pedidoId = snapshot.key;
        const elementoPedido = document.querySelector(`.nuevoPedido[data-id="${pedidoId}"]`);
        if (elementoPedido) {
            elementoPedido.remove();
        }
    });
}

function crearTablaPedido(pedido, id) {
    let colores = ['rgb(111, 194, 111)', 'rgb(255, 255, 153)', 'rgb(153, 204, 255)'];
    const contenedor = document.getElementById('contenedorPedidos');
    const hora = pedido.fecha
            ? new Date(pedido.fecha).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
            : '';
    // Crear contenedor para este pedido
    const divPedido = document.createElement('div');
    divPedido.className = 'nuevoPedido';
    divPedido.dataset.id = id;
    const colorAleatorio = colores[contadorPedidos % colores.length];
    contadorPedidos++;

    // Encabezado del pedido
    let htmlContent = `
        <div class="pedido-header">
            <h2>${pedido.cliente || ''} - ${hora}</h2>
            <h3 style="color: red;">${pedido.tipo || ''}</h3>
        </div>
        <table class="tablaPedido" border="1">
            <thead class="tablaEncabezado" id="tablaEncabezado" style="background-color: ${colorAleatorio};">
                <tr>
                    <th>Cantidad</th>
                    <th>Bebida</th>
                    <th>Leche</th>
                    <th>Saborizante</th>
                </tr>
            </thead>
            <tbody>
    `;


    // Filas de productos
    pedido.items.forEach(item => {

        htmlContent += `
            <tr>
                <td>${item.cantidad || 1}</td>
                <td>${item.bebida || '-'}</td>
                <td>${item.leche || '-'}</td>
                <td>${item.saborizante || '-'}</td>
            </tr>
        `;
    });

    htmlContent += `
            </tbody>
        </table>
        <p class="notaPedido">${pedido.nota || ''}</p>
        <button class="btnListo" onclick="completarPedido(this)">
            Listoo!
        </button>
    `;

    divPedido.innerHTML = htmlContent;
    
    // Insertar al final tipo fila india
    contenedor.appendChild(divPedido);
}

window.completarPedido = function(boton) {
    const contenedorPedido = boton.closest('.nuevoPedido');
    const pedidoId = contenedorPedido.dataset.id;

    const pedidoRef = ref(database, 'pedidos/' + pedidoId);
    remove(pedidoRef)
}

// Cargar al inicio
document.addEventListener('DOMContentLoaded', iniciarEscuchaPedidos);

