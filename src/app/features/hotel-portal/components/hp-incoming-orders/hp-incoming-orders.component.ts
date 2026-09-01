import { PortalPageHeaderComponent } from '../../../../shared/portal-page-header/portal-page-header.component';
// hp-incoming-orders.component.ts
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  HotelPortalService, Order
} from '../../services/hotel-portal.service';
import { HpIconComponent } from '../shared/hp-icon/hp-icon.component';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-hp-incoming-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, HpIconComponent, PortalPageHeaderComponent],
  templateUrl: './hp-incoming-orders.component.html',
  styleUrl:    './hp-incoming-orders.component.scss'
})
export class HpIncomingOrdersComponent implements OnInit, OnDestroy {
  orders     = signal<Order[]>([]);
  loading    = signal(true);
  busyId     = signal<number | null>(null);
  toast      = signal<string | null>(null);
  private interval: any;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private knownOrderIds = new Set<number>();
  private isFirstLoad = true;

  constructor(
    private service: HotelPortalService,
    private notif: NotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
    // Auto refresh every 10 seconds for fast order alerts
    this.interval = setInterval(() => this.loadOrders(), 10000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  loadOrders() {
    this.service.getOrders('pending').subscribe({
      next:  d => {
        // Detect newly arrived pending orders
        let hasNew = false;
        let newestOrderNum = '';

        for (const o of d) {
          if (!this.knownOrderIds.has(o.id)) {
            this.knownOrderIds.add(o.id);
            hasNew = true;
            newestOrderNum = o.order_number;
          }
        }

        if (hasNew && !this.isFirstLoad) {
          this.notif.notifyNewOrder(newestOrderNum);
        }

        this.isFirstLoad = false;
        this.orders.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  accept(id: number) {
    if (this.busyId()) return;
    this.notif.stopSound();
    this.busyId.set(id);
    this.service.updateOrderStatus(id, 'accepted').subscribe({
      next: () => {
        this.busyId.set(null);
        this.showToast('Order accepted');
        this.loadOrders();
      },
      error: () => this.busyId.set(null),
    });
  }

  reject(id: number) {
    this.notif.stopSound();
    if (confirm('Cancel this order?')) {
      this.service.updateOrderStatus(id, 'cancelled').subscribe(
        () => this.loadOrders()
      );
    }
  }

  private showToast(message: string) {
    this.toast.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 1800);
  }
}
