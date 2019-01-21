import { NgModule } from '@angular/core';

import {
  MatCardModule,
  MatExpansionModule,
  MatIconModule,
  MatSlideToggleModule,
} from '@angular/material';

@NgModule({
  declarations: [],
  exports: [
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatSlideToggleModule,
  ]
})
export class MaterialModule { }


// All material modules that can be imported (from example demo material module)
// (listing only those not used above!)

// import { DragDropModule } from '@angular/cdk/drag-drop';
// import { ScrollingModule } from '@angular/cdk/scrolling';
// import { CdkTableModule } from '@angular/cdk/table';
// import { CdkTreeModule } from '@angular/cdk/tree';

// import {
//   MatAutocompleteModule,
//   MatBadgeModule,
//   MatBottomSheetModule,
//   MatButtonModule,
//   MatButtonToggleModule,
//   MatCheckboxModule,
//   MatChipsModule,
//   MatDatepickerModule,
//   MatDialogModule,
//   MatDividerModule,
//   MatGridListModule,
//   MatIconModule,
//   MatInputModule,
//   MatListModule,
//   MatMenuModule,
//   MatNativeDateModule,
//   MatPaginatorModule,
//   MatProgressBarModule,
//   MatProgressSpinnerModule,
//   MatRadioModule,
//   MatRippleModule,
//   MatSelectModule,
//   MatSidenavModule,
//   MatSliderModule,
//   MatSnackBarModule,
//   MatSortModule,
//   MatStepperModule,
//   MatTableModule,
//   MatTabsModule,
//   MatToolbarModule,
//   MatTooltipModule,
//   MatTreeModule,
// } from '@angular/material';
