import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { ContactFormComponent } from '../contact-form/contact-form';
import { ContactLead } from '../../models/contact-lead';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-cpl-detail-card',
  imports: [ContactFormComponent],
  templateUrl: './cpl-detail-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CplDetailCardComponent {
  private readonly contactService = inject(ContactService);

  readonly isOpen = input(false);
  readonly closeRequested = output<void>();

  readonly formVisible = signal(false);
  readonly sending = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly confirmationVisible = signal(false);

  private readonly modalSync = effect(() => {
    if (!this.isOpen()) {
      this.formVisible.set(false);
      this.sending.set(false);
      this.submitError.set(null);
      this.confirmationVisible.set(false);
    }
  });

  openForm(): void {
    this.submitError.set(null);
    this.confirmationVisible.set(false);
    this.formVisible.set(true);
  }

  closeForm(): void {
    this.submitError.set(null);
    this.formVisible.set(false);
  }

  submitForm(payload: ContactLead): void {
    this.submitError.set(null);
    this.sending.set(true);

    this.contactService
      .sendLead(payload)
      .pipe(finalize(() => this.sending.set(false)))
      .subscribe({
        next: () => {
          this.confirmationVisible.set(true);
        },
        error: () => {
          this.submitError.set(
            'No pudimos enviar la consulta ahora mismo. Intenta de nuevo en unos minutos.',
          );
        },
      });
  }

  closeConfirmationAndModal(): void {
    this.confirmationVisible.set(false);
    this.closeRequested.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeRequested.emit();
    }
  }

  onConfirmationBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeConfirmationAndModal();
    }
  }
}
