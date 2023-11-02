import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UserElement } from '../testing-forms/testing-forms.component';

@Component({
  selector: 'app-child-component',
  templateUrl: './child-component.component.html',
  styleUrls: ['./child-component.component.css'],
})
export class ChildComponentComponent {
  @Input() data: any;

  @Output() dataChange = new EventEmitter();

  @Output() unCheckItems = new EventEmitter();

  isClicked: boolean = false;

  checkBoxChanged(item: any) {
    this.dataChange.emit(item);
  }

  unCheckItem() {
    // this.isClicked = !this.isClicked;

    this.unCheckItems.emit(true);
  }
}
