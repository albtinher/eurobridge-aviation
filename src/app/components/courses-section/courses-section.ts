import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-courses-section',
  templateUrl: './courses-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesSectionComponent {
  readonly openModal = output<string>();

  requestModal(modalId: string): void {
    this.openModal.emit(modalId);
  }
}
