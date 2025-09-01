import { Component } from '@angular/core';

@Component({
  selector: 'app-multi-violation-test',
  templateUrl: './multi-violation-test.component.html',
  styleUrls: ['./multi-violation-test.component.scss'],
  standalone: true
})
export class MultiViolationTestComponent {
  activeTab = 0;
  showCard = true;
  notifications = 5;
  
  constructor() {
    console.log('MultiViolationTestComponent initialized');
  }

  switchTab(index: number) {
    this.activeTab = index;
  }

  toggleCard() {
    this.showCard = !this.showCard;
  }

  handleButtonClick() {
    console.log('Legacy button clicked');
  }
}
