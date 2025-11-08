import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCapacitador } from './login-capacitador';

describe('LoginCapacitador', () => {
  let component: LoginCapacitador;
  let fixture: ComponentFixture<LoginCapacitador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCapacitador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCapacitador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
