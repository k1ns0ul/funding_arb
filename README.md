## запуск

### команды

make build

make up

make logs

make down

make clean

make db-shell

make app-shell

### пример env
```tree
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=funding_arbitrage
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=true
```

## эндпоинты

межбиржевой арбитраж (показывает самые большие расхождения по фандинуу):

curl "http://localhost:3000/funding/opportunities?limit=5"

арбитраж USDT и coin margined:

curl "http://localhost:3000/funding/margin-type-opportunities?limit=5"


## выбраные биржи

MEXC GATE BYBIT KUCOIN

## cтруктура сервиса
```tree
funding-arbitrage-backend/src/contexts/funding/
├── entities/
│   ├── funding-rate.entity.ts
│   ├── arbitrage-opportunity.entity.ts  
│   └── margin-type-opportunity.entity.ts
│
├── clients/
│   ├── bybit.client.ts
│   ├── mexc.client.ts
│   ├── gate.client.ts
│   └── kucoin.client.ts
│
├── clients/interfaces/
│   ├── bybit-api.interface.ts
│   ├── mexc-api.interface.ts
│   ├── gate-api.interface.ts
│   └── kucoin-api.interface.ts
│
├── domain/interfaces/
│   ├── exchange-client.interface.ts
│   └── funding-rate-data.interface.ts
│
├── services/
│   ├── arbitrage-analyzer.service.ts
│   └── margin-type-analyzer.service.ts
│
├── repositories/
│   ├── funding-rate.repository.ts
│   ├── arbitrage-opportunity.repository.ts
│   └── margin-type-opportunity.repository.ts
│
├── commands/
│   ├── fetch-funding-rates.command.ts
│   ├── fetch-funding-rates.handler.ts
│   ├── analyze-arbitrage.command.ts
│   ├── analyze-arbitrage.handler.ts
│   ├── analyze-margin-type.command.ts
│   └── analyze-margin-type.handler.ts
│
├── queries/
│   ├── get-latest-opportunities.query.ts
│   ├── get-latest-opportunities.handler.ts
│   ├── get-latest-margin-opportunities.query.ts
│   └── get-latest-margin-opportunities.handler.ts
│
├── controllers/
│   └── funding.controller.ts
│
├── dtos/
│   ├── get-opportunities.dto.ts
│   ├── opportunity-response.dto.ts
│   └── margin-opportunity-response.dto.ts
│
├── schedulers/
│   └── funding-fetcher.scheduler.ts
│
└── funding.module.ts
```

## ключевые решения

### архитектура
1. CQRS - разделение логики (команды для анализа, запросы для чтения)
2. Typeorm и отдельные энтити под каждую стратегию
3. клиенты под каждую биржу с унифицированным интерфейсом

### стратегии

1. межбиржевой фандинг арб
- приведение символов к одному формату (BTCUSDT, BTC_USDT к BTC)
- поиск максимального спреда фандинга для одного актива
- позиция: long с низким фандингом, short с высоким

Пример вывода:
1. BTC | spread: +0.0543%
--------------------------------------------------------------------------------
BYBIT          | 43000.00      | +0.0100%
MEXC           | 43010.00      | -0.0443%

2. арбитраж USDT и coin margined
- сравнение USDT-margined и Coin-margined контрактов
- пример BTCUSDT perp vs BTCUSD perp на одной бирже Bybit

Пример вывода:
1. BTC
--------------------------------------------------------------------------------
spread: +0.0533%
usdt contract: BTCUSDT | rate: +0.0342%
coin contract: BTCUSD  | rate: -0.0191%
recommended: Long BTCUSD / Short BTCUSDT
hedge required: true


2. ENSO | spread: +0.1418%
--------------------------------------------------------------------------------
exchange        | price           | funding 1h
--------------------------------------------------------------------------------
BYBIT           | 1.3085          | -0.0118%
KUCOIN          | 1.3056          | -0.0463%
MEXC            | 1.2950          | -0.0568%
GATE            | 1.2968          | -0.1537%