import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board as BoardModel, Column as ColumnModel, Card as CardModel } from '../../models/board.model';
import { Column } from '../column/column';
import { CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';

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

const ADD_COLUMN = gql`
  mutation AddColumn($boardId: ID!, $title: String!) {
    addColumn(boardId: $boardId, title: $title) {
      id
      title
      cards {
        id
      }
    }
  }
`;

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [Column, DragDropModule, CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements OnInit {
  @Input() id!: string; // From router component input binding

  board: BoardModel | null = null;
  loading = true;

  isAddingColumn = false;
  newColumnTitle = '';

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    // Input binding will set 'id'. Note: if reusing component for param change, might need ngOnChanges or observable.
    // For now, simple OnInit assuming router re-instantiates or we can use setter if needed.
    // Actually, router 'withComponentInputBinding' sets inputs. If params change, input updates.
    this.fetchBoard();
  }

  // Handle Input change for route params
  @Input()
  set boardId(value: string) {
    this.id = value;
    this.fetchBoard();
  }

  fetchBoard() {
    if (!this.id) return;
    this.loading = true;
    this.apollo.watchQuery<any>({
      query: GET_BOARD,
      variables: { id: this.id },
      pollInterval: 2000
    }).valueChanges.subscribe(result => {
      this.board = result.data?.getBoard;
      this.loading = false;
    });
  }

  addColumn() {
    if (!this.newColumnTitle.trim() || !this.board) return;

    this.apollo.mutate({
      mutation: ADD_COLUMN,
      variables: { boardId: this.board.id, title: this.newColumnTitle },
      refetchQueries: [{ query: GET_BOARD, variables: { id: this.id } }]
    }).subscribe(() => {
      this.newColumnTitle = '';
      this.isAddingColumn = false;
    });
  }
}
