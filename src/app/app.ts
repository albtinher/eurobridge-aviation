import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { AboutSectionComponent } from './components/about-section/about-section';
import { ContactSectionComponent } from './components/contact-section/contact-section';
import { CplDetailCardComponent } from './components/cpl-detail-card/cpl-detail-card';
import { CoursesSectionComponent } from './components/courses-section/courses-section';
import { HeroSectionComponent } from './components/hero-section/hero-section';
import { ModalCatalogComponent } from './components/modal-catalog/modal-catalog';
import { SkyBackgroundComponent } from './components/sky-background/sky-background';
import { TopNavComponent } from './components/top-nav/top-nav';
import { TramitesSectionComponent } from './components/tramites-section/tramites-section';

@Component({
  selector: 'app-root',
  imports: [
    SkyBackgroundComponent,
    TopNavComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    CoursesSectionComponent,
    CplDetailCardComponent,
    TramitesSectionComponent,
    ContactSectionComponent,
    ModalCatalogComponent,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sectionIds = ['sobre', 'cursos', 'tramites', 'contacto'] as const;

  protected readonly scrolled = signal(false);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly activeSection = signal<'sobre' | 'cursos' | 'tramites' | 'contacto'>('sobre');
  protected readonly activeModal = signal<string | null>(null);

  private fadeObserver: IntersectionObserver | null = null;

  constructor() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('click', this.handleInavClick);
    this.handleScroll();

    afterNextRender(() => {
      this.setupFadeInObserver();
    });

    effect(() => {
      this.setScrollLock(Boolean(this.activeModal()));
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('keydown', this.handleKeydown);
      window.removeEventListener('click', this.handleInavClick);
      this.fadeObserver?.disconnect();
      this.setScrollLock(false);
    });
  }

  protected toggleMenu(): void {
    this.mobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected openModal(modalId: string): void {
    this.activeModal.set(modalId);
  }

  protected closeModal(): void {
    this.activeModal.set(null);
  }

  protected scrollToSection(sectionId: 'sobre' | 'cursos' | 'tramites' | 'contacto'): void {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    this.closeMenu();
    this.activeSection.set(sectionId);

    const navElement = document.getElementById('nav');
    const navHeight = navElement?.offsetHeight ?? (this.scrolled() ? 58 : 66);
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const topGap = 26;
    const targetTop = sectionTop - navHeight - topGap;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  }

  private readonly handleScroll = (): void => {
    this.scrolled.set(window.scrollY > 30);

    for (const id of this.sectionIds) {
      const section = document.getElementById(id);
      if (!section) {
        continue;
      }

      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom > 60) {
        this.activeSection.set(id);
        break;
      }
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  };

  private readonly handleInavClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const link = event.target.closest('.inav a[href^="#"]');
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) {
      return;
    }

    const sectionId = href.slice(1);
    if (!this.isSectionId(sectionId)) {
      return;
    }

    event.preventDefault();
    this.scrollToSection(sectionId);
  };

  private isSectionId(value: string): value is 'sobre' | 'cursos' | 'tramites' | 'contacto' {
    return this.sectionIds.some((sectionId) => sectionId === value);
  }

  private setupFadeInObserver(): void {
    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add('vis');
          this.fadeObserver?.unobserve(entry.target);
        }
      },
      { threshold: 0.06 },
    );

    document.querySelectorAll('.fi').forEach((element) => {
      this.fadeObserver?.observe(element);
    });
  }

  private setScrollLock(locked: boolean): void {
    const body = document.body;
    const html = document.documentElement;

    if (locked) {
      body.classList.add('modal-scroll-locked');
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      return;
    }

    body.classList.remove('modal-scroll-locked');
    body.style.overflow = '';
    html.style.overflow = '';
  }
}
