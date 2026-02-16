import { AfterViewInit, Directive, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';

@Directive({
  selector: '[msInfiniteScroll]'
})
export class MatSelectInfiniteScrollDirective implements OnInit, OnDestroy, AfterViewInit {
  SELECT_ITEM_HEIGHT_EM = 3;
  @Input() threshold = '15%';
  @Input() debounceTime = 150;
  @Input() complete: boolean | undefined;
  @Output() infiniteScroll = new EventEmitter<void>();

  private panel: Element | undefined;
  private thrPx = 0;
  private thrPc = 0;
  private singleOptionHeight = this.SELECT_ITEM_HEIGHT_EM;

  private destroyed$ = new Subject<boolean>();

  constructor(
    private matSelect: MatSelect,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.evaluateThreshold();
  }

  ngAfterViewInit() {
    this.matSelect.openedChange.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((opened) => {
      if (opened) {
        // Wait for panel to be rendered
        setTimeout(() => {
          if (this.matSelect.panel) {
            this.panel = this.matSelect.panel.nativeElement;
            this.singleOptionHeight = this.getSelectItemHeightPx();
            this.registerScrollListener();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  evaluateThreshold() {
    if (this.threshold.lastIndexOf('%') > -1) {
      this.thrPx = 0;
      this.thrPc = (parseFloat(this.threshold) / 100);

    } else {
      this.thrPx = parseFloat(this.threshold);
      this.thrPc = 0;
    }
  }

  registerScrollListener() {
    if (!this.panel) return;
    fromEvent(this.panel, 'scroll').pipe(
      takeUntil(this.destroyed$),
      debounceTime(this.debounceTime),
      tap((event) => {
        this.handleScrollEvent(event);
      })
    ).subscribe();
  }

  handleScrollEvent(event: Event) {
    this.ngZone.runOutsideAngular(() => {
      if (this.complete || !this.panel) {
        return;
      }
      const countOfRenderedOptions = this.matSelect.options.length;
      const infiniteScrollDistance = this.singleOptionHeight * countOfRenderedOptions;
      const threshold = this.thrPc !== 0 ? (infiniteScrollDistance * this.thrPc) : this.thrPx;

      // Type assertion for scrollTop
      const scrollTop = (event.target && (event.target as HTMLElement).scrollTop) || 0;
      const scrolledDistance = this.panel.clientHeight + scrollTop;

      if ((scrolledDistance + threshold) >= infiniteScrollDistance) {
        this.ngZone.run(() => this.infiniteScroll.emit());
      }
    });
  }

  getSelectItemHeightPx(): number {
    if (!this.panel) return this.SELECT_ITEM_HEIGHT_EM * 16; // fallback to 16px font size
    return parseFloat(getComputedStyle(this.panel as Element).fontSize) * this.SELECT_ITEM_HEIGHT_EM;
  }

}