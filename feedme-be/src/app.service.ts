import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AppGateway } from './app.gateway';

type OrderStatus = 'waiting' | 'pending' | 'completed';

interface Order {
  id: string;
  status: OrderStatus;
  assignedTo?: string;
}

interface Bot {
  id: string;
  name: string;
  orderId: string;
}

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly gateway: AppGateway) {}

  private intervalRef: ReturnType<typeof setInterval>;
  private timeoutRefs: ReturnType<typeof setTimeout>[] = [];
  private bots: Bot[] = [];
  private orderQueue: Order[] = [];

  private normalCounter = 0;
  private vipCounter = 0;

  onModuleInit() {
    //rerun every 1s to check order assignment
    this.intervalRef = setInterval(() => {
      for (const bot of this.bots) {
        if (!bot.orderId) {
          const nextOrder = this.callNext();
          if (nextOrder) {
            nextOrder.status = 'pending';
            nextOrder.assignedTo = bot.id;
            bot.orderId = nextOrder.id;

            console.log(`${bot.id} running on ${nextOrder.id}`);
            //10s to complete the order
            const timeout = setTimeout(() => {
              this.completeOrder(bot.id);
              this.timeoutRefs = this.timeoutRefs.filter(
                (ref) => ref !== timeout,
              );
            }, 10000);

            this.timeoutRefs.push(timeout);
            this.emitOrderUpdate();
          }
        }
      }
    }, 1000);
  }

  //clear timer callback to release runtime resource
  onModuleDestroy() {
    clearInterval(this.intervalRef);
    this.timeoutRefs.forEach(clearTimeout);
  }

  //return VIP order first, then normal order
  private callNext(): Order | undefined {
    const vipOrder = this.orderQueue.find(
      (t) => t.status === 'waiting' && t.id.startsWith('VIP'),
    );
    if (vipOrder) {
      vipOrder.status = 'pending';
      return vipOrder;
    }

    const normalOrder = this.orderQueue.find(
      (t) => t.status === 'waiting' && t.id.startsWith('A'),
    );
    if (normalOrder) {
      normalOrder.status = 'pending';
      return normalOrder;
    }

    return undefined;
  }

  addNormal(): void {
    this.normalCounter++;
    const id = `A${String(this.normalCounter).padStart(3, '0')}`;
    this.orderQueue.push({ id, status: 'waiting' });
    this.emitOrderUpdate();
  }

  addVip(): void {
    this.vipCounter++;
    const id = `VIP${String(this.vipCounter).padStart(3, '0')}`;
    this.orderQueue.push({ id, status: 'waiting' });
    this.emitOrderUpdate();
  }

  addBot(): void {
    const id = `Bot ${this.bots.length + 1}`;
    this.bots.push({ id, name: id, orderId: '' });
  }

  //remove last added bot and change the order back to waiting if exist
  removeLastBot(): void {
    const removedBot = this.bots.pop();
    if (removedBot?.orderId) {
      const order = this.orderQueue.find((t) => t.id === removedBot.orderId);
      if (order && order.status === 'pending') {
        order.status = 'waiting';
        order.assignedTo = undefined;
        this.emitOrderUpdate();
      }
    }
  }

  private completeOrder(botId: string): void {
    const bot = this.bots.find((b) => b.id === botId);
    if (bot?.orderId) {
      const order = this.orderQueue.find((t) => t.id === bot.orderId);
      if (order) {
        order.status = 'completed';
        order.assignedTo = undefined;
      }
      bot.orderId = '';
      this.emitOrderUpdate();
    }
  }

  //update frontend socket
  private emitOrderUpdate() {
    const waiting = this.orderQueue.filter((t) => t.status === 'waiting');
    const pending = this.orderQueue.filter((t) => t.status === 'pending');
    const completed = this.orderQueue.filter((t) => t.status === 'completed');

    this.gateway.emitWaitingUpdate(waiting);
    this.gateway.emitPendingUpdate(pending);
    this.gateway.emitCompletedUpdate(completed);
  }
}
