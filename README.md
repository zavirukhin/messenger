<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Переменные окружения

## Настройки JWT

- `JWT_SECRET`: Секретный ключ, используемый для подписи JWT токенов.
  - **Пример**: `MYSECRET`

## Настройки базы данных

### PostgreSQL

Следующие переменные окружения необходимы для настройки подключения к базе данных PostgreSQL:

- `DB_TYPE`: Тип базы данных (в данный момент поддерживается `postgres`).
  - **Пример**: `postgres`
  
- `DB_HOST`: Имя хоста сервера базы данных.
  - **Пример**: `localhost`
  
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

## Пример файла `.env`

```plaintext
JWT_SECRET='MYSECRET'

DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sa
DB_DATABASE=postgres
DB_LOGGING=true
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
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
