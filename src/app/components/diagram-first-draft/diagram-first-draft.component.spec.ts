import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramFirstDraftComponent } from './diagram-first-draft.component';

describe('DiagramFirstDraftComponent', () => {
  let component: DiagramFirstDraftComponent;
  let fixture: ComponentFixture<DiagramFirstDraftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramFirstDraftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramFirstDraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
