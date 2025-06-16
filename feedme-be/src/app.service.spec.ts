import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';

describe('AppService', () => {
  let service: AppService;
  let mockGateway: AppGateway;

  beforeEach(async () => {
    jest.useFakeTimers();

    mockGateway = {
      emitWaitingUpdate: jest.fn(),
      emitPendingUpdate: jest.fn(),
      emitCompletedUpdate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, { provide: AppGateway, useValue: mockGateway }],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should add a normal order with correct ID', () => {
    service.addNormal();
    service.addNormal();
    const normalOrder = (service as any).orderQueue.find(
      (o) => o.id === 'A002',
    );
    expect(normalOrder).toBeDefined();
    expect(normalOrder.status).toBe('waiting');
    expect(mockGateway.emitWaitingUpdate).toHaveBeenCalled();
  });

  it('should add a VIP order with correct ID', () => {
    service.addVip();
    const vipOrder = (service as any).orderQueue.find((o) => o.id === 'VIP001');
    expect(vipOrder).toBeDefined();
    expect(vipOrder.status).toBe('waiting');
    expect(mockGateway.emitWaitingUpdate).toHaveBeenCalled();
  });

  it('should add a bot with correct ID', () => {
    service.addBot();
    const bots = (service as any).bots;
    expect(bots.length).toBe(1);
    expect(bots[0].id).toBe('Bot 1');
  });

  it('should assign VIP task before normal', async () => {
    await service.onModuleInit();

    service.addVip();
    service.addNormal();
    service.addBot();

    jest.advanceTimersByTime(1000);

    const bots = (service as any).bots;
    const vipOrder = (service as any).orderQueue.find((o) => o.id === 'VIP001');
    expect(bots[0].orderId).toBe('VIP001');
    expect(vipOrder.status).toBe('pending');
  });

  it('should requeue pending order when bot is removed', async () => {
    await service.onModuleInit();

    service.addVip();
    service.addBot();

    jest.advanceTimersByTime(1000);
    service.removeLastBot();

    const vipOrder = (service as any).orderQueue.find((o) => o.id === 'VIP001');
    expect(vipOrder.status).toBe('waiting');
    expect(vipOrder.assignedTo).toBeUndefined();
  });

  it('should complete an order after timeout', async () => {
    await service.onModuleInit();

    service.addVip();
    service.addBot();

    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(10000);

    const vipOrder = (service as any).orderQueue.find((o) => o.id === 'VIP001');
    expect(vipOrder.status).toBe('completed');
  });
});
