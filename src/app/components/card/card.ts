import { Component, Input } from '@angular/core';
import { Card as CardModel } from '../../models/board.model';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() card!: CardModel;
}
