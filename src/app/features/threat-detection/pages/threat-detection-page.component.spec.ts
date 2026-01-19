import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreatDetectionPageComponent } from './threat-detection-page.component';

describe('ThreatDetectionPageComponent', () => {
  let component: ThreatDetectionPageComponent;
  let fixture: ComponentFixture<ThreatDetectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreatDetectionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreatDetectionPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
