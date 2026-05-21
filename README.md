# Darts Practice (MVP)

Darts Practice on mobiili-ensin dartsin harjoitussovellus. Se ei ole X01-scoreri eika otteluiden pistelaskuri.

Paaidea:
- low-input treeni (ei dartti kerrallaan pakkoa)
- checkout-harjoittelu
- checkout speedrun / range timer
- around the clock (myos full sector)
- paikallinen stats-seuranta

UI on englanniksi. README voi olla suomeksi.

## Tuotesuunnan lahteet

Nama tiedostot ohjaavat MVP-suuntaa:
- `.codex/TASK.md`
- `docs/monetization-and-naming.md`

## Stack

- React 18
- TypeScript
- Vite 5
- LocalStorage (ei backendia, ei loginia)

## Implementoitu MVP

- Home / Training
  - Quick Checkout Practice
  - Checkout Speedrun
  - Around the Clock
  - Checkout Library (kevyt MVP-versio)
  - Stats
  - Settings

- Settings
  - Preferred double: D16 / D20 / D18 / D12 / Not sure
  - Default timer: Off / 10 / 20 / 30 sec
  - Theme: Dark / Light / Dim / System
  - Vibration feedback: On / Off
  - Throw pace:
    - Fast / Normal / Relaxed
    - Custom sec / 3 darts
    - 5 minute throw pace test (calibrated)

- Quick Checkout Practice
  - Range presetit 41-170
  - Timer Off / 10 / 20 / 30
  - Yksi painallus per yritys:
    - FINISHED / GOOD LEAVE / FAILED / BUST
  - SHOW ROUTE avaa reittivihjeen

- Checkout Speedrun
  - Preset range tai custom range
  - Sequential / Random
  - FINISHED / FAILED / BUST
  - Pause + Undo
  - Tulokset + basic PB-vertailu

- Around the Clock
  - Singles / Doubles / Trebles / Full Sector
  - Full Sector:
    - Bull
    - 25
    - Sx + Tx + Dx (+ toinen Dx valinnan mukaan)
  - TARGET DONE / SECTOR DONE
  - Pause + Undo
  - Tulokset + estimated darts (kun throw pace asetettu)

- Stats
  - Filter: 7 Days / 30 Days / Total
  - Checkout-, Speedrun- ja Around the Clock -nakyma paikallisesta datasta

## Projektin rakenne

- `src/screens`
- `src/components`
- `src/storage`
- `src/theme`
- `src/utils`
- `src/types`

## Asennus

```bash
npm install
```

Jos PowerShell estaa `npm`-komennon policy-syista:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
```

## Kehitys

```bash
npm run dev
```

## Tarkistus ja build

```bash
npm run typecheck
npm run build
```

`build` ajaa ensin typecheckin ja sitten Vite production buildin.

## Local storage

Sovellus tallentaa paikallisesti:
- user settings
- checkout attempts
- checkout speedrun sessions
- around the clock sessions

Dataa ei laheteta palvelimelle.
