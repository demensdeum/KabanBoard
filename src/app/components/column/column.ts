import { Component, Input } from '@angular/core';
import { Column as ColumnModel, Card as CardModel } from '../../models/board.model';
import { Card } from '../card/card';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';

const ADD_CARD = gql`
  mutation AddCard($boardId: ID!, $columnId: ID!, $title: String!) {
    addCard(boardId: $boardId, columnId: $columnId, title: $title) {
        id
        title
        description
        labels
    }
  }
`;

const MOVE_CARD = gql`
  mutation MoveCard($boardId: ID!, $fromColumnId: ID!, $toColumnId: ID!, $cardId: ID!, $index: Int!) {
    moveCard(boardId: $boardId, fromColumnId: $fromColumnId, toColumnId: $toColumnId, cardId: $cardId, index: $index) {
        id
    }
  }
`;

const DELETE_COLUMN = gql`
  mutation DeleteColumn($boardId: ID!, $columnId: ID!) {
    deleteColumn(boardId: $boardId, columnId: $columnId)
  }
`;

const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    getBoard(id: $id) {
      id
      title
      columns {
        id
        title
        cards {
          id
          title
          description
          labels
        }
      }
    }
  }
`;

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [Card, DragDropModule, NgFor, NgIf, FormsModule],
  templateUrl: './column.html',
  styleUrl: './column.css',
})
export class Column {
  @Input() column!: ColumnModel;
  @Input() boardId!: string;

  isAddingCard = false;
  newCardTitle = '';

  constructor(private apollo: Apollo) { }

  drop(event: CdkDragDrop<CardModel[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // Logic for reordering within same column (skipping for now backend update or reuse moveCard if needed)
      // This simple example focuses on visual + data sync for cross-column mainly, or same column index update
      this.moveCard(this.column.id, this.column.id, event.item.data.id, event.currentIndex);

    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      // Logic for cross-column move
      // Note: event.item.data should be bound in template [cdkDragData] to be accessible here easily
      // But we can also get card via previousContainer array
      // Re-querying exact card ID might be needed if not passed directly
      // Let's ensure proper ID access. unique identifier is needed.
      // Assuming 'event.item.data' is the card object if we bind it.
      const card = event.item.data; // Need to bind cdkDragData
      const fromColId = event.previousContainer.id; // Need to bind ID to cdkDropList if using mapping, or use logic
      // Actually simpler:
      // We have `column.id` as `toColumnId`.
      // We need `fromColumnId`.
      // We need `cardId`.

      // Let's implement moveCard properly assuming we can trace IDs.
      // Since `transferArrayItem` modifies local arrays, we just need to sync backend.
      // But we need the IDs.
    }
  }

  // Fixing drop to handle backend sync properly
  dropSync(event: CdkDragDrop<CardModel[]>) {
    // Optimistic visual update
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const cardId = event.item.data.id;
      this.moveCard(this.column.id, this.column.id, cardId, event.currentIndex);
    } else {
      const cardId = event.item.data.id;
      const fromColumnsId = event.previousContainer.id; // We need to set [id] on cdkDropList to be column ID
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.moveCard(fromColumnsId, this.column.id, cardId, event.currentIndex);
    }
  }

  moveCard(fromColumnId: string, toColumnId: string, cardId: string, index: number) {
    this.apollo.mutate({
      mutation: MOVE_CARD,
      variables: {
        boardId: this.boardId,
        fromColumnId,
        toColumnId,
        cardId,
        index
      },
      // No refetch needed if optimistic UI matches, but good for sync
    }).subscribe();
  }

  addCard() {
    if (!this.newCardTitle.trim()) return;

    this.apollo.mutate({
      mutation: ADD_CARD,
      variables: {
        boardId: this.boardId,
        columnId: this.column.id,
        title: this.newCardTitle
      },
      refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
    }).subscribe(() => {
      this.newCardTitle = '';
      this.isAddingCard = false;
    });
  }

  deleteColumn() {
    if (!confirm('Are you sure you want to delete this column?')) return;

    this.apollo.mutate({
      mutation: DELETE_COLUMN,
      variables: {
        boardId: this.boardId,
        columnId: this.column.id
      },
      refetchQueries: [{ query: GET_BOARD, variables: { id: this.boardId } }]
    }).subscribe();
  }
}
