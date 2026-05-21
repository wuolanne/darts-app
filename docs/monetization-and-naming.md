# Nimeäminen ja ansaintamalli

Tämä dokumentti kuvaa Darts-sovelluksen alustavan nimeämisen ja ansaintamallin linjauksen.

## Nimen periaate

Sovelluksen nimen pitää alkaa sanalla **Darts**, koska käyttäjät hakevat tämän tyyppisiä sovelluksia storesta todennäköisesti sanalla “darts”.

Nimen kannattaa olla mieluiten yksi sana tai vähintään sellainen, joka tuntuu yhdeltä brändiltä.

## Yhden sanan nimiehdotuksia

- DartsLab
- DartsFlow
- DartsTimer
- DartsTrainer
- DartsFinish
- DartsCheckouts
- DartsRoutine
- DartsClock
- DartsOche
- DartsTempo
- DartsSprint
- DartsTrack
- DartsFocus
- DartsGrind
- DartsEdge
- DartsLevel
- DartsQuest
- DartsPilot
- DartsMeter
- DartsForge

Tämän hetken parhaat vaihtoehdot:

1. **DartsLab**
2. **DartsTrainer**
3. **DartsTimer**
4. **DartsFlow**
5. **DartsFinish**

Suositus MVP:lle: **DartsLab**.

Perustelu: lyhyt, helppo muistaa, alkaa hakusanalla Darts, ei rajaa sovellusta pelkkään checkoutiin tai kelloon, ja antaa tilaa myöhemmille ominaisuuksille.

## Ansaintamallin periaate

MVP-vaiheessa ei rakenneta maksullista Pro-mallia heti. Ensin pitää saada käyttäjiä, testata treeniflow, kerätä palautetta ja varmistaa, että sovellus ratkaisee oikean ongelman.

DartZonen kaltainen support/donation-popup on hyvä myöhempään vaiheeseen, mutta sitä ei kannata näyttää liian aikaisin aggressiivisesti. Uusi käyttäjä pitää ensin saada kokemaan hyöty.

## MVP:n linjaus

MVP:ssä:

- ei maksumuuria
- ei Pro-tilausta
- ei aggressiivista donation-popupia
- ei pakollista kirjautumista
- kaikki tärkeimmät treenimoodit käytettävissä ilmaiseksi
- voidaan jättää tekninen valmius myöhempää Pro/support-mallia varten

Tavoite MVP:ssä:

1. saada appi käyttöön
2. saada treenimoodit tuntumaan paremmilta kuin nykyiset vaihtoehdot
3. saada käyttäjät palaamaan sovellukseen
4. kerätä palautetta siitä, mistä ominaisuuksista käyttäjät oikeasti maksaisivat

## Myöhempi Pro / Support -malli

Kun sovelluksella on käyttäjiä, voidaan lisätä kevyt maksullinen malli.

Suositeltu malli:

- ilmainen perusversio pysyy aidosti hyödyllisenä
- maksullinen Pro avaa syvemmät tilastot, enemmän historiaa ja customointia
- kertamaksu tai vuosimaksu on todennäköisesti parempi kuin kallis kuukausitilaus
- vapaaehtoinen “Support developer” voi olla mukana, mutta ei heti ensimmäisenä käyttökokemuksena

## Mikä on ilmaista

Ilmaiseksi pitäisi jäädä:

- Quick Checkout Practice
- Around the Clock perusmoodit
- Full Sector Around the Clock perusversiona
- Checkout Speedrun perusalueilla
- perusstatistiikka 7 / 30 päivää / total
- preferred double
- throw pace ja 5 minuutin kalibrointi
- teemat: Dark / Light / Dim / System

## Mahdolliset Pro-ominaisuudet myöhemmin

Pro-ominaisuuksiksi sopisivat:

- rajaton historiadata ja tarkemmat trendit
- syvemmät sektorikohtaiset analyysit
- custom checkout range -kirjastot
- custom Around the Clock -järjestykset
- custom sektorivaatimukset
- omat treenirutiinit
- datan export/import
- cloud sync
- useampi profiili samalla laitteella
- advanced checkout route preferences
- personal best history ja kehityskäyrät
- laajempi checkout-kirjasto ja selitykset
- Pro-teemat tai lisäkorostusvärit

## Proksi ei kannata laittaa heti

Meillä on jo MVP:ssä ominaisuuksia, joista voisi teoriassa pyytää rahaa, esimerkiksi:

- Full Sector Around the Clock
- Checkout Speedrun / Range Timer
- 5 minuutin heittotahdin kalibrointi
- sektorikohtaiset ajat
- personal best -vertailut

Näitä ei kuitenkaan kannata lukita heti maksun taakse, koska ne ovat myös sovelluksen koukku ja erottautumistekijä. Ensin kannattaa todistaa, että käyttäjät pitävät näistä ja palaavat käyttämään sovellusta.

## Kevyt myöhempi donation/support-ajatus

Kun käyttäjä on käyttänyt sovellusta jonkin aikaa, voidaan näyttää kevyt vapaaehtoinen tuki:

- ei heti ensimmäisellä käyttökerralla
- ei kesken treenin
- ei liian usein
- vasta onnistuneen session tai useamman käyttökerran jälkeen

Esimerkkitasot:

- Coffee: 3,99 €
- Supporter: 9,99 €
- Champion: 24,99 €

Tekstin pitää olla oma, ei DartZonen kopio.

## Päätös tällä hetkellä

Rakennetaan ensin hyvä ilmainen MVP nimellä **DartsLab** tai työnimellä **Darts FinishLab**.

Pro/support-malli jätetään myöhemmäksi, mutta arkkitehtuuri tehdään niin, että maksulliset ominaisuudet voidaan lisätä myöhemmin ilman isoa uudelleenkirjoitusta.
