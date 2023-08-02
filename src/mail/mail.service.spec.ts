import { Test, TestingModule } from '@nestjs/testing';
import { SESEmailService } from './ses.email.service';

describe('MailService', () => {
  let service: SESEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SESEmailService],
    }).compile();

    service = module.get<SESEmailService>(SESEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
