import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const GET_BOARDS = gql`
  query GetBoards {
    getBoards {
      id
      title
    }
  }
`;

const CREATE_BOARD = gql`
  mutation CreateBoard($title: String!) {
    createBoard(title: $title) {
      id
      title
    }
  }
`;

const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id)
  }
`;

interface Board {
  id: string;
  title: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  projects$!: Observable<Board[]>;

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    this.projects$ = this.apollo.watchQuery<{ getBoards: Board[] }>({
      query: GET_BOARDS,
      pollInterval: 2000 // Simple polling for now
    }).valueChanges.pipe(map(result => (result.data?.getBoards || []) as Board[]));
  }

  addProject() {
    // Basic prompt for now
    const title = prompt('Enter project title');
    if (!title) return;

    this.apollo.mutate({
      mutation: CREATE_BOARD,
      variables: { title },
      refetchQueries: [{ query: GET_BOARDS }]
    }).subscribe();
  }

  deleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this board?')) return;
    this.apollo.mutate({
      mutation: DELETE_BOARD,
      variables: { id },
      refetchQueries: [{ query: GET_BOARDS }]
    }).subscribe();
  }
}
