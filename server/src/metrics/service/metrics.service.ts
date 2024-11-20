import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, register } from 'prom-client';

@Injectable()
export class MetricsService {
  successCounter: Counter<string>;
  failureCounter: Counter<string>;
  requestDuration: Histogram<string>;

  messageSendDuration: Histogram<string>;
  messageSentCounter: Counter<string>;

  messageHistoryRequestDuration: Histogram<string>;

  registry: Registry;

  constructor() {
    this.registry = register;

    this.successCounter =
      (this.registry.getSingleMetric('auth_success_count') as Counter<string>) ||
      new Counter({
        name: 'auth_success_count',
        help: 'Количество успешных запросов на авторизацию',
        labelNames: ['method', 'status_code'],
        registers: [this.registry],
      });

    this.failureCounter =
      (this.registry.getSingleMetric('auth_failure_count') as Counter<string>) ||
      new Counter({
        name: 'auth_failure_count',
        help: 'Количество неуспешных запросов на авторизацию',
        labelNames: ['method', 'status_code'],
        registers: [this.registry],
      });

    this.requestDuration =
      (this.registry.getSingleMetric(
        'auth_request_duration_seconds',
      ) as Histogram<string>) ||
      new Histogram({
        name: 'auth_request_duration_seconds',
        help: 'Время выполнения запросов на авторизацию в секундах',
        labelNames: ['method', 'status_code'],
        registers: [this.registry],
      });

    this.messageSendDuration =
      (this.registry.getSingleMetric(
        'message_send_duration_seconds',
      ) as Histogram<string>) ||
      new Histogram({
        name: 'message_send_duration_seconds',
        help: 'Время, затраченное на отправку сообщения',
        labelNames: ['chatId'],
        registers: [this.registry],
      });

    this.messageSentCounter =
      (this.registry.getSingleMetric('messages_sent_total') as Counter<string>) ||
      new Counter({
        name: 'messages_sent_total',
        help: 'Общее количество сообщений, отправленных пользователями',
        labelNames: ['chatId'],
        registers: [this.registry],
      });

    this.messageHistoryRequestDuration =
      (this.registry.getSingleMetric(
        'message_history_request_duration_seconds',
      ) as Histogram<string>) ||
      new Histogram({
        name: 'message_history_request_duration_seconds',
        help: 'Время, затраченное на обработку запроса истории сообщений',
        labelNames: ['chatId'],
        registers: [this.registry],
      });
  }

  incrementAuthSuccess(method: string, statusCode: string) {
    this.successCounter.inc({ method, status_code: statusCode });
  }

  incrementAuthFailure(method: string, statusCode: string) {
    this.failureCounter.inc({ method, status_code: statusCode });
  }

  observeAuthRequestDuration(
    method: string,
    statusCode: string,
    durationInSeconds: number,
  ) {
    this.requestDuration.observe(
      { method, status_code: statusCode },
      durationInSeconds,
    );
  }

  observeMessageSendDuration(chatId: string, durationInSeconds: number) {
    this.messageSendDuration.observe({ chatId }, durationInSeconds);
  }

  observeMessageHistoryRequestDuration(
    chatId: string,
    durationInSeconds: number,
  ) {
    this.messageHistoryRequestDuration.observe({ chatId }, durationInSeconds);
  }

  incrementMessagesSent(chatId: string) {
    this.messageSentCounter.inc({ chatId });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
