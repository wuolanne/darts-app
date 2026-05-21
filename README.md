# FinishLab / Darts-harjoitussovellus

FinishLab on mobiili ensin suunniteltu dartsin harjoitussovellus. Sovelluksen tarkoitus on auttaa oikeassa treenissä, ei toimia otteluiden pistelaskurina.

Sovellus ei yritä korvata DartCounteria otteluissa. DartCounter voi jatkossakin olla paras työkalu peleihin ja pistelaskuun. FinishLab keskittyy niihin osa-alueisiin, joita monet scorer-sovellukset eivät tee tarpeeksi hyvin: checkout-harjoittelu, kelloa vastaan tehtävät treenit, sektorikohtainen Around the Clock, omat ennätykset ja vähäinen näpyttely treenin aikana.

**Huomio:** vaikka tämä README on suomeksi, itse sovelluksen käyttöliittymä tehdään MVP-vaiheessa englanniksi. Darts-termit ja kohdemarkkina ovat kansainvälisiä.

## Tuotteen positiointi

**Ei pistelaskuri. Ei pelkkä checkout-taulukko. Nopea dartsin treenisovellus lopetuksiin, rutiineihin ja kelloa vastaan harjoitteluun.**

Perusperiaatteet:

- Sovelluksen UI on MVP:ssä englanniksi.
- Mobiili ensin.
- Tumma, selkeä ja urheilullinen käyttöliittymä oletuksena.
- Käyttäjä voi vaihtaa teemaa: tumma, vaalea ja näiden väliin sijoittuvat väliteemat.
- Isot painikkeet, isot numerot ja yhden käden käyttö.
- Treenin aikana käyttäjän pitää katsoa taulua, ei puhelinta.
- Sovellus ei saa vaatia jokaisen heiton kirjaamista.
- Oletuskäyttö on low-input: yksi painallus, kun kohde, sektori tai yritys on valmis.
- Tarkempi heitto heitolta -kirjaus voidaan lisätä myöhemmin vapaaehtoisena ominaisuutena, mutta sitä ei saa koskaan vaatia.

## Teemat

Sovellukseen pitää tulla vaihdettavat teemat. Tämä on osa tuotteen käyttömukavuutta, koska käyttäjät treenaavat eri valaistuksissa: kotona, hallilla, pubissa, kirkkaassa päivänvalossa tai pimeässä treenihuoneessa.

MVP-teemat:

- **Dark** – oletusteema, tumma sporttinen näkymä.
- **Light** – selkeä vaalea teema kirkkaaseen käyttöön.
- **Dim** – tumman ja vaalean välimuoto, pehmeämpi ja vähemmän kontrastinen kuin Dark.
- **System** – seuraa laitteen omaa asetusta, jos toteutettavassa tekniikassa se on järkevää.

Teemojen pitää vaikuttaa koko sovellukseen:

- taustat
- kortit
- tekstit
- napit
- korostusvärit
- timer/progress-elementit
- stats-näkymät
- treeninäkymät

Toteutuksessa pitää käyttää keskitettyä theme/tokens-rakennetta. Värit eivät saa olla hajallaan yksittäisissä komponenteissa hardcodattuina. Uusia teemoja pitää voida lisätä myöhemmin helposti.

## Pääominaisuudet

### 1. Checkout Practice

DartZone-henkinen checkout-ajattelu, mutta omalla tuoteidentiteetillä ja omalla treenifilosofialla.

Sovellus antaa checkout-tilanteita ja auttaa pelaajaa oppimaan hyviä lopetusreittejä, bogey-numeroiden välttämistä ja suosikkituplaan perustuvaa ajattelua.

MVP-toiminnallisuus:

- Satunnaiset checkout-numerot valitulta alueelta.
- Tuetut alueet:
  - 41-60
  - 61-80
  - 81-100
  - 101-130
  - 131-170
- Käyttäjä voi valita suosikkituplan:
  - D16
  - D20
  - D18
  - D12
  - Custom myöhemmin
- Ajastinvaihtoehdot:
  - Off
  - 10 sekuntia
  - 20 sekuntia
  - 30 sekuntia
- Low-input-tulosnapit:
  - FINISHED
  - GOOD LEAVE
  - FAILED
  - BUST
  - SHOW ROUTE
- Sovelluksen pitää näyttää lyhyt ja selkeä palaute jokaisen yrityksen jälkeen.

Esimerkkejä palauteteksteistä:

- Good route
- Leaves D16 chain
- Avoids bogey number
- Leaves a finish under 60 after a single miss
- Bad leave
- Bust risk
- Does not match your preferred double route

Sovelluksen pitää välttää epäselviä termejä kuten “rest easy double”. Käytetään selkeää darts-englantia: finish, leave, bogey, preferred double, route, bust, setup.

### 2. Timed Around the Clock

Tämä on yksi sovelluksen tärkeimmistä erottavista ominaisuuksista. Sovelluksen pitää tukea kelloa vastaan tehtävää treeniä, jossa käyttäjä painaa nappia vasta, kun kohde tai sektori on valmis.

Perusmoodit:

- Around the Clock Singles
- Around the Clock Doubles
- Around the Clock Trebles
- Full Sector Around the Clock
- Custom Routine myöhemmin

Kelloa vastaan -treeneissä sovellus tallentaa:

- Kokonaisajan
- Aktiivisen ajan
- Taukoajan
- Ajan per kohde/sektori
- Nopeimman kohteen/sektorin
- Hitaimman kohteen/sektorin
- Keskimääräisen kohde-/sektoriajan
- Vertailun omaan ennätykseen
- Arvioidun heittomäärän, jos heittotahti on asetettu

### 3. Full Sector Around the Clock

Sovelluksen pitää tukea treenimoodia nimeltä **Full Sector Around the Clock**.

Oletusjärjestys:

1. Bull
2. 25
3. Sektori 1
4. Sektori 2
5. ...
6. Sektori 20

Bull:

- Käyttäjä suorittaa Bull-kohteen.
- Käyttäjä painaa TARGET DONE.

25:

- Käyttäjä suorittaa 25-kohteen.
- Käyttäjä painaa TARGET DONE.

Numeroiduissa sektoreissa käyttäjän pitää suorittaa valitut vaatimukset, esimerkiksi:

- S7 + T7 + D7
- tai S7 + T7 + D7 + D7

Tuplavaatimus pitää olla asetettava:

- 1 tuplaosuma
- 2 tuplaosumaa
- custom-määrä myöhemmin

Tärkeää: sovellus ei saa pyytää käyttäjää merkkaamaan yksittäisiä osumia. Sovellus näyttää vain, mitä pitää suorittaa. Käyttäjä painaa **SECTOR DONE**, kun koko sektori on valmis.

Esimerkkinäkymä:

```text
Full Sector Around the Clock

Current: 7

Complete:
S7 + T7 + D7 + D7

Sector time: 02:14
Total time: 18:42

[SECTOR DONE]
[PAUSE]
[UNDO]
```

### 4. Throw Pace ja Estimated Darts

Käyttäjä voi halutessaan asettaa oman heittotahdin. Tätä käytetään pitkissä treeneissä arvioimaan heitettyjen tikkojen määrä.

Asetukset:

- Fast: 7 sekuntia / 3 tikkaa
- Normal: 10 sekuntia / 3 tikkaa
- Relaxed: 13 sekuntia / 3 tikkaa
- Custom seconds per 3 darts
- Skip / not set

Sovelluksen pitää aina näyttää tämä arviona, ei tarkkana totuutena:

```text
Estimated darts: ~716
Based on 9 sec / 3 darts
```

Taukoaikaa ei saa laskea arvioituun heittomäärään.

Heittotahdin voi tarjota kevyenä asetuksena ensimmäisellä käynnistyksellä, mutta se ei saa estää sovelluksen käyttöä. Asetusta pitää voida muuttaa myöhemmin Settings-näkymässä.

### 5. Training Sessions

Sovellukseen pitää tulla valmiita treenisessioita, jotta käyttäjän ei tarvitse aina itse miettiä, mitä harjoitella.

Esimerkkejä:

- 15 min D16 Finishing
- 10 min Checkout Pressure
- 41-60 Checkout Speedrun
- 61-80 Checkout Speedrun
- Around the Clock Doubles
- Full Sector Around the Clock
- D16 Ladder
- Favourite Double Pressure

Esimerkki 15 minuutin treenistä:

```text
15 min D16 Finishing

3 min: D16 / D8 / D4 ladder
5 min: 41-60 checkouts
5 min: 61-80 D16 routes
2 min: favourite double pressure
```

### 6. Stats

Tilastojen pitää olla hyödyllisiä, mutta ei liian raskaita.

MVP-tilastot:

- Last 7 days
- Last 30 days
- Total
- Attempts
- Checkout success rate
- Good leave rate
- Bust rate
- Average attempt time
- Personal bests
- Around the Clock total times
- Sector breakdowns
- Fastest and slowest sectors
- Estimated darts for timed sessions

## MVP-näkymät

### Home / Training

Kortit:

- Quick Checkout Practice
- 15 Min Training
- Speedrun
- Around the Clock
- Checkout Library
- Stats
- Settings

### Checkout Practice

- Finish-numero
- Timer/progress bar, jos ajastin on päällä
- Preferred double -indikaattori
- Reittivihje Show route -napin takana
- Isot tulosnapit:
  - FINISHED
  - GOOD LEAVE
  - FAILED
  - BUST
  - SHOW ROUTE

### Around the Clock

- Moodin valinta
- Nykyinen kohde/sektori
- Kokonaisaika
- Nykyisen kohteen/sektorin aika
- Iso TARGET DONE tai SECTOR DONE -nappi
- Pause
- Undo

### Session Result

- Total time
- Active time
- Pause time
- Success rate, jos relevantti
- Estimated darts, jos heittotahti on asetettu
- Personal best comparison
- Fastest/slowest sector
- Full sector breakdown

### Settings

- Preferred double
- Throw pace
- Timer defaults
- Theme: Dark / Light / Dim / System
- Vibration feedback
- Data export/import myöhemmin

## Mitä MVP:hen ei rakenneta

Näitä ei rakenneta vielä:

- Online match play
- Täysi X01-scorer
- Kamera tai automaattinen pisteytys
- Cloud sync
- Leaderboardit
- Maksut/tilaukset
- Käyttäjätilit
- Raskas gamification
- Suora DartZone-UI-kopio
- Pixel-font/retro-kopio
- Pakollinen heitto heitolta -kirjaus

## Visuaalinen suunta

DartZonea ei kopioida visuaalisesti. DartZonessa on vahva pixel-fontti / tummansininen / retro game -tyyli. FinishLabille tehdään oma identiteetti:

- Tumma, selkeä ja moderni urheilullinen UI oletuksena
- Vaihdettavat teemat: Dark, Light, Dim ja System
- Isot ja helposti luettavat tekstit
- Selkeät kortit
- Korkea kontrasti, mutta Dim-teemassa pehmeämpi kontrasti
- Minimaalinen interaktio treenin aikana
- Isot napit, joita on helppo painaa nopeasti heittovuorojen välissä
- Teemat toteutetaan keskitetysti design tokenien kautta

## Työnimi

Mahdollisia nimiä:

- FinishLab
- CheckoutLab
- OcheTimer
- Darts Practice Timer

Nykyinen suosikki työnimeksi: **FinishLab**.
