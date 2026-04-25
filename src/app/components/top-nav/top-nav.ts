import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavComponent {
  readonly scrolled = input(false);
  readonly mobileMenuOpen = input(false);
  readonly activeSection = input<'sobre' | 'cursos' | 'tramites' | 'contacto'>('sobre');

  readonly menuToggled = output<void>();
  readonly menuClosed = output<void>();
  readonly sectionSelected = output<'sobre' | 'cursos' | 'tramites' | 'contacto'>();

  onSectionClick(
    event: Event,
    section: 'sobre' | 'cursos' | 'tramites' | 'contacto',
    closeAfter = false,
  ): void {
    event.preventDefault();
    this.sectionSelected.emit(section);
    if (closeAfter) {
      this.menuClosed.emit();
    }
  }
}
