# Darts Practice (MVP)

Tama repositorio sisaltaa ensimmaisen toimivan MVP-version matalan syoton darts-harjoittelusovelluksesta.
UI on englanniksi, mutta dokumentaatio saa olla suomeksi.

## Stack

- React 18 + TypeScript
- Vite 5
- LocalStorage (ei backendia, ei kirjautumista)

## Ominaisuudet (MVP)

- Home / Training
  - Quick Checkout Practice
  - Checkout Speedrun
  - Around the Clock
  - Checkout Library (kevyt placeholder)
  - Stats
  - Settings

- Settings
  - Preferred double: D16 / D20 / D18 / D12 / Not sure
  - Default timer: Off / 10 / 20 / 30 sec
  - Theme: Dark / Light / Dim / System
  - Throw pace:
    - Fast / Normal / Relaxed
    - Custom sec / 3 darts
    - 5 minute throw pace test (calibrated)

- Quick Checkout Practice
  - Range presetit 41-170
  - Timer Off/10/20/30
  - Vain yhden napin syotto per yritys:
    - FINISHED / GOOD LEAVE / FAILED / BUST
  - SHOW ROUTE avaa reittivihjeen erikseen

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
  - Tulokset + estimated darts (jos throw pace asetettu)

- Stats
  - Filter: 7 Days / 30 Days / Total
  - Checkout, Speedrun ja Around the Clock -nakyma paikallisesta datasta

## Projektin kansiorakenne

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

Jos PowerShell estaa `npm`-komennon policy-syista, kayta:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
```

## Kehityspalvelin

```bash
npm run dev
```

## Build ja tarkistus

```bash
npm run typecheck
npm run build
```

Build ajaa ensin typecheckin ja sitten Vite-production buildin.

## Tallennus (LocalStorage)

Sovellus tallentaa paikallisesti:

- user settings
- checkout attempts
- checkout speedrun sessions
- around the clock sessions

Dataa ei laheteta palvelimelle.
