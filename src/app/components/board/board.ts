import { Component } from '@angular/core';
import { Board as BoardModel, Column as ColumnModel } from '../../models/board.model';
import { Column } from '../column/column';
import { CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [Column, DragDropModule, NgFor, NgIf, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  board: BoardModel = {
    id: '1',
    title: 'My Project Board',
    columns: [
      {
        id: '1',
        title: 'To Do',
        cards: [
          { id: '1', title: 'Research Angular CDK', description: 'Look at the documentation', labels: ['#61bd4f'] },
          { id: '2', title: 'Sketch UI', description: 'Draw on paper', labels: ['#f2d600'] }
        ]
      },
      {
        id: '2',
        title: 'In Progress',
        cards: [
          { id: '3', title: 'Initialize Project', labels: ['#eb5a46'] }
        ]
      },
      {
        id: '3',
        title: 'Done',
        cards: []
      }
    ]
  };

  isAddingColumn = false;
  newColumnTitle = '';

  addColumn() {
    if (!this.newColumnTitle.trim()) return;

    const newColumn: ColumnModel = {
      id: Date.now().toString(),
      title: this.newColumnTitle,
      cards: []
    };

    this.board.columns.push(newColumn);
    this.newColumnTitle = '';
    this.isAddingColumn = false;
  }
}
