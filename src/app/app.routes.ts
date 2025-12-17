import { Routes } from '@angular/router';
import { Board } from './components/board/board';

export const routes: Routes = [
    { path: 'board/:id', component: Board },
    { path: '', redirectTo: 'board/default', pathMatch: 'full' } // Temporary default
];
