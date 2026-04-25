import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-tramites-section',
  templateUrl: './tramites-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TramitesSectionComponent {
  readonly openModal = output<string>();

  requestModal(modalId: string): void {
    this.openModal.emit(modalId);
  }
}
