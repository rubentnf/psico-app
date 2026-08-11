import { Test, TestingModule } from '@nestjs/testing';
import { SessionTypesController } from './session-types.controller';

describe('SessionTypesController', () => {
  let controller: SessionTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionTypesController],
    }).compile();

    controller = module.get<SessionTypesController>(SessionTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
