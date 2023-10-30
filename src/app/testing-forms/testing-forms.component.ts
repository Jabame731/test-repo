import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { iconsData } from '../icons.constant';

interface Food {
  value: string;
  viewValue: string;
}

export interface Item {
  name: string;
  description: string;
}

const ITEMS: Item[] = [
  { name: 'Item 1', description: 'Description 1' },
  { name: 'Item 2', description: 'Description 2' },
  // Add more items as needed
];

@Component({
  selector: 'app-testing-forms',
  templateUrl: './testing-forms.component.html',
  styleUrls: ['./testing-forms.component.css'],
})
export class TestingFormsComponent {
  isFocused = false;
  inputValue: string | null = null;

  items: Item[] = ITEMS;
  displayedColumns: string[] = ['name', 'description'];
  isSidebarOpen = true;

  selectedCar: string;

  selectedValue: string;

  previouslySelectedValue: string = '';

  constructor(private http: HttpClient) {
    this.selectedCar = '';
    this.selectedValue = ''; // Initialize the property in the constructor
  }

  handleFocus(): void {
    this.isFocused = true;
  }

  handleBlur(): void {
    this.isFocused = false;
  }

  handleChange(value: string): void {
    this.inputValue = value;
  }

  value = 'justine';

  myFormField: any;

  colorControl = new FormControl('primary' as ThemePalette);

  toppings = new FormControl('');

  toppingList: string[] = [
    'Extra cheese',
    'Mushroom',
    'Onion',
    'Pepperoni',
    'Sausage',
    'Tomato',
  ];

  foodControl = new FormControl();

  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  selectFood(value: string) {
    this.selectedValue = value;
  }

  selectedColor: string | null = null;
  colors: string[] = ['yellow', 'red', 'blue'];

  selectColor(color: string) {
    this.selectedColor = color;
  }

  showFiller = false;

  showSidebar = new BehaviorSubject<boolean>(false);
  selectedItems: string[] = [];

  get sidebarWidth(): string {
    return this.showSidebar.value ? '16rem' : '0';
  }

  get mainAreaMargin(): string {
    return this.showSidebar.value ? '16rem' : '0';
  }

  toggleSidebar() {
    this.showSidebar.next(!this.showSidebar.value);
  }

  toggleItemSelection(item: string) {
    if (this.selectedItems.includes(item)) {
      this.selectedItems = this.selectedItems.filter(
        (selected) => selected !== item
      );
    } else {
      this.selectedItems.push(item);
    }
    this.showSidebar.next(this.selectedItems.length > 0);
  }

  selectItem(item: string) {
    if (!this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
      this.showSidebar.next(true);
    }
  }

  removeItem(item: string) {
    const index = this.selectedItems.indexOf(item);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
      if (this.selectedItems.length === 0) {
        this.showSidebar.next(false);
      }
    }
  }

  ////////////////////////////////////////////////////
  datas = iconsData;

  selectedIcon: string | undefined;
  searchControl = new FormControl();

  filteredIcons: string[] = [];

  filterIcons() {
    const searchText = this.searchControl.value.toLowerCase();
    this.filteredIcons = this.datas.filter((item) =>
      item.toLowerCase().includes(searchText)
    );
  }
}
