import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  selector: 'app-modal-catalog',
  imports: [ContactFormComponent],
  templateUrl: './modal-catalog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalCatalogComponent {
  private readonly contactService = inject(ContactService);

  readonly activeModal = input<string | null>(null);
  readonly closeRequested = output<void>();

  private readonly courseByModalId: Record<string, string> = {
    'm-ppl': 'Conversion PPL',
    'm-uprt': 'UPRT Advance',
    'm-mcc': 'MCC APS',
    'm-me': 'Multi-Engine',
    'm-ir': 'Instrument Rating',
    'm-visa': 'Visa de Estudio',
    'm-lic': 'Tramitacion de Licencia',
  };

  readonly formVisible = signal(false);
  readonly sending = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly confirmationVisible = signal(false);
  readonly isAnyModalOpen = computed(() => this.activeModal() !== null);

  readonly selectedCourse = computed(() => {
    const modalId = this.activeModal();
    return modalId ? (this.courseByModalId[modalId] ?? 'Consulta general') : 'Consulta general';
  });

  private readonly modalSync = effect(() => {
    if (!this.activeModal()) {
      this.formVisible.set(false);
      this.sending.set(false);
      this.submitError.set(null);
      this.confirmationVisible.set(false);
    }
  });

  isOpen(modalId: string): boolean {
    return this.activeModal() === modalId;
  }

  isFormOpen(modalId: string): boolean {
    return this.activeModal() === modalId && this.formVisible();
  }

  openForm(): void {
    this.submitError.set(null);
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
          this.formVisible.set(false);
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
