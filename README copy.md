# Minimal API + React Fullstack

Ett fullstack-projekt-exempel för att lära sig .NET Minimal API med React. Använd gärna detta som utgångspunkt för ert projektarbete, men ta bort produkttabell ur databasen och "börja om" med egna komponenter ocxh stajling i frontend-kod.

## Teknikstack

**Frontend:** Vite + React + TypeScript + Bootstrap + Sass
**Backend:** .NET 8 Minimal API + DynData
**Databas:** MySQL

## Arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│              Vite + React + TypeScript                      │
│                 Bootstrap + Sass                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (REST API)
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                              │
│                   .NET 8 Minimal API                        │
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────────┐  │
│  │      App.cs         │    │     db-config.json         │  │
│  │  ─────────────────  │    │  ────────────────────────  │  │
│  │  debugOn            │    │  host                      │  │
│  │  detailedAclDebug   │    │  port                      │  │
│  │  aclOn              │    │  username                  │  │
│  │  isSpa              │    │  password                  │  │
│  │  port               │    │  database                  │  │
│  │  serverName         │    │  createTablesIfNotExist    │  │
│  │  frontendPath       │    │  seedDataIfEmpty           │  │
│  │  sessionLifeTimeHours│   └────────────────────────────┘  │
│  └─────────────────────┘                                    │
│                                                             │
│  DynData: Dynamisk C# (Obj, Arr, JSON, Log)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ MySqlConnector
┌─────────────────────▼───────────────────────────────────────┐
│                        MySQL                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ sessions │ │   acl    │ │  users   │ │ products │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Kom igång

1. Kopiera databas-konfigurationen och fyll i värden från läraren:
```bash
cp backend/db-config.template.json backend/db-config.json
```

2. Redigera `backend/db-config.json` med rätt uppgifter (host, port, username, password, database)

3. Installera och starta:
```bash
npm install
npm run dev
```

## Konfiguration

### App-inställningar (`backend/src/App.cs`)
- `aclOn` - Slå på/av ACL-systemet
- `debugOn` - Aktivera debug-loggning
- `sessionLifeTimeHours` - Sessionens livslängd

### Databas-inställningar (`backend/db-config.json`)
- `createTablesIfNotExist` - Skapa tabeller automatiskt vid uppstart
- `seedDataIfEmpty` - Fyll tabeller med exempeldata om de är tomma

## DynData

* Backend använder [DynData](https://www.nuget.org/packages/Dyndata) för att göra C# mer dynamiskt.
* Se `README-DYNDATA.md` för dokumentation.
