import { Test, TestingModule } from '@nestjs/testing';
import { BrowserInfoService } from './browser_info.service';

describe('BrowserInfoService', () => {
  let service: BrowserInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrowserInfoService],
    }).compile();

    service = module.get<BrowserInfoService>(BrowserInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
