import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-sky-background',
  templateUrl: './sky-background.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkyBackgroundComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fadeWindowSeconds = 1.2;
  private readonly fadeDurationMs = 1100;

  private isCrossfading = false;
  private resetTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly activeVideoIndex = signal<0 | 1>(0);

  @ViewChild('videoA', { static: true }) private readonly videoARef?: ElementRef<HTMLVideoElement>;
  @ViewChild('videoB', { static: true }) private readonly videoBRef?: ElementRef<HTMLVideoElement>;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.resetTimeout) {
        clearTimeout(this.resetTimeout);
      }
    });
  }

  protected onTimeUpdate(index: 0 | 1): void {
    if (index !== this.activeVideoIndex() || this.isCrossfading) {
      return;
    }

    const activeVideo = this.getVideo(index);
    if (!activeVideo || !Number.isFinite(activeVideo.duration) || activeVideo.duration <= 0) {
      return;
    }

    if (activeVideo.currentTime >= activeVideo.duration - this.fadeWindowSeconds) {
      this.startCrossfade();
    }
  }

  protected onVideoEnded(index: 0 | 1): void {
    if (index === this.activeVideoIndex()) {
      this.startCrossfade();
    }
  }

  private startCrossfade(): void {
    const currentIndex = this.activeVideoIndex();
    const nextIndex: 0 | 1 = currentIndex === 0 ? 1 : 0;
    const currentVideo = this.getVideo(currentIndex);
    const nextVideo = this.getVideo(nextIndex);

    if (!currentVideo || !nextVideo) {
      return;
    }

    this.isCrossfading = true;
    nextVideo.currentTime = 0.04;
    void nextVideo.play();
    this.activeVideoIndex.set(nextIndex);

    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    this.resetTimeout = setTimeout(() => {
      currentVideo.pause();
      currentVideo.currentTime = 0.04;
      this.isCrossfading = false;
    }, this.fadeDurationMs);
  }

  private getVideo(index: 0 | 1): HTMLVideoElement | null {
    return index === 0
      ? (this.videoARef?.nativeElement ?? null)
      : (this.videoBRef?.nativeElement ?? null);
  }
}
