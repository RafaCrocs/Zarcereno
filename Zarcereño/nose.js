import { database } from "./firebase-config.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


// Bebidas que NO necesitan selección de leche
const bebidasSinLeche = [
    'Granizado', 'Jugo Verde', 'Refresher', 'MilkShake',
    'Americano Pequeño', 'Americano Grande', 'Espresso', 'Espresso Doble', 'Affogato', 'Cold Brew', 'Iced Americano', 'Ensalada de Frutas', 'Banana Split', 'Crepa', 'Sundae', 'Limonada Regular', 'Limonada de Fresa'
];

// Bebidas que NO necesitan saborizante (se agregan directo al carrito)
const bebidasSinSaborizante = [
    'Taro', 'Americano Pequeño', 'Americano Grande', 'Espresso', 'Espresso Doble', 'Matcha', 'Cortado',
    'Macchiato', 'Affogato', 'Mokaccino Pequeño', 'Mokaccino Grande', 'Cold Brew',
    'Flat White', 'Chocolate Caliente Pequeño', 'Chocolate Caliente Grande', 'Iced Americano Pequeño', 'Iced Americano Grande', 'Ensalada de Frutas', 'Banana Split', 'Crepa', 'Sundae', 'Limonada Regular', 'Limonada de Fresa'
];

// Bebidas con flujo propio (tienen sus propias ventanas, no usan la de saborizantes)
const bebidasConFlujoPropio = [
    'Jugo Verde', 'Refresher', 'Granizado', 'MilkShake', 'Iced Chocolate', 'Ensalada de Frutas', 'Banana Split', 'Crepa', 'Sundae'
];

// Bebidas que necesitan selección de tamaño
const bebidasConTamaño = [
    'Americano', 'Cappuchino', 'Mokaccino', 'Latte', 'Chocolate Caliente', 'Iced Americano'
];


function incluyeAlguna(nombreBebida, lista) {
    debugger
    return lista.some(nombre => nombreBebida === nombre);
}

// ────────────────────────────────────────────────────────────

//PRODUCTOS NO DISPONIBLES POR HELADERIA
const productosNoDisponibles = {
    'SanRamon': [
        'btnBatidoLeche',
        'btnBatidoAgua',
        'btnCrepa',
        'btnLatteOrotina',
        'btnSundae',
        'btnLimonadaRegular',
        'btnLimonadaFresa'
    ],
    'Orotina': [
        'btnLatte',
        'btnNuez',
        ''
    ], 
    'Liberia': [
        '',
    ],
};

function aplicarFiltrosSucursal() {

    const urlParams = new URLSearchParams(window.location.search);
    const sucursal = urlParams.get('sucursal') || 'SanRamon'; // Por defecto SanRamon

    const listaOcultar = productosNoDisponibles[sucursal];

    if (listaOcultar && listaOcultar.length > 0) {
        listaOcultar.forEach(idBoton => {
            const boton = document.getElementById(idBoton);
            if (boton) {
                const contenedor = boton.closest('.caja');
                if (contenedor) {
                    contenedor.style.display = 'none';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', aplicarFiltrosSucursal);

function mostrarVentana() {
    crearTabla();
    const ventana = document.getElementById('dialog_ventanaConfirmacion');
    ventana.style.display = 'flex';
    ventana.showModal();
}

function cerrarVentana(dialogId) {
    const dialog = document.getElementById(dialogId);
    const lechesDialog = document.getElementById('dialog_ventanaLeches');
    const bubblesDialog = document.getElementById('dialog_ventanaBubbles');
    const saborizantesDialog = document.getElementById('dialog_ventanaSaborizantes');
    const heladosDialog = document.getElementById('dialog_ventanaHelados');
    
    if (dialog) {
        dialog.style.display = 'none';
        lechesDialog.style.display = 'none';
        bubblesDialog.style.display = 'none';
        saborizantesDialog.style.display = 'none';
        heladosDialog.style.display = 'none';
        bubblesDialog.close();
        lechesDialog.close();
        saborizantesDialog.close();
        heladosDialog.close();
        dialog.close();
    }
}

function confirmarEnvio() {
    const btn = document.getElementById('btnconfirmarEnvio');
    if (btn) {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.innerText = 'Enviando...';
    }

    // Obtener sucursal y origen de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const sucursal = urlParams.get('sucursal') || 'SanRamon'; // Por defecto SanRamon
    const origen = urlParams.get('origen') || ''; // Por defecto nada

    const nombreCliente = document.getElementById('nombreCliente').value || "";
    const inputNota = document.getElementById('notaPedido');
    const notaPedido = inputNota ? inputNota.value : "";

    const tipoPedidoElement = document.querySelector('input[name="tipoPedido"]:checked');
    const tipoPedido = tipoPedidoElement ? tipoPedidoElement.value : "";
    
    // Si el carrito está vacío, no enviar nada
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        if (btn) {
            btn.disabled = false;
            btn.innerText = 'Confirmar';
        }
        return;
    }

    const pedidosRef = ref(database, 'pedidos');
    const nuevoPedidoRef = push(pedidosRef);
    numeroPedido ++;
    
    set(nuevoPedidoRef, {
        cliente: nombreCliente,
        nota: notaPedido,
        sucursal: sucursal,
        origen: origen,
        tipo: tipoPedido,
        items: carrito,
        fecha: new Date().toISOString(),
        numeroPedido: numeroPedido
    })
    .then(() => {
        historial.push({
            cliente: nombreCliente,
            nota: notaPedido,
            sucursal: sucursal,
            origen: origen,
            tipo: tipoPedido,
            items: carrito,
            fecha: new Date().toISOString()
        });
        limpiarCarrito();
        document.getElementById('nombreCliente').value = '';
        document.getElementById('notaPedido').value = '';
        if (inputNota) inputNota.value = '';
        if(tipoPedidoElement) tipoPedidoElement.checked = false;
        cerrarVentana('dialog_ventanaConfirmacion');
    })
    .catch((error) => {
        console.error("Error al enviar pedido:", error);
        alert("Hubo un error al enviar el pedido. Intenta nuevamente.");
    })
    .finally(() => {
        if (btn) {
            btn.disabled = false;
            btn.innerText = 'Confirmar';
        }
    });
}

function limpiarCarrito() {
    carrito = [];
    Indice = 0;
    const tabla = document.getElementById('listaEnTabla');
    if (tabla) {
        tabla.innerHTML = '';
    }
}

//Logica para agregar productos al carrito

// Bloquear el botón de retroceso
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

let carrito = [];
let historial = [];
let bebida;
let leche;
let saborizante;
let numeroPedido = 0;
const tiemposTextoAgregar = new WeakMap();

function mostrarAgregadoTemporalmente(botonPulsado) {
    if (!botonPulsado) {
        return;
    }

    const textoOriginal = botonPulsado.dataset.textoOriginal || botonPulsado.innerText;
    botonPulsado.dataset.textoOriginal = textoOriginal;
    botonPulsado.innerText = 'AGREGADO';
    botonPulsado.style.backgroundColor = 'rgb(77, 136, 77)';

    const tiempoAnterior = tiemposTextoAgregar.get(botonPulsado);
    if (tiempoAnterior) {
        clearTimeout(tiempoAnterior);
    }

    const nuevoTiempo = setTimeout(() => {
        botonPulsado.innerText = botonPulsado.dataset.textoOriginal || 'AGREGAR';
        botonPulsado.style.backgroundColor = 'rgb(121, 184, 121)';
        tiemposTextoAgregar.delete(botonPulsado);
    }, 2000);

    tiemposTextoAgregar.set(botonPulsado, nuevoTiempo);
}

function agregar(botonPulsado) {
    mostrarAgregadoTemporalmente(botonPulsado);
    bebida = botonPulsado.value;
    if (incluyeAlguna(bebida, bebidasConTamaño)) {
        abrirTamaños();
    } else {
        abrirLeches();
    }
}

function abrirTamaños() {
    const ventanaTamaño = document.getElementById('dialog_ventanaTamaños');
    ventanaTamaño.style.display = 'block';
    ventanaTamaño.showModal();
}

function elegirTamaño(botonPulsado) {
    bebida += ' ' + botonPulsado.value;
    const ventanaTamaño = document.getElementById('dialog_ventanaTamaños');
    ventanaTamaño.style.display = 'none';
    ventanaTamaño.close();
    abrirLeches();
}


function abrirLeches() {
    if (incluyeAlguna(bebida, bebidasSinLeche)) {
        abrirSaborizantes();
        return;
    }
    const leches = document.getElementById('dialog_ventanaLeches');
    leches.style.display = 'block';
    leches.showModal();
}

function agregarLeche(botonPulsado) {
    leche = botonPulsado.value;
    
    const ventanaLeches = document.getElementById('dialog_ventanaLeches');
    ventanaLeches.style.display = 'none';
    ventanaLeches.close();
    abrirSaborizantes();
    }


function abrirSaborizantes() {
    if (incluyeAlguna(bebida, bebidasConFlujoPropio)) return;

    if (bebida.includes(',') || incluyeAlguna(bebida, bebidasSinSaborizante)) {
        agregarCarrito();
        return;
    }

    const saborizantes = document.getElementById('dialog_ventanaSaborizantes');
    saborizantes.style.display = 'block';
    saborizantes.showModal();
}

function agregarSaborizante(botonPulsado) {
    saborizante = botonPulsado.value;
    const ventanaSaborizantes = document.getElementById('dialog_ventanaSaborizantes');
    ventanaSaborizantes.style.display = 'none';
    ventanaSaborizantes.close();
    
    agregarCarrito();
}

function abrirHelados() {
    const helados = document.getElementById('dialog_ventanaHelados');
    helados.style.display = 'block';
    helados.showModal();
}

function agregarHelado(botonPulsado) {
    bebida += ' ' + botonPulsado.value;
    const ventanaHelados = document.getElementById('dialog_ventanaHelados');
    ventanaHelados.style.display = 'none';
    ventanaHelados.close();
    if(!bebida.includes('Sundae')) agregarCarrito();
}

function abrirVentanaRefresher() {
    const ventanaRefresher = document.getElementById('dialog_ventanaRefresher');
    ventanaRefresher.style.display = 'block';
    ventanaRefresher.showModal();
}


function agregarRefresher(botonPulsado) {
    bebida += ' ' + botonPulsado.value;
    const ventanaRefresher = document.getElementById('dialog_ventanaRefresher');
    ventanaRefresher.style.display = 'none';
    ventanaRefresher.close();
}

function abrirVentanaSaborizantesNaturales() {
    const ventanaSaborizantesNaturales = document.getElementById('dialog_ventanaSaborizantesNaturales');
    ventanaSaborizantesNaturales.style.display = 'block';
    ventanaSaborizantesNaturales.showModal();
}

function agregarSaborizanteNatural(botonPulsado) {
    saborizante = botonPulsado.value;
    const ventanaSaborizantesNaturales = document.getElementById('dialog_ventanaSaborizantesNaturales');
    ventanaSaborizantesNaturales.style.display = 'none';
    ventanaSaborizantesNaturales.close();
    agregarCarrito();
}

function abrirVentanaBubbles() {
    const ventanaBubbles = document.getElementById('dialog_ventanaBubbles');
    ventanaBubbles.style.display = 'block';
    ventanaBubbles.showModal();
}

function agregarBubbles(botonPulsado) {
    saborizante = botonPulsado.value;
    const ventanaBubbles = document.getElementById('dialog_ventanaBubbles');
    ventanaBubbles.style.display = 'none';
    ventanaBubbles.close();
    agregarCarrito();
}

function abrirVentanaOpcionesJugoVerde() {
    const ventanaOpcionesJugoVerde = document.getElementById('dialog_ventanaOpcionesJugoVerde');
    ventanaOpcionesJugoVerde.style.display = 'block';
    ventanaOpcionesJugoVerde.showModal();
}

function agregarOpcionesJugoVerde(botonPulsado) {
    bebida += ' ' + botonPulsado.value;
    const ventanaOpcionesJugoVerde = document.getElementById('dialog_ventanaOpcionesJugoVerde');
    ventanaOpcionesJugoVerde.style.display = 'none';
    ventanaOpcionesJugoVerde.close();
}

function agregarCarrito() {
    let producto = {
        cantidad: 1,
        bebida: bebida,
        leche: leche || '',
        saborizante: saborizante || '',
        nota: ''
    };
    carrito.push(producto);
    bebida = undefined;
    leche = undefined;
    saborizante = undefined;
}

function agregarBatido() {
    let batido = [];
    const checkboxes = document.querySelectorAll('.checkbox-batido');
    checkboxes.forEach(function(checkbox) {
    if (checkbox.checked) {
        const producto = checkbox.value;
        batido.push(producto);
    }
    });
    bebida = batido.join(', ');
    checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    });
    abrirLeches();
}

function abrirVentanaNumerosBatidosLeche() {
    const ventana = document.getElementById('dialog_ventanaNumerosBatidosLeche');
    ventana.style.display = 'block';
    ventana.showModal();
}

function abrirVentanaNumerosBatidosAgua() {
    const ventana = document.getElementById('dialog_ventanaNumerosBatidosAgua');
    ventana.style.display = 'block';
    ventana.showModal();
}

function agregarNumeroBatidoLeche(botonPulsado) {
    bebida = `Batido en Leche ${botonPulsado.value}`;
    const ventana = document.getElementById('dialog_ventanaNumerosBatidosLeche');
    ventana.style.display = 'none';
    ventana.close();
    agregarCarrito();
}

function agregarNumeroBatidoAgua(botonPulsado) {
    bebida = `Batido en Agua ${botonPulsado.value}`;
    const ventana = document.getElementById('dialog_ventanaNumerosBatidosAgua');
    ventana.style.display = 'none';
    ventana.close();
    agregarCarrito();
}

function abrirVentanaNumerosCrepa() {
    const ventana = document.getElementById('dialog_ventanaNumerosCrepa');
    ventana.style.display = 'block';
    ventana.showModal();
}

function agregarNumeroCrepa(botonPulsado) {
    bebida = `Crepa ${botonPulsado.value}`;
    const ventana = document.getElementById('dialog_ventanaNumerosCrepa');
    ventana.style.display = 'none';
    ventana.close();
}

function abrirVentanaSiropes() {
    const ventana = document.getElementById('dialog_ventanaSiropes');
    ventana.style.display = 'block';
    ventana.showModal();
}

function agregarSiropes(botonPulsado) {
    saborizante = botonPulsado.value;
    const ventana = document.getElementById('dialog_ventanaSiropes');
    ventana.style.display = 'none';
    ventana.close();
    agregarCarrito();
}

let Indice = 0;

function crearTabla() {
    let htmlTabla = "";
    for (let i = Indice; i < carrito.length; i++) {
        htmlTabla += `
            <tr data-indice="${i}">
                <td><button onclick="agregarCantidadDesdeBoton(this)" id="btnAgregar">+</button></td>
                <td><button onclick="restarCantidadDesdeBoton(this)"  id="btnRestar">-</button></td>
                <td>${carrito[i].cantidad}</td>
                <td>${carrito[i].bebida}</td>
                <td>${carrito[i].leche}</td>
                <td>${carrito[i].saborizante}</td>
                <td><input type="text" placeholder="Nota (opcional)" class="inputNota" value="${carrito[i].nota || ''}" onchange="actualizarNotaDesdeInput(this)"></td>
                <td><button onclick="eliminarProducto(${i})" id="btnEliminar">Eliminar</button></td>
            </tr>`;}
        Indice = carrito.length;
        console.log(carrito);
    
    document.getElementById('listaEnTabla').insertAdjacentHTML('beforeend', htmlTabla);
    
}

function eliminarProducto(indice) {
    carrito.splice(indice, 1);
    Indice = 0;
    const tabla = document.getElementById('listaEnTabla');
    if (tabla) {
        tabla.innerHTML = '';
    }
    crearTabla();
}

function agregarCantidad(producto) {
    producto.cantidad += 1;
    Indice = 0;
    const tabla = document.getElementById('listaEnTabla');
    if (tabla) {
        tabla.innerHTML = '';
    }
    crearTabla();
}

function restarCantidad(producto) {
    producto.cantidad -= 1;
    if (producto.cantidad <= 0) {
        const indice = carrito.indexOf(producto);
        if (indice !== -1) {
            carrito.splice(indice, 1);
        }
    }
    Indice = 0;
    const tabla = document.getElementById('listaEnTabla');
    if (tabla) {
        tabla.innerHTML = '';
    }
    crearTabla();
}

function agregarCantidadDesdeBoton(boton) {
    const fila = boton.closest('tr');
    if (!fila) {
        return;
    }

    const indice = Number(fila.dataset.indice);
    if (!Number.isInteger(indice) || !carrito[indice]) {
        return;
    }

    agregarCantidad(carrito[indice]);
}

function restarCantidadDesdeBoton(boton) {
    const fila = boton.closest('tr');
    if (!fila) {
        return;
    }

    const indice = Number(fila.dataset.indice);
    if (!Number.isInteger(indice) || !carrito[indice]) {
        return;
    }

    restarCantidad(carrito[indice]);
}

function actualizarNotaDesdeInput(input) {
    const fila = input.closest('tr');
    if (!fila) return;
    const indice = Number(fila.dataset.indice);
    if (!Number.isInteger(indice) || !carrito[indice]) return;
    carrito[indice].nota = input.value;
}

function mostrarHistorial() {
    const historial = document.getElementById('dialog_ventanaHistorial');
    historial.style.display = 'block';
    historial.showModal();
}

function crearTablaHistorial() {
    let htmlTabla = "";
    const ultimos10 = historial.slice(-10).reverse();

    ultimos10.forEach((pedido) => {
        const hora = pedido.fecha
            ? new Date(pedido.fecha).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
            : '';
        htmlTabla += `
            <tr>
                <td>${pedido.cliente}</td>
                <td>${pedido.items.map(item => item.bebida).join(', ')}</td>
                <td>${pedido.nota}</td>
                <td>${pedido.tipo}</td>
                <td>${hora}</td>
            </tr>`;
    });
    document.getElementById('listaHistorial').innerHTML = htmlTabla;
}


window.mostrarVentana = mostrarVentana;
window.agregar = agregar;
window.abrirTamaños = abrirTamaños;
window.cerrarVentana = cerrarVentana;
window.confirmarEnvio = confirmarEnvio;
window.elegirTamaño = elegirTamaño;
window.abrirLeches = abrirLeches;
window.agregarLeche = agregarLeche;
window.abrirSaborizantes = abrirSaborizantes;
window.agregarSaborizante = agregarSaborizante;
window.abrirHelados = abrirHelados;
window.agregarHelado = agregarHelado;
window.agregarCarrito = agregarCarrito;
window.agregarBatido = agregarBatido;
window.abrirVentanaNumerosBatidosLeche = abrirVentanaNumerosBatidosLeche;
window.abrirVentanaNumerosBatidosAgua = abrirVentanaNumerosBatidosAgua;
window.agregarNumeroBatidoLeche = agregarNumeroBatidoLeche;
window.agregarNumeroBatidoAgua = agregarNumeroBatidoAgua;
window.abrirVentanaNumerosCrepa = abrirVentanaNumerosCrepa;
window.agregarNumeroCrepa = agregarNumeroCrepa;
window.eliminarProducto = eliminarProducto;
window.crearTabla = crearTabla;
window.limpiarCarrito = limpiarCarrito;
window.abrirVentanaRefresher = abrirVentanaRefresher;
window.agregarRefresher = agregarRefresher;
window.abrirVentanaSaborizantesNaturales = abrirVentanaSaborizantesNaturales;
window.agregarSaborizanteNatural = agregarSaborizanteNatural;
window.mostrarHistorial = mostrarHistorial;
window.crearTablaHistorial = crearTablaHistorial;
window.agregarCantidad = agregarCantidad;
window.agregarCantidadDesdeBoton = agregarCantidadDesdeBoton;
window.restarCantidad = restarCantidad;
window.restarCantidadDesdeBoton = restarCantidadDesdeBoton;
window.actualizarNotaDesdeInput = actualizarNotaDesdeInput;
window.abrirVentanaBubbles = abrirVentanaBubbles;
window.agregarBubbles = agregarBubbles;
window.abrirVentanaOpcionesJugoVerde = abrirVentanaOpcionesJugoVerde;
window.agregarOpcionesJugoVerde = agregarOpcionesJugoVerde;
window.abrirVentanaSiropes = abrirVentanaSiropes;
window.agregarSiropes = agregarSiropes;