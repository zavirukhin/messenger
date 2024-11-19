import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  successCounter: Counter<string>;
  failureCounter: Counter<string>;
  requestDuration: Histogram<string>;

  messageSendDuration: Histogram<string>;
  messageSentCounter: Counter<string>;

  messageHistoryRequestDuration: Histogram<string>;

  constructor() {
    // Check if the metric is already registered before creating a new one
    this.successCounter =
      (register.getSingleMetric('auth_success_count') as Counter<string>) ||
      new Counter({
        name: 'auth_success_count',
        help: 'Количество успешных запросов на авторизацию',
        labelNames: ['method', 'status_code'],
      });

    this.failureCounter =
      (register.getSingleMetric('auth_failure_count') as Counter<string>) ||
      new Counter({
        name: 'auth_failure_count',
        help: 'Количество неуспешных запросов на авторизацию',
        labelNames: ['method', 'status_code'],
      });

    this.requestDuration =
      (register.getSingleMetric(
        'auth_request_duration_seconds',
      ) as Histogram<string>) ||
      new Histogram({
        name: 'auth_request_duration_seconds',
        help: 'Время выполнения запросов на авторизацию в секундах',
        labelNames: ['method', 'status_code'],
      });

    this.messageSendDuration =
      (register.getSingleMetric(
        'message_send_duration_seconds',
      ) as Histogram<string>) ||
      new Histogram({
        name: 'message_send_duration_seconds',
        help: 'Время, затраченное на отправку сообщения',
        labelNames: ['chatId'],
      });

    this.messageSentCounter =
      (register.getSingleMetric('messages_sent_total') as Counter<string>) ||
      new Counter({
        name: 'messages_sent_total',
        help: 'Общее количество сообщений, отправленных пользователями',
        labelNames: ['chatId'],
      });

    this.messageHistoryRequestDuration =
      (register.getSingleMetric(
        'message_history_request_duration_seconds',
      ) as Histogram<string>) ||
      new Histogram({
        name: 'message_history_request_duration_seconds',
        help: 'Время, затраченное на обработку запроса истории сообщений',
        labelNames: ['chatId'],
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
    return register.metrics();
  }
}
