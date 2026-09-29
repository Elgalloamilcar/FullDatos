import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Panel } from './components/panel/panel';
import { Formulario } from './components/formulario/formulario';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'panel', component: Panel },
  { path: 'nuevo-cliente', component: Formulario }, // Ruta nueva
  { path: 'editar-cliente/:id', component: Formulario }

];