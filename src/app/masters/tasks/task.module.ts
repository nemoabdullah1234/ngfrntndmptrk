import { WidgetModule } from './../../core/widget/widget.module';
// import { AkRoleDirective } from '../../core/authorization/shared/auth-role.directive';
import { ValidationModule } from '../../core/validators/validation.module';
import { AddmoreModule } from '../shared/addmore/addmore.module';
import { TaskListComponent } from './task-list/task-list.component';
import { routing } from './task-routing.module';
import { TaskComponent } from './tasks/task.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RlTagInputModule } from 'angular2-tag-input';

import {
  AutoCompleteModule,
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DataTableModule,
  DialogModule,
  DropdownModule,
  FieldsetModule,
  FileUploadModule,
  GMapModule,
  GrowlModule,
  InputMaskModule,
  InputSwitchModule,
  InputTextareaModule,
  MultiSelectModule,
  PanelModule,
  PasswordModule,
  RadioButtonModule,
  SharedModule,
  SliderModule,
  SpinnerModule,
  SplitButtonModule,
  TabViewModule,
  ToggleButtonModule,
  TooltipModule,
  OverlayPanelModule,
  EditorModule,
} from 'primeng/primeng';
import { TooltipDirective } from '../../themes/stryker/directives/tooltip.directive';

@NgModule({
  imports: [
    ValidationModule,
    EditorModule,
    CommonModule,
    RlTagInputModule,
    routing, AddmoreModule,
    WidgetModule,
    FormsModule,
    TooltipModule,
    OverlayPanelModule,
    ReactiveFormsModule,
    CalendarModule, FieldsetModule, PanelModule,
    FileUploadModule, SplitButtonModule, AutoCompleteModule, PasswordModule, RadioButtonModule, TabViewModule,
    GMapModule, InputSwitchModule, InputTextareaModule, InputMaskModule, SliderModule, SpinnerModule, ToggleButtonModule, ButtonModule,
    DataTableModule, SharedModule, GrowlModule, MultiSelectModule, CheckboxModule, DropdownModule, DialogModule
  ],
  declarations: [
    TaskComponent,
    TaskListComponent,
    TooltipDirective
    // AkRoleDirective
  ],
})
export class TaskModule { }
