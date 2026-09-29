import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // AGREGAMOS ActivatedRoute
import { Supabase } from '../../services/supabase';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.css']
})
export class Formulario implements OnInit {
  private supabase = inject(Supabase);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Nos permite leer la URL

  clienteId: string | null = null;
  editando: boolean = false;
  guardando: boolean = false;

  cliente: any = {
    nombre_apellido: '',
    direccion: '',
    telefono: '',
    plan: 'Internet 100 MB',
    caja_nap: '',
    activo: true,
    estado_al_dia: true,
    fecha_vencimiento: null
  };

  async ngOnInit() {
    // Revisamos si la URL trae un ID (ej: /editar-cliente/5)
    this.clienteId = this.route.snapshot.paramMap.get('id');

    if (this.clienteId) {
      this.editando = true;
      try {
        // Buscamos los datos actuales y rellenamos el formulario
        const datosAnteriores = await this.supabase.obtenerClientePorId(this.clienteId);
        this.cliente = { ...datosAnteriores };
      } catch (error) {
        console.error('Error al cargar cliente:', error);
      }
    }
  }

  async guardarCliente() {
    this.guardando = true;
    try {
      if (this.editando && this.clienteId) {
        // Si estamos editando, actualizamos
        await this.supabase.actualizarClienteInfo(this.clienteId, this.cliente);
      } else {
        this.cliente.fecha_vencimiento = this.calcularPrimerVencimiento();
        // IMPRIMIMOS EN CONSOLA PARA REVISAR
        console.log('Enviando cliente a Supabase:', this.cliente);

        // Si es nuevo, lo creamos
        await this.supabase.agregarCliente(this.cliente);
      }
      this.router.navigate(['/panel']);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el cliente');
    }
    this.guardando = false;
  }
  calcularPrimerVencimiento(): string {
    const hoy = new Date();
    const dia = hoy.getDate();
    let mes = hoy.getMonth();
    let anio = hoy.getFullYear();

    // Si es 26 o más, salta un mes (mes + 2). Si no, es el mes siguiente (mes + 1).
    if (dia >= 26) {
      mes += 2;
    } else {
      mes += 1;
    }

    // JavaScript acomoda automáticamente el año si el mes pasa de diciembre
    const vencimiento = new Date(anio, mes, 15);
    return vencimiento.toISOString().split('T')[0]; // Lo convierte a formato YYYY-MM-DD para Supabase
  }

  cancelar() {
    this.router.navigate(['/panel']);
  }
}