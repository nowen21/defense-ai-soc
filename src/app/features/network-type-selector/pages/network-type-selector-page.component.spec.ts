import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkTypeSelectorPageComponent } from './network-type-selector-page.component';

describe('NetworkTypeSelectorPageComponent', () => {
  let component: NetworkTypeSelectorPageComponent;
  let fixture: ComponentFixture<NetworkTypeSelectorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkTypeSelectorPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkTypeSelectorPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
