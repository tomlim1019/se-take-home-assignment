import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AppGateway,
          useValue: {
            emitWaitingUpdate: jest.fn(),
            emitPendingUpdate: jest.fn(),
            emitCompletedUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get(AppController);
  });

  describe('addNormal', () => {
    it('should return "Normal Order Added"', () => {
      const result = appController.addNormal({ id: 'A001' });
      expect(result).toEqual({ message: 'Normal Order Added' });
    });
  });

  describe('addVip', () => {
    it('should return "VIP Order Added"', () => {
      const result = appController.addVip({ id: 'VIP001' });
      expect(result).toEqual({ message: 'VIP Order Added' });
    });
  });

  describe('addBot', () => {
    it('should return "Bot Added"', () => {
      const result = appController.addBot();
      expect(result).toEqual({ message: 'Bot Added' });
    });
  });

  describe('removeBot', () => {
    it('should return "Bot Removed"', () => {
      const result = appController.removeLastBot();
      expect(result).toEqual({ message: 'Bot Removed' });
    });
  });
});
