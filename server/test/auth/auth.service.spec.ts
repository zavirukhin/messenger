import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/service/auth.service';
import { MyJwtService } from '../../src/jwt/service/jwt.service';
import { CodeService } from '../../src/auth/service/code.service';
import { MetricsService } from '../../src/metrics/service/metrics.service';
import { User } from '../../src/entity/user.entity';
import { UserNotFoundException } from '../../src/exception/user-not-found.exception';
import { UserAlreadyExistsException } from '../../src/exception/user-already-exists.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
const mockCodeService = {
  sendCode: jest.fn(),
  validateCode: jest.fn(),
  deleteCode: jest.fn(),
};

const mockJwtService = {
  generateToken: jest.fn(),
};

const mockMetricsService = {
  incrementAuthSuccess: jest.fn(),
  incrementAuthFailure: jest.fn(),
  observeAuthRequestDuration: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CodeService, useValue: mockCodeService },
        { provide: MyJwtService, useValue: mockJwtService },
        { provide: MetricsService, useValue: mockMetricsService },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendCode', () => {
    it('Если вызывается метод sendCode, то он должен передать номер телефона в codeService', async () => {
      const phone = '+1234567890';
      await authService.sendCode(phone);

      expect(mockCodeService.sendCode).toHaveBeenCalledWith(phone);
    });
  });

  describe('validateCode', () => {
    it('Если код подтверждения правильный, то возвращается токен', async () => {
      const phone = '+1234567890';
      const code = '123456';
      const user = { id: 1, phone };
      mockCodeService.validateCode.mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue(user); // Используем mock для findOne
      mockJwtService.generateToken.mockResolvedValue('jwt-token');

      const result = await authService.validateCode(phone, code);

      expect(result.token).toBe('jwt-token');
      expect(mockMetricsService.incrementAuthSuccess).toHaveBeenCalledWith(
        'POST',
        '200',
      );
      expect(mockMetricsService.observeAuthRequestDuration).toHaveBeenCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { phone },
      });
    });

    it('Если пользователь не найден, то выбрасывается исключение UserNotFoundException', async () => {
      const phone = '+1234567890';
      const code = '123456';
      mockCodeService.validateCode.mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.validateCode(phone, code),
      ).rejects.toBeInstanceOf(UserNotFoundException);
      expect(mockMetricsService.incrementAuthFailure).toHaveBeenCalledWith(
        'POST',
        '404',
      );
    });
  });

  describe('create', () => {
    it('Если пользователь создается, то возвращается токен', async () => {
      const phone = '+1234567890';
      const code = '123456';
      const firstName = 'John';
      const lastName = 'Doe';
      const user = { id: 1, phone };
      mockCodeService.validateCode.mockResolvedValue(true);
      mockUserRepository.count.mockResolvedValue(0);
      mockUserRepository.save.mockResolvedValue(user);
      mockJwtService.generateToken.mockResolvedValue('jwt-token');

      const result = await authService.create(phone, code, firstName, lastName);

      expect(result.token).toBe('jwt-token');
      expect(mockMetricsService.incrementAuthSuccess).toHaveBeenCalledWith(
        'POST',
        '200',
      );
      expect(mockMetricsService.observeAuthRequestDuration).toHaveBeenCalled();
      expect(mockUserRepository.count).toHaveBeenCalledWith({
        where: { phone },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        phone,
        firstName,
        lastName,
        lastActivity: expect.any(Date),
      });
    });

    it('Если пользователь с таким номером телефона уже существует, то выбрасывается исключение UserAlreadyExistsException', async () => {
      const phone = '+1234567890';
      const code = '123456';
      const firstName = 'John';
      const lastName = 'Doe';
      mockCodeService.validateCode.mockResolvedValue(true);
      mockUserRepository.count.mockResolvedValue(1);

      await expect(
        authService.create(phone, code, firstName, lastName),
      ).rejects.toBeInstanceOf(UserAlreadyExistsException);
      expect(mockUserRepository.count).toHaveBeenCalledWith({
        where: { phone },
      });
    });
  });
});
