import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Supabase } from '../../services/supabase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Inyectamos nuestros objetos prestados: el servicio de base de datos y el enrutador de Angular
  private supabase = inject(Supabase);
  private router = inject(Router);

  // Variables para guardar lo que el usuario escribe
  email: string = '';
  clave: string = '';

  // Variables para controlar la pantalla
  mensajeError: string = '';
  cargando: boolean = false;



  async ingresar() {
    if (!this.email || !this.clave) {
      this.mensajeError = 'Por favor, completá los dos campos.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    try {
      await this.supabase.iniciarSesion(this.email, this.clave);
      this.router.navigate(['/panel']);
    } catch (error: any) {
      // ESTA ES LA LÍNEA QUE DEBEMOS CAMBIAR
      this.mensajeError = error.message;
    } finally {
      this.cargando = false;
    }
  }
}
