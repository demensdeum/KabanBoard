import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Card as CardModel } from '../../models/board.model';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() card!: CardModel;
  isEditing = false;

  @ViewChild('editInput') editInput!: ElementRef;

  startEditing(event: Event) {
    event.stopPropagation();
    this.isEditing = true;
    setTimeout(() => {
      if (this.editInput) {
        this.editInput.nativeElement.focus();
        this.editInput.nativeElement.select();
      }
    });
  }

  stopEditing() {
    this.isEditing = false;
    if (!this.card.title.trim()) {
      // Option: handle empty title (e.g., delete or revert)
      // For now, let's just keep it or revert if empty if we had previous state
    }
  }
}
