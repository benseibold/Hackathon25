import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientProfile } from './recipient-profile';

describe('RecipientProfile', () => {
  let component: RecipientProfile;
  let fixture: ComponentFixture<RecipientProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipientProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
