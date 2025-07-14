import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-valid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="valid-component">
      <h2>{{ title }}</h2>
      <div class="todo-section">
        <input 
          [(ngModel)]="newTodo" 
          placeholder="Enter a new todo"
          (keyup.enter)="addTodo()"
          class="todo-input"
        />
        <button (click)="addTodo()" [disabled]="!newTodo.trim()">
          Add Todo
        </button>
      </div>
      
      <ul class="todo-list" *ngIf="todos.length > 0">
        <li *ngFor="let todo of todos; let i = index" class="todo-item">
          <span [class.completed]="todo.completed">{{ todo.text }}</span>
          <div class="todo-actions">
            <button (click)="toggleTodo(i)" class="toggle-btn">
              {{ todo.completed ? 'Undo' : 'Complete' }}
            </button>
            <button (click)="removeTodo(i)" class="remove-btn">Remove</button>
          </div>
        </li>
      </ul>
      
      <div class="stats" *ngIf="todos.length > 0">
        <p>Total: {{ todos.length }} | 
           Completed: {{ completedCount }} | 
           Remaining: {{ remainingCount }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .valid-component {
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      background: #f9fff9;
    }
    
    .todo-section {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .todo-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .todo-list {
      list-style: none;
      padding: 0;
    }
    
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin-bottom: 5px;
      background: white;
      border-radius: 4px;
      border: 1px solid #eee;
    }
    
    .completed {
      text-decoration: line-through;
      color: #888;
    }
    
    .todo-actions {
      display: flex;
      gap: 5px;
    }
    
    .toggle-btn, .remove-btn {
      padding: 4px 8px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .toggle-btn {
      background: #2196F3;
      color: white;
    }
    
    .remove-btn {
      background: #f44336;
      color: white;
    }
    
    .stats {
      margin-top: 20px;
      padding: 10px;
      background: #e8f5e8;
      border-radius: 4px;
      text-align: center;
    }
  `]
})
export class ValidComponent {
  title = 'Valid Todo Component';
  newTodo = '';
  todos: { text: string; completed: boolean }[] = [
    { text: 'Learn Angular', completed: true },
    { text: 'Build awesome apps', completed: false }
  ];

  addTodo(): void {
    if (this.newTodo.trim()) {
      this.todos.push({
        text: this.newTodo.trim(),
        completed: false
      });
      this.newTodo = '';
    }
  }

  toggleTodo(index: number): void {
    if (index >= 0 && index < this.todos.length) {
      this.todos[index].completed = !this.todos[index].completed;
    }
  }

  removeTodo(index: number): void {
    if (index >= 0 && index < this.todos.length) {
      this.todos.splice(index, 1);
    }
  }

  get completedCount(): number {
    return this.todos.filter(todo => todo.completed).length;
  }

  get remainingCount(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }
} 