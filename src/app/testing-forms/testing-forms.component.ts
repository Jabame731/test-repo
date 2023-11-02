// import { Component } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { ThemePalette } from '@angular/material/core';
// import { BehaviorSubject } from 'rxjs';

// import { HttpClient } from '@angular/common/http';
// import { iconsData } from '../icons.constant';

// interface Food {
//   value: string;
//   viewValue: string;
// }

// export interface Item {
//   name: string;
//   description: string;
// }

// const ITEMS: Item[] = [
//   { name: 'Item 1', description: 'Description 1' },
//   { name: 'Item 2', description: 'Description 2' },
//   // Add more items as needed
// ];

// @Component({
//   selector: 'app-testing-forms',
//   templateUrl: './testing-forms.component.html',
//   styleUrls: ['./testing-forms.component.css'],
// })
// export class TestingFormsComponent {
//   isFocused = false;
//   inputValue: string | null = null;

//   items: Item[] = ITEMS;
//   displayedColumns: string[] = ['name', 'description'];
//   isSidebarOpen = true;

//   selectedCar: string;

//   selectedValue: string;

//   previouslySelectedValue: string = '';

//   constructor(private http: HttpClient) {
//     this.selectedCar = '';
//     this.selectedValue = ''; // Initialize the property in the constructor
//   }

//   handleFocus(): void {
//     this.isFocused = true;
//   }

//   handleBlur(): void {
//     this.isFocused = false;
//   }

//   handleChange(value: string): void {
//     this.inputValue = value;
//   }

//   value = 'justine';

//   myFormField: any;

//   colorControl = new FormControl('primary' as ThemePalette);

//   toppings = new FormControl('');

//   toppingList: string[] = [
//     'Extra cheese',
//     'Mushroom',
//     'Onion',
//     'Pepperoni',
//     'Sausage',
//     'Tomato',
//   ];

//   foodControl = new FormControl();

//   foods: Food[] = [
//     { value: 'steak-0', viewValue: 'Steak' },
//     { value: 'pizza-1', viewValue: 'Pizza' },
//     { value: 'tacos-2', viewValue: 'Tacos' },
//   ];

//   selectFood(value: string) {
//     this.selectedValue = value;
//   }

//   selectedColor: string | null = null;
//   colors: string[] = ['yellow', 'red', 'blue'];

//   selectColor(color: string) {
//     this.selectedColor = color;
//   }

//   showFiller = false;

//   showSidebar = new BehaviorSubject<boolean>(false);
//   selectedItems: string[] = [];

//   get sidebarWidth(): string {
//     return this.showSidebar.value ? '16rem' : '0';
//   }

//   get mainAreaMargin(): string {
//     return this.showSidebar.value ? '16rem' : '0';
//   }

//   toggleSidebar() {
//     this.showSidebar.next(!this.showSidebar.value);
//   }

//   toggleItemSelection(item: string) {
//     if (this.selectedItems.includes(item)) {
//       this.selectedItems = this.selectedItems.filter(
//         (selected) => selected !== item
//       );
//     } else {
//       this.selectedItems.push(item);
//     }
//     this.showSidebar.next(this.selectedItems.length > 0);
//   }

//   selectItem(item: string) {
//     if (!this.selectedItems.includes(item)) {
//       this.selectedItems.push(item);
//       this.showSidebar.next(true);
//     }
//   }

//   removeItem(item: string) {
//     const index = this.selectedItems.indexOf(item);
//     if (index !== -1) {
//       this.selectedItems.splice(index, 1);
//       if (this.selectedItems.length === 0) {
//         this.showSidebar.next(false);
//       }
//     }
//   }

//   ////////////////////////////////////////////////////
//   datas = iconsData;

//   selectedIcon: string | undefined;
//   searchControl = new FormControl();

//   filteredIcons: string[] = [];

//   filterIcons() {
//     const searchText = this.searchControl.value.toLowerCase();
//     this.filteredIcons = this.datas.filter((item) =>
//       item.toLowerCase().includes(searchText)
//     );
//   }
// }

import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import {
  BehaviorSubject,
  Observable,
  Subject,
  concatMap,
  debounceTime,
  filter,
  map,
  of,
  startWith,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';

import { FormControl } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { Params } from '@angular/router';

export interface UserElement {
  contact_name: string;
  email_address: string;
  phone_number: string;
  address: string;
  salesperson: string;
  person_id: string;
  position: number;
}

export const ELEMENT_DATA: UserElement[] = [
  {
    position: 1,
    contact_name: 'Adam Baltimore',
    email_address: 'adam_baltimore@gmail.com',
    phone_number: '(760) 431-1234',
    address: '123 Address St. City.ST 12345',
    salesperson: 'Billy Jankowitz',
    person_id: '#12345',
  },
  {
    position: 2,
    contact_name: 'Adam Baltimore',
    email_address: 'adam_baltimore@gmail.com',
    phone_number: '(760) 431-1234',
    address: '123 Address St. City.ST 12345',
    salesperson: 'Billy Jankowitz',
    person_id: '#12345',
  },
  {
    position: 3,
    contact_name: 'Adam Baltimore',
    email_address: 'adam_baltimore@gmail.com',
    phone_number: '(760) 431-1234',
    address: '123 Address St. City.ST 12345',
    salesperson: 'Billy Jankowitz',
    person_id: '#12345',
  },
  {
    position: 4,
    contact_name: 'Adam Baltimore',
    email_address: 'adam_baltimore@gmail.com',
    phone_number: '(760) 431-1234',
    address: '123 Address St. City.ST 12345',
    salesperson: 'Billy Jankowitz',
    person_id: '#12345',
  },
  {
    position: 5,
    contact_name: 'Adam Baltimore',
    email_address: 'adam_baltimore@gmail.com',
    phone_number: '(760) 431-1234',
    address: '123 Address St. City.ST 12345',
    salesperson: 'Billy Jankowitz',
    person_id: '#12345',
  },
];

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
  items: Item[] = ITEMS;

  @Input() parentCheckboxState: boolean = false;
  @Output() parentCheckboxStateChange = new EventEmitter<boolean>();

  parentCheckboxValue = false;

  displayedColumns: string[] = [
    'select',
    'contact_name',
    'email_address',
    'phone_number',
    'address',
    'salesperson',
    'person_id',
  ];

  onParentCheckboxChange() {
    this.parentCheckboxStateChange.emit(this.parentCheckboxState);
  }

  showContainer: boolean = false;

  // todo change the data type to be the returned search user
  dataSource = new MatTableDataSource<UserElement>(ELEMENT_DATA);
  selection = new SelectionModel<UserElement>(true, []);

  searchControl = new FormControl();

  selectedContactOpen$ = new BehaviorSubject(false);

  destroyed$: Subject<boolean> = new Subject<boolean>();
  showSidebar = new BehaviorSubject<boolean>(false);

  selectedItems: string[] = [];

  enterselectedContact(row: any) {
    // if (this.selectedItems.includes(row)) {
    //   this.selectedItems = this.selectedItems.filter(
    //     (selected) => selected !== row
    //   );
    // } else {
    //   this.selectedItems.push(row);
    // }
    // this.showSidebar.next(this.selectedItems.length > 0);

    // console.log(this.selectedItems);

    this.updateSelectedItems(row);
  }

  // todo user returned data
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: UserElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  get sidebarWidth(): string {
    return this.showSidebar.value ? '33.333333%' : '0';
  }

  toggleSidebar() {
    this.showSidebar.next(!this.showSidebar.value);
  }

  isItemChecked(toBeChecked: boolean) {
    if (toBeChecked) {
      this.selectedItems = [];
    }
    this.showSidebar.next(this.selectedItems.length > 0);
  }

  dataChanged($event: any) {
    console.log('this comes from child', $event);

    const test = $event;

    // if (this.selectedItems.includes(test)) {
    //   this.selectedItems = this.selectedItems.filter(
    //     (selected) => selected !== test
    //   );
    // } else {
    //   this.selectedItems.push(test);
    // }
    // this.showSidebar.next(this.selectedItems.length > 0);
    this.updateSelectedItems(test);
  }

  updateSelectedItems(item: any) {
    if (this.selectedItems.includes(item)) {
      this.selectedItems = this.selectedItems.filter(
        (selected) => selected !== item
      );
    } else {
      this.selectedItems.push(item);
    }
    this.showSidebar.next(this.selectedItems.length > 0);
    console.log(this.selectedItems);
  }
}
