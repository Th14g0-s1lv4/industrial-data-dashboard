import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SensorDetalhe } from './sensor-detalhe';

describe('SensorDetalhe', () => {
  let component: SensorDetalhe;
  let fixture: ComponentFixture<SensorDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(SensorDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
