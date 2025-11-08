import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscenarioComponent } from './escenario.component';

describe('EscenarioComponent', () => {
  let component: EscenarioComponent;
  let fixture: ComponentFixture<EscenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscenarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
