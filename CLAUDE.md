# Blendie — brief per Claude Code (v1)

Blendie è una PWA gratuita, in italiano e inglese, che dice se due ingredienti skincare si possono usare insieme. Ogni risultato mostra un livello (semaforo), una spiegazione, un consiglio pratico, su cosa si basa e le fonti. Niente claim: solo scienza, sempre con le fonti visibili.

Proprietaria: Sandra. Lei non è una sviluppatrice: spiegale ogni passo in modo semplice.

## 1. Regole fisse

- **I contenuti non si toccano.** Tutti i testi (schede, abbinamenti, miti, guide, disclaimer) stanno in `data/data.json` e li decide Sandra. Non riscrivere, non accorciare, non aggiungere frasi tue. Se un testo ti sembra sbagliato, segnalalo e chiedi.
- **Niente account in v1.** Nessun backend, nessun login. Tutto quello che l'utente salva resta sul suo dispositivo. Gli account (Firebase) arrivano nella v2.
- **Niente dati raccolti**, a parte il conteggio visite anonimo con GoatCounter.
- **Niente framework e niente build.** HTML, CSS e JavaScript semplici, pubblicati su GitHub Pages dalla cartella principale del branch `main`.

## 2. I dati (`data/data.json`)

- `levels`: i 5 stati del risultato, con testi IT/EN, icona e colori (`green`, `yellow`, `red`, `unknown`, `drug`).
- `basis`: le etichette "Basato su" (studi, studi di laboratorio, parere di esperti, autorità sanitarie...).
- `categories`: le categorie per i filtri.
- `groups`: gruppi di ingredienti (solo di riferimento).
- `ingredients`: 27 schede. Campi: `id`, `name {it,en}`, `synonyms[]`, `inci[]`, `categories[]`, `drug` (true = farmaco), `what`, `percentages`, `howto`, `warning` (tutti `{it,en}`, possono essere vuoti: in quel caso non mostrare la sezione), `studies {it[],en[]}`, `sources [{title,url}]`, `latest {it,en}`. L'acido ialuronico ha in più `notAcid {it,en}`, da mostrare in evidenza.
- `pairs`: abbinamenti con fonte. Ogni voce ha `a[]` e `b[]` (liste di id), `level`, `basis`, `advice {it,en}`, `sources[]`. Una voce vale per ogni combinazione tra un id di `a` e uno di `b`, in entrambi i sensi.
- `myths`, `guides` (`inci`, `formats`), `disclaimer`.
- `about` (testi di Info: cos'è Blendie, regole sulle fonti, nota su "Basato su", nota sui farmaci) e `privacy` (punti della pagina Privacy).

### Logica del confronto

Dati due ingredienti X e Y:
1. Se X e Y sono lo stesso ingrediente, non permettere il confronto.
2. Se almeno uno è un farmaco (`drug: true`) → stato `drug`: nessun abbinamento, mostra la nota di `levels.drug` e il link alla scheda.
3. Se esiste una voce in `pairs` con X in `a` e Y in `b`, o viceversa → mostra quella.
4. Altrimenti → stato `unknown` ("Nessuna interazione nota", colore lilla), con la sua nota.

### Ricerca

Trova un ingrediente cercando nel nome IT e EN, nei sinonimi e nei nomi INCI. Senza distinzione tra maiuscole e minuscole e ignorando gli accenti ("retinolo" = "Retinolo", "acido ialuronico" = "acido ialurónico").

## 3. Schermate della v1

1. **Home (Confronta)**: due campi "Ingrediente 1" e "Ingrediente 2" con ricerca, e il bottone "Controlla".
2. **Risultato**: il livello (cerchio colorato + icona + testo, mai solo il colore), il consiglio, la riga "Basato su", le fonti cliccabili e il disclaimer in piccolo. Bottone per salvare l'abbinamento nei Preferiti.
3. **Ingredienti**: tutti gli ingredienti in **ordine alfabetico**, con il nome più diffuso nella lingua scelta. Lente di ricerca in alto e filtri per categoria (chip), es. "Barriera e idratazione", "Esfolianti (acidi)". I farmaci hanno un'etichetta "Farmaco".
4. **Scheda ingrediente**: categorie, sinonimi e INCI, Cosa fa, Percentuali, Come usarlo, Attenzione, poi **"Gli studi" in una tendina chiusa** (`<details>`), fonti, "Studio più recente". Bottone "Controlla un abbinamento" (apre la Home con questo ingrediente già scelto) e bottone per salvarlo nei Preferiti. Per i farmaci: niente bottone di abbinamento, solo la nota di `levels.drug`.
5. **I miei prodotti** (salvati sul dispositivo): l'utente scrive il nome di un prodotto (es. "Siero The Ordinary Niacinamide") e sceglie quali ingredienti attivi contiene, solo tra quelli della lista. Può modificare e cancellare i prodotti (con conferma prima di cancellare). Toccando un ingrediente del prodotto si apre Confronta con quell'ingrediente già scelto, e l'utente sceglie il secondo.
6. **Preferiti** (salvati sul dispositivo): abbinamenti e singoli ingredienti salvati, anche quelli che l'utente non usa ancora.
7. **Falsi miti**: una scheda per mito (cosa si dice, cosa è vero, fonti).
8. **Guide**: "Come leggere l'INCI" e "I formati" (tabella).
9. **Info**: cos'è Blendie, come funzionano i livelli, regole sulle fonti, disclaimer, privacy, lingua. Tutti i testi sono in `data.json` (`about`, `levels`, `basis`, `disclaimer`, `privacy`).

Navigazione: una barra in basso con Confronta, Ingredienti, I miei prodotti, Preferiti, Altro (Falsi miti, Guide, Info).

## 4. Lingua

Italiano e inglese. All'avvio usa la lingua del telefono (italiano se è italiano, altrimenti inglese); l'utente può cambiarla in Info. La scelta si salva sul dispositivo. Tutti i testi dell'interfaccia (bottoni, titoli, messaggi) vanno in un file separato, es. `i18n.js`, sempre IT + EN.

## 5. Salvataggio sul dispositivo

`localStorage`, con ogni lettura e scrittura dentro `try/catch`: se non funziona (navigazione privata), l'app deve funzionare lo stesso. Nella v2 questi dati passeranno all'account: tieni le funzioni di salvataggio in un unico file (es. `storage.js`), così sarà facile cambiarle.

## 6. Design

Semplice e pulito, colori pastello, un pochino girly ma niente fronzoli. Solo tema chiaro in v1 (il tema scuro è in v2).

Colori del brand:
- Sfondo `#FFF9F4`, card `#FFFFFF`
- Accento rosa `#FFD6DB`, bottoni lilla `#E9D8FB`, salvia `#A7D3A8`
- Testo `#5B4B43`

Semaforo (già in `data.json` → `levels`): colore pieno nel cerchio, sfondo tenue della card, testo scuro.
- Vanno d'accordo: `#6FBF8E` / `#E4F4EA` / `#2C6A47`, icona spunta
- Hanno bisogno dei loro spazi: `#F2A950` / `#FDEFD9` / `#875315`, icona orologio
- Non vanno d'accordo: `#EE7F72` / `#FDE5E1` / `#A2392E`, icona X
- Nessuna interazione nota: `#A98BD9` / `#EFE7FA` / `#5E4396`, icona "i"

Font: **Baloo 2** per i titoli, **Nunito** per il testo, con fallback di sistema. I file dei font vanno **dentro l'app** (`assets/fonts/`), non caricati da Google Fonts: così funzionano offline e aprire l'app non manda dati a Google. Angoli molto arrotondati (16-24px), ombre morbide e leggere, icone lineari.

Logo: un coccodrillo con fette di cetriolo sugli occhi e bigodini. Versione trasparente per il logo dentro l'app; versione con sfondo crema per le icone del telefono (su iPhone le icone trasparenti diventano nere), con margine per le icone Android che vengono ritagliate.

Accessibilità: il risultato non deve mai dipendere solo dal colore (colore + icona + testo), contrasto leggibile, focus visibile, bottoni grandi abbastanza per il pollice.

## 7. PWA e offline

- `manifest.json` con nome "Blendie", colori del brand e icone generate dal logo (192 e 512 px, più l'icona per iPhone).
- Service worker: l'app e `data.json` devono funzionare **senza internet**. Quando c'è una nuova versione di `data.json`, deve arrivare all'utente (es. aggiorna in background e usa la nuova versione alla prossima apertura).
- Deve funzionare bene su telefono, Android e iPhone.

## 8. Statistiche

GoatCounter, conteggio visite anonimo, come nelle altre app di Sandra. Chiedile il codice del suo account GoatCounter; finché non c'è, lascia lo script pronto ma disattivato.

## 9. Legale

- Disclaimer (`data.json` → `disclaimer`) visibile in Info e in piccolo sotto ogni risultato.
- Pagina Privacy: i testi sono in `data.json` → `privacy`.

## 10. Controllo dei dati

Aggiungi uno script (es. `tools/check-data.js`, da lanciare con Node) che controlla `data.json`: ogni id negli abbinamenti esiste, nessun farmaco ha abbinamenti, nessuna coppia compare in due voci di `pairs`, ogni testo italiano ha la versione inglese, ogni categoria esiste, ogni scheda ha almeno una fonte.

## 11. Come lavorare

1. Prima proponi a Sandra la struttura dei file e aspetta il suo ok.
2. Poi costruisci un pezzo alla volta, in quest'ordine: base e navigazione → lingua → Ingredienti (elenco, ricerca, filtri) → Scheda → Confronta e Risultato → Preferiti → I miei prodotti → Falsi miti e Guide → Info e Privacy → PWA e offline → GoatCounter → pubblicazione.
3. Dopo ogni pezzo: dille cosa hai fatto, come provarlo e cosa deve fare lei.
4. Pubblicazione: spiegale come attivare GitHub Pages (Settings → Pages → branch `main`, cartella root).
5. Aggiorna il `README.md` con i passi per provare e pubblicare l'app.

## Cosa c'è nella v2 (non farlo ora)

Account con Firebase (dati salvati online), routine completa da controllare tutta insieme, più ingredienti e più abbinamenti, tema scuro.
