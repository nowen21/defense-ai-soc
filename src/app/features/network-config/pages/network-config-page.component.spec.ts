import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkConfigPageComponent } from './network-config-page.component';

describe('NetworkConfigPageComponent', () => {
  let component: NetworkConfigPageComponent;
  let fixture: ComponentFixture<NetworkConfigPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkConfigPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkConfigPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
