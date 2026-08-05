# ADR-0005 — Shell di navigazione costruita incrementalmente, non anticipata

## Stato

Accettata.

## Contesto

Le 4 schermate ipotizzate (`screen-inventory.md`) sono tutte marcate come assunzione (🟡), derivate a ritroso dagli endpoint del backend, non da un requisito di prodotto confermato (`open-questions.md` #6). Decidere ora una struttura di navigazione definitiva (tab bar vs stack, ordine dei tab, presenza di un tab dedicato) equivarrebbe a progettare un'informazione-architettura definitiva, vietato dai vincoli del Task 6 ("non progettare schermate definitive").

## Decisione

La navigazione si costruisce nell'ordine in cui le schermate diventano reali (`implementation-plan.md`): si parte da una singola route (Fase 1, solo S01), si aggiunge la route dinamica di dettaglio quando esiste (Fase 2), e solo quando esistono realmente ≥ 2 schermate di ingresso da collegare (dopo Fase 4, cioè con S01/S02/S04 tutte implementate) si introduce un livello di navigazione tra punti di ingresso (Fase 5, VS6). La scelta tecnica precisa (tab bar Expo Router, drawer, o altro) è demandata all'implementazione di VS6, non fissata qui.

## Conseguenze

- Nessuna shell di navigazione "vuota" viene costruita in anticipo con placeholder per schermate non ancora esistenti.
- Il costo di aggiungere un punto di ingresso alla shell è pagato una sola volta, in Fase 5, invece di essere ri-pagato ad ogni nuova schermata con una struttura di navigazione prematura da adattare.
- Se il numero di schermate di ingresso confermate cambiasse (es. una viene esclusa da una decisione di prodotto), la shell si adatta senza aver mai incorporato assunzioni sulle schermate non ancora costruite.

## Nota di aggiornamento (Task 19)

Il principio resta valido; la sua **prima applicazione concreta** (Stack
singolo, Home a 3 pulsanti, scelta in VS6/Task 18 senza avere a
disposizione alcun riferimento di design) è stata sostituita da una
`Tabs` a 4 destinazioni (Map/Favorites/Pro/Profile) non appena è diventato
disponibile l'export reale del progetto Stitch, che mostra la tab bar come
architettura di informazione effettivamente prevista dal prodotto, non
un'anticipazione speculativa. La decisione qui sopra ("costruire solo
quando ≥ 2 punti di ingresso sono reali, scelta tecnica demandata
all'implementazione") non viene contraddetta: la scelta tecnica è stata
semplicemente rivista quando è arrivata l'informazione mancante. Dettagli:
`docs/motus/stitch-implementation-gap.md` riga 6.
