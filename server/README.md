# Курсовая работа на курсе Т-Банк Финтех

### Студент:  
*Ярощук Никита Сергеевич*

### Название веб-приложения:  
*ANIMessenger Backend*

### Ссылка на общедоступный адрес веб-приложения:  
[*API документация*](http://130.193.56.129/api-docs)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Переменные окружения

## Настройки JWT

- `JWT_SECRET`: Секретный ключ, используемый для подписи JWT токенов.
  - **Пример**: `MYSECRET`

- `JWT_EXPIRATION`: Длительность жизни JWT токена.
  - **Пример**: `5m`

## Настройки базы данных

### PostgreSQL

Следующие переменные окружения необходимы для настройки подключения к базе данных PostgreSQL:

- `DB_TYPE`: Тип базы данных (в данный момент поддерживается `postgres`).
  - **Пример**: `postgres`
  
- `DB_HOST`: Имя хоста сервера базы данных.
  - **Пример**: `localhost` (для Docker выставлять как db)
  
- `DB_PORT`: Номер порта, на котором работает сервер базы данных.
  - **Пример**: `5432`
  
- `DB_USERNAME`: Имя пользователя для подключения к базе данных.
  - **Пример**: `postgres`
  
- `DB_PASSWORD`: Пароль для указанного имени пользователя.
  - **Пример**: `sa`
  
- `DB_DATABASE`: Имя базы данных, к которой нужно подключиться.
  - **Пример**: `postgres`
  
- `DB_LOGGING`: Включает или отключает логирование запросов к базе данных.
  - **Пример**: `true` (установите `false`, чтобы отключить логирование)
  
- `DB_SYNCHRONIZE`: Если установлено в `true`, схема базы данных будет автоматически синхронизироваться с сущностями.
  - **Пример**: `false`
  
- `DB_MIGRATIONS_RUN`: Если установлено в `true`, миграции будут автоматически выполняться при запуске приложения.
  - **Пример**: `false`

## Настройки Twilio

- `TWILIO_ACCOUNT_SID`: Уникальный идентификатор аккаунта Twilio.
  - **Пример**: `AC81219e******`
  
- `TWILIO_AUTH_TOKEN`: Токен авторизации для API Twilio.
  - **Пример**: `84bc721b74362********`
  
- `TWILIO_MESSAGING_SERVICE_ID`: Уникальный идентификатор сервиса для отправки сообщений Twilio.
  - **Пример**: `VA9b8958********`
  
- `TWILIO_IS_ACTIVE`: Флаг для активации или деактивации использования Twilio в приложении.
  - **Пример**: `true` (установите `false`, чтобы отключить Twilio ("Режим для разработки"))
  
- `FALLBACK_CODE`: Код для использования при авторизации если в twillio ошибка.
  - **Пример**: `111111`

## Настройки WebSocket

Следующие переменные окружения необходимы для настройки WebSocket:

- `SOCKET_ALLOWED_ORIGINS`: Указывает допустимые источники для WebSocket соединений.
  - **Пример**: `http://localhost:3000`

## Настройки Grafana

Следующие переменные окружения необходимы для настройки Grafana:

- `GF_SECURITY_ADMIN_PASSWORD`: Устанавливает пароль для входа по умолчанию в Grafana.
  - **Пример**: `admin`
  
## Пример файла `.env`

```plaintext
JWT_SECRET='MYSECRET'
JWT_EXPIRATION='5m'

DB_TYPE=postgres
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sa
DB_DATABASE=postgres
DB_LOGGING=true
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true

TWILIO_ACCOUNT_SID=AC81219ede1**********************
TWILIO_AUTH_TOKEN=84bc721b***********
TWILIO_MESSAGING_SERVICE_ID=VA9b8958********
TWILIO_IS_ACTIVE=true

SOCKET_ALLOWED_ORIGINS=http://localhost:3000

GF_SECURITY_ADMIN_PASSWORD=admin
```

## Установка зависимостей

```bash
$ npm install
```

## Произвести миграцию БД если DB_MIGRATIONS_RUN=false

```bash
$ npm migration:run
```

## Компиляция и запуск проекта 

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Доступ к документации

Документация API доступна по следующему адресу: http://localhost:3000/api-docs

Grafana: доступен по адресу: http://localhost:3001 для мониторинга и визуализации метрик.

Prometheus: доступен по адресу: http://localhost:9090 для сбора и анализа метрик.