import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Column as ColumnModel, Card as CardModel } from '../../models/board.model';
import { Card } from '../card/card';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [Card, DragDropModule, NgFor, NgIf, FormsModule],
  templateUrl: './column.html',
  styleUrl: './column.css',
})
export class Column {
  @Input() column!: ColumnModel;

  isAddingCard = false;
  newCardTitle = '';

  drop(event: CdkDragDrop<CardModel[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  addCard() {
    if (!this.newCardTitle.trim()) return;

    const newCard: CardModel = {
      id: Date.now().toString(),
      title: this.newCardTitle,
      description: '',
      labels: []
    };

    this.column.cards.push(newCard);
    this.newCardTitle = '';
    this.isAddingCard = false;
  }
}
