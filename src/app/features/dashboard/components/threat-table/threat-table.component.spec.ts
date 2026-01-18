import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreatTableComponent } from './threat-table.component';

describe('ThreatTableComponent', () => {
  let component: ThreatTableComponent;
  let fixture: ComponentFixture<ThreatTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreatTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreatTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
