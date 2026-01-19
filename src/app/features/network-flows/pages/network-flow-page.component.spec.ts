import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkFlowPageComponent } from './network-flow-page.component';

describe('NetworkFlowPageComponent', () => {
  let component: NetworkFlowPageComponent;
  let fixture: ComponentFixture<NetworkFlowPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkFlowPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkFlowPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
