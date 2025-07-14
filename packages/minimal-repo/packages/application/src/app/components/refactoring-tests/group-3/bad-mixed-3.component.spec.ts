import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MixedStylesComponent3 } from './bad-mixed-3.component';

describe('MixedStylesComponent', () => {
  let component: MixedStylesComponent3;
  let fixture: ComponentFixture<MixedStylesComponent3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MixedStylesComponent3],
    }).compileComponents();

    fixture = TestBed.createComponent(MixedStylesComponent3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });

  describe('Template Content Tests', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render DS modal component', () => {
      const dsModal = fixture.nativeElement.querySelector('ds-modal');
      expect(dsModal).toBeTruthy();
      expect(dsModal.hasAttribute('open')).toBe(true);
    });

    it('should render ds-modal with proper structure', () => {
      const dsModal = fixture.nativeElement.querySelector('ds-modal');
      expect(dsModal).toBeTruthy();

      const modalContent = dsModal.querySelector('ds-modal-content');
      expect(modalContent).toBeTruthy();
    });

    it('should display modal content text', () => {
      const dsModalContent = fixture.nativeElement.querySelector('ds-modal p');
      expect(dsModalContent?.textContent?.trim()).toBe('Good Modal Content');

      const dsModalHeader =
        fixture.nativeElement.querySelector('ds-modal h2');
      expect(dsModalHeader?.textContent?.trim()).toBe('Good Modal');
    });

    it('should render buttons with different implementations', () => {
      const dsButton = fixture.nativeElement.querySelector('ds-button');
      const legacyButton = fixture.nativeElement.querySelector('button.btn');

      expect(dsButton).toBeTruthy();
      expect(legacyButton).toBeTruthy();
    });

    it('should render progress bars', () => {
      const dsProgressBar =
        fixture.nativeElement.querySelector('ds-progress-bar');
      const legacyProgressBar =
        fixture.nativeElement.querySelector('div.progress-bar');

      expect(dsProgressBar).toBeTruthy();
      expect(legacyProgressBar).toBeTruthy();
    });

    it('should render dropdown components', () => {
      const dsDropdown = fixture.nativeElement.querySelector('ds-dropdown');
      const legacyDropdown =
        fixture.nativeElement.querySelector('select.dropdown');

      expect(dsDropdown).toBeTruthy();
      expect(legacyDropdown).toBeTruthy();
    });

    it('should render alert components', () => {
      const dsAlert = fixture.nativeElement.querySelector('ds-alert');
      const legacyAlert = fixture.nativeElement.querySelector('div.alert');

      expect(dsAlert).toBeTruthy();
      expect(legacyAlert).toBeTruthy();
    });

    it('should render tooltip components', () => {
      const dsTooltip = fixture.nativeElement.querySelector('ds-tooltip');
      const legacyTooltip = fixture.nativeElement.querySelector('div.tooltip');

      expect(dsTooltip).toBeTruthy();
      expect(legacyTooltip).toBeTruthy();
    });

    it('should render breadcrumb navigation', () => {
      const dsBreadcrumb = fixture.nativeElement.querySelector('ds-breadcrumb');
      const legacyBreadcrumb =
        fixture.nativeElement.querySelector('nav.breadcrumb');

      expect(dsBreadcrumb).toBeTruthy();
      expect(legacyBreadcrumb).toBeTruthy();
    });

    it('should have breadcrumb items', () => {
      const breadcrumbItems =
        fixture.nativeElement.querySelectorAll('ds-breadcrumb-item');
      expect(breadcrumbItems.length).toBe(3);
    });
  });
});
