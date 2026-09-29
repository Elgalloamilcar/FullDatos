import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class Supabase {

  // Declaramos la variable usando el tipo oficial de la librería
  private supabase: SupabaseClient;

  constructor() {
    // Reemplaza con tus datos reales
    const supabaseUrl = 'https://hjcidokujoitayzgulry.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqY2lkb2t1am9pdGF5emd1bHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzMyNTUsImV4cCI6MjEwNTc0OTI1NX0.Jf_9I5UgOABAdOI8NfXEXKRqTBgIQ8UECOpfVQgkFeE';

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async iniciarSesion(email: string, clave: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: clave
    });

    if (error) throw error;
    return data;
  }



  async obtenerUsuarioActual() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
  async obtenerClientes(soloActivos: boolean = true) {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .eq('activo', soloActivos)
      .order('nombre_apellido', { ascending: true }); // Los ordena por ID

    if (error) throw error;
    return data || [];
  }
  async reactivarCliente(id: string) {
    const { error } = await this.supabase
      .from('clientes')
      .update({ activo: true })
      .eq('id', id);
    if (error) throw error;
  }
  async agregarCliente(nuevoCliente: any) {
    const { data, error } = await this.supabase
      .from('clientes')
      .insert([nuevoCliente]);

    if (error) throw error;
    return data;
  }
  async actualizarEstadoPago(id: any, estado: boolean) {
    const { error } = await this.supabase
      .from('clientes')
      .update({ estado_al_dia: estado })
      .eq('id', id);
    if (error) {
      throw error;
    }
  }
  async darDeBajaCliente(id: any) {
    const { error } = await this.supabase
      .from('clientes')
      .update({ activo: false })
      .eq('id', id);
    if (error) {
      throw error;
    }
  }

  // Para traer los datos de un solo cliente y ponerlos en el formulario
  async obtenerClientePorId(id: string) {
    // Le decimos a TypeScript que confíe en que la respuesta tiene este formato (any)
    const respuesta: any = await this.supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (respuesta.error) throw respuesta.error;
    return respuesta.data;
  }

  // Para guardar los cambios
  async actualizarClienteInfo(id: string, datos: any) {
    const { error } = await this.supabase
      .from('clientes')
      .update(datos)
      .eq('id', id);
    if (error) throw error;
  }
  async actualizarVencimiento(id: string, nuevaFecha: string) {
    const { error } = await this.supabase
      .from('clientes')
      .update({ fecha_vencimiento: nuevaFecha })
      .eq('id', id);
    if (error) throw error;
  }


  async cerrarSesion() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }
}