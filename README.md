# Darts Practice (MVP)

Darts Practice on mobiili-ensin dartsin harjoitussovellus. Se ei ole X01-scoreri eika otteluiden pistelaskuri.

Paaidea:
- low-input treeni (ei dartti kerrallaan pakkoa)
- checkout-harjoittelu
- checkout timed run / range timer
- around the clock (myos full sector)
- paikallinen stats-seuranta

UI on englanniksi. README voi olla suomeksi.

## Tuotesuunnan lahteet

Nama tiedostot ohjaavat MVP-suuntaa:
- `.codex/TASK.md` = pitkän aikavälin MVP-tuotesuunta
- `.codex/CURRENT_TASK.md` = tämän hetken tarkka Codex-toteutusohje
- `docs/monetization-and-naming.md` = nimeäminen ja mahdollinen tuleva monetisointi

Kun haluat Codexin jatkavan toteutusta, anna sille esimerkiksi tämä:

```text
Repo: wuolanne/darts-app
Branch: main

Read .codex/TASK.md and .codex/CURRENT_TASK.md first.
Implement the current task according to those files.
Do not ask confirmation for requirements that are already specified.
Do not add unrelated scope.
Run npm run typecheck and npm run build if available.
Fix failures caused by your changes.
Commit the result to main.

Final response: summarize files changed, commands run, and any known limitations.
```

## Stack

- React 18
- TypeScript
- Vite 5
- LocalStorage (ei backendia, ei loginia)

## Implementoitu MVP

- Home / Training
  - Quick Checkout Practice
  - Checkout Timed Run
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
  - Checkoutit alkavat 61:stä, ei alle 61 checkoutteja
  - Timer Off / 10 / 20 / 30
  - Low-input harjoittelu ja mini game -logiikka
  - Route hint ja single-hit continuation logiikka

- Checkout Timed Run
  - Preset range tai custom range
  - Sequential / Random
  - FINISHED / FAILED / BUST
  - Pause + Undo
  - Tulokset + basic PB-vertailu

- Around the Clock
  - Singles / Doubles / Trebles / Full Sector
  - Common Doubles
  - Custom target selection
  - TARGET DONE / SECTOR DONE
  - Pause + Undo
  - Tulokset + estimated darts (kun throw pace asetettu)

- Stats
  - Filter: 7 Days / 30 Days / Total
  - Checkout-, Timed Run- ja Around the Clock -näkymä paikallisesta datasta

## Tämän hetken tärkeimmät tarkennukset

Katso aina `.codex/CURRENT_TASK.md`, mutta pääkohdat ovat:

- Checkout-pelit eivät sisällä alle 61 finishiä.
- Checkout Library käyttää tiivistä route-näkymää.
- Finish 122 pitää näyttää muodossa: `Main: T18 -> T20 -> D4` ja `If S18: 104 left -> T18 -> Bull`.
- Ensimmäisen tikan single-missin jälkeen follow-up saa olla enintään 2 tikkaa.
- Bull on validi 50 pisteen lopetus.
- Timerit näytetään ilman desimaaleja.
- UI-termi on `Checkout Timed Run`, ei `Checkout Speedrun`.
- Around the Clockiin lisätään Common Doubles ja Custom.
- Light ja Dim theme eivät saa olla liian kirkkaita.

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
- checkout timed run sessions
- around the clock sessions
- custom Around the Clock target selections

Dataa ei lähetetä palvelimelle.
