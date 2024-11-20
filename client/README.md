
# Мессенджер
<a  alt="Nx logo"  href="https://nx.dev"  target="_blank"  rel="noreferrer"><img  src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png"  width="45"></a>

# Переменные окружения
### Sentry
- `SENTRY_AUTH_TOKEN`: Токен авторизации Sentry, нужен для загрузки source-map файлов на сервер Sentry при сборки
### Установка URL API
#### Путь настройки окрыжения
	src/app/environments

- `environment.development.ts`: Параметры приложения development
- `environment.ts`: Параметры приложения production

## Установка зависимостей
```bash
$  npm  install
```
## Компиляция и запуск проекта
```bash
# development
$  nx  server

# production
$ nx build
```
## Запуск линтинга
```bash
# Всего приложения
$ nx run-many -t lint

# Компонента приложения
$ nx lint ..

```
## Запуск тестов
```bash
# Всего приложения
$ nx run-many -t test

# Компонента приложения
$ nx test ..
```

## Компоненты приложения
- `Social` - Основной компоненты приложения
- `Authorization` - Компонент приложения отвечающий за авторизацию
- `Messenger` - Компонент приложения отвечающий за разделы мессенджера
- `Shared` - Компонент содержащий зависимости которые используются в рамках всего приложения