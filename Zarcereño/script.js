import { database } from "./firebase-config.js";
import { ref, onChildAdded, remove, onChildRemoved, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Contador para colores secuenciales
let contadorPedidos = 0;
const pedidosMostrados = new Set();
const audioNotificacion = new Audio('../Notificacion.mp3');
audioNotificacion.preload = 'auto';
let audioHabilitado = false;


const urlParams = new URLSearchParams(window.location.search);
const sucursalUrl = urlParams.get('sucursal');

if (sucursalUrl) {
    localStorage.setItem('sucursal_config', sucursalUrl);
}

const sucursalActual = localStorage.getItem('sucursal_config') || 'SanRamon';

// Actualizar el título para mostrar la sucursal actual
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    if (header) {
        header.innerText = `Pedidos Recibidos - ${sucursalActual}`;
    }
});

function habilitarAudioNotificaciones() {
    if (audioHabilitado) return;

    audioNotificacion.muted = true;
    const reproduccion = audioNotificacion.play();

    if (reproduccion) {
        reproduccion.then(() => {
            audioNotificacion.pause();
            audioNotificacion.currentTime = 0;
            audioNotificacion.muted = false;
            audioHabilitado = true;
        }).catch(() => {
            audioNotificacion.muted = false;
        });
    }
}

function reproducirNotificacion() {
    audioNotificacion.currentTime = 0;
    const reproduccion = audioNotificacion.play();
    if (reproduccion) {
        reproduccion.catch(() => {});
    }
}

function obtenerClaveDiaLocal() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

// Bloquear el botón de retroceso
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

async function iniciarEscuchaPedidos() {
    const pedidosRef = ref(database, 'pedidos');

    const snapshotInicial = await get(pedidosRef);
    snapshotInicial.forEach((snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;

        // Filtrar automáticamente por sucursal
        const pedidoSucursal = pedido.sucursal || 'SanRamon'; // Compatibilidad
        if (pedidoSucursal !== sucursalActual) return;

        if (pedido && pedido.items && !pedidosMostrados.has(pedidoId)) {
            pedidosMostrados.add(pedidoId);
            crearTablaPedido(pedido, pedidoId);
        }
    });
    
    onChildAdded(pedidosRef, (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        
        // Filtrar automáticamente por sucursal
        const pedidoSucursal = pedido.sucursal || 'SanRamon'; // Compatibilidad

        if (pedidoSucursal !== sucursalActual) {
            return;
        }
        
        if (pedido && pedido.items && !pedidosMostrados.has(pedidoId)) {
            pedidosMostrados.add(pedidoId);
            crearTablaPedido(pedido, pedidoId);
            reproducirNotificacion();
        }
    });

    onChildRemoved(pedidosRef, (snapshot) => {
        const pedidoId = snapshot.key;
        pedidosMostrados.delete(pedidoId);
        const elementoPedido = document.querySelector(`.nuevoPedido[data-id="${pedidoId}"]`);
        if (elementoPedido) {
            elementoPedido.remove();
        }
    });
}

function crearTablaPedido(pedido, id) {
    let colores = ['rgb(111, 194, 111)', 'rgb(255, 255, 153)', 'rgb(153, 204, 255)'];
    const contenedor = document.getElementById('contenedorPedidos');

    // Crear contenedor para este pedido
    const divPedido = document.createElement('div');
    divPedido.className = 'nuevoPedido';
    divPedido.dataset.id = id;
    const colorAleatorio = colores[contadorPedidos % colores.length];
    contadorPedidos++;

    // Encabezado del pedido
    const origenColor = '#2980b9';
    let htmlContent = `
        <div class="pedido-header">
            <h2>${pedido.cliente || ''} - Pedido #${contadorPedidos}</h2>
            <h3 style="color: red;">${pedido.tipo || ''}</h3>
            <h3 style="color: ${origenColor}; font-size: 1.3em;"> ${pedido.origen ? '---- ' + pedido.origen + ' ----' : ''} </h3>
        </div>
        <table class="tablaPedido" border="1">
            <thead class="tablaEncabezado" id="tablaEncabezado" style="background-color: ${colorAleatorio};">
                <tr>
                    <th>Cantidad</th>
                    <th>Bebida</th>
                    <th>Leche</th>
                    <th>Saborizante</th>
                    <th>Nota</th>
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
                <td>${item.nota || '-'}</td>
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

window.completarPedido = async function(boton) {
    const contenedorPedido = boton.closest('.nuevoPedido');
    const pedidoId = contenedorPedido.dataset.id;
    const pedidoRef = ref(database, 'pedidos/' + pedidoId);
    const snapshot = await get(pedidoRef);
    if (snapshot.exists()) {
        const pedidoData = snapshot.val();
        const numeroProductosVendidos = Array.isArray(pedidoData.items)
            ? pedidoData.items.reduce((total, item) => {
                const cantidad = Number(item?.cantidad);
                return total + (Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1);
            }, 0)
            : 0;

        pedidoData.completadoEn = new Date().toISOString();
        pedidoData.numeroProductosVendidos = numeroProductosVendidos;

        const diaClave = obtenerClaveDiaLocal();
        const acumuladoPath = `estadisticas_ventas/${sucursalActual}/${diaClave}`;
        const acumuladoRef = ref(database, acumuladoPath);

        await runTransaction(acumuladoRef, (actual) => {
            const estadoActual = actual || {};
            return {
                productosVendidos: (Number(estadoActual.productosVendidos) || 0) + numeroProductosVendidos,
                pedidosCompletados: (Number(estadoActual.pedidosCompletados) || 0) + 1,
                ultimaActualizacion: new Date().toISOString()
            };
        });

        if(sucursalActual === 'SanRamon') {
            const completadoRef = ref(database, 'pedidos_completados_SanRamon/' + pedidoId);
            await set(completadoRef, pedidoData);
        } else if(sucursalActual === 'Orotina') {
            const completadoRef = ref(database, 'pedidos_completados_Orotina/' + pedidoId);
            await set(completadoRef, pedidoData);
        }
        else {
            const completadoRef = ref(database, 'pedidos_completados_NoseDonde/' + pedidoId);
            await set(completadoRef, pedidoData);
        }
    }
    remove(pedidoRef);
}

// Cargar al inicio
document.addEventListener('DOMContentLoaded', iniciarEscuchaPedidos);
document.addEventListener('click', habilitarAudioNotificaciones, { passive: true });
document.addEventListener('keydown', habilitarAudioNotificaciones);
document.addEventListener('touchstart', habilitarAudioNotificaciones, { passive: true });

