import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importamos el Router
// Revisa que la ruta del servicio sea correcta según el nombre de tu archivo
import { Supabase } from '../../services/supabase';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel.html',
  styleUrls: ['./panel.css']
})
export class Panel implements OnInit {
  private supabase = inject(Supabase);
  private router = inject(Router); // Activamos el Router


  clientes: any[] = [];
  cargando: boolean = true;
  textoBusqueda: string = '';
  cajaFiltro: string = '';
  viendoActivos: boolean = true; // Controla si vemos activos o inactivos

  async ngOnInit() {
    await this.cargarLista();
  }

  async cargarLista() {
    try {
      this.cargando = true;
      this.clientes = await this.supabase.obtenerClientes(this.viendoActivos);
    } catch (error) {
      console.error('Error al cargar la base de datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  // Esta es la función que hace funcionar el botón
  irANuevoCliente() {
    this.router.navigate(['/nuevo-cliente']);
  }
  async cambiarEstado(cliente: any) {
    // 1. Invertimos el valor actual (si es true, pasa a false)
    const nuevoEstado = !cliente.estado_al_dia;

    // 2. Lo cambiamos en la pantalla INSTANTÁNEAMENTE
    cliente.estado_al_dia = nuevoEstado;

    // 3. Le avisamos a la base de datos
    try {
      await this.supabase.actualizarEstadoPago(cliente.id, nuevoEstado);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      // Si falla el internet, lo revertimos
      cliente.estado_al_dia = !nuevoEstado;
    }
  }
  // Esto crea una lista desplegable solo con las cajas NAP que existen (sin repetirlas)
  get cajasNapUnicas() {
    const cajas = this.clientes.map(c => c.caja_nap).filter(c => c);
    return [...new Set(cajas)];
  }

  // Esto filtra la lista al instante según lo que escribas o selecciones
  get clientesFiltrados() {
    return this.clientes.filter(c => {
      const coincideNombre = c.nombre_apellido.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideCaja = this.cajaFiltro ? c.caja_nap === this.cajaFiltro : true;
      return coincideNombre && coincideCaja;
    });
  }
  async darDeBaja(cliente: any) {
    const confirmar = window.confirm(`Estás seguro de dar de baja a ${cliente.nombre_apellido}?`);
    if (confirmar) {
      try {
        await this.supabase.darDeBajaCliente(cliente.id);
        this.clientes = this.clientes.filter(c => c.id !== cliente.id);
      } catch (error) {
        console.error('Error al dar de baja', error);
        alert('Hubo un error al intentar dar de baja al cliente.');
      }
    }
  }
  async cerrarSesion() {
    try {
      await this.supabase.cerrarSesion();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  }
  editarCliente(cliente: any) {
    this.router.navigate(['/editar-cliente', cliente.id]);
  }
  alternarVista() {
    this.viendoActivos = !this.viendoActivos; // Cambia entre true y false
    this.cargarLista(); // Vuelve a buscar a la base de datos
  }

  async reactivarCliente(cliente: any) {
    if (confirm(`¿Reactivar el servicio de ${cliente.nombre_apellido}?`)) {
      try {
        await this.supabase.reactivarCliente(cliente.id);
        this.cargarLista(); // Recarga la lista para que desaparezca de inactivos
      } catch (error) {
        console.error('Error al reactivar:', error);
      }
    }
  }
  // Verifica si la fecha de hoy superó a la fecha de vencimiento
  estaEnDeuda(fecha: string): boolean {
    if (!fecha) return false;

    // Obtenemos la fecha exacta de tu computadora/celular
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActual.getDate()).padStart(2, '0');

    // Armamos la fecha forzando la hora local (ej: "2026-09-27")
    const hoyStr = `${anio}-${mes}-${dia}`;

    return hoyStr > fecha;
  }

  // Registra el pago y adelanta el vencimiento 1 mes exacto
  async registrarPago(cliente: any) {
    if (!cliente.fecha_vencimiento) {
      alert('Este cliente no tiene fecha de vencimiento configurada.');
      return;
    }

    if (confirm(`¿Registrar el pago de ${cliente.nombre_apellido} y adelantar su vencimiento un mes?`)) {
      // Separar la fecha ("2026-10-15")
      const partes = cliente.fecha_vencimiento.split('-');
      const anio = parseInt(partes[0]);
      const mes = parseInt(partes[1]); // Al usar este número directo, JS automáticamente le suma 1 mes
      const dia = parseInt(partes[2]);

      const nuevaFecha = new Date(anio, mes, dia);
      const nuevaFechaStr = nuevaFecha.toISOString().split('T')[0];

      try {
        await this.supabase.actualizarVencimiento(cliente.id, nuevaFechaStr);
        this.cargarLista();
      } catch (error) {
        console.error('Error al registrar pago', error);
      }
    }
  }
}
