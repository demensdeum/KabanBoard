import { Component, signal } from '@angular/core';
import { Board } from './components/board/board';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Board],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('kaban-board');
}
