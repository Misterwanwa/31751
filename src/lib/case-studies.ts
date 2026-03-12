export interface CaseStudy {
  id: string
  title: string
  text: string
  hint?: string
  // Expected structure hints for validation
  expectedClasses?: string[]
}

export const umlCaseStudies: CaseStudy[] = [
  {
    id: 'uml1',
    title: 'Bibliotheksverwaltung',
    text: `Eine Bibliothek verwaltet ihren Bestand an Büchern und Zeitschriften. Jedes Buch hat eine ISBN, einen Titel und einen Erscheinungsjahrgang. Ein Buch kann von einem oder mehreren Autoren verfasst worden sein. Ein Autor hat einen Namen und eine Nationalität. Bibliotheksmitglieder können Bücher ausleihen. Ein Mitglied hat eine Mitgliedsnummer, einen Namen und eine Adresse. Eine Ausleihe ist einem Mitglied und einem Buch zugeordnet und hat ein Ausleihdatum sowie ein Rückgabedatum.`,
    hint: 'Klassen: Buch, Autor, Mitglied, Ausleihe. Assoziationen: Buch–Autor (m..*), Mitglied–Ausleihe (1..*), Buch–Ausleihe (1..*)',
    expectedClasses: ['Buch', 'Autor', 'Mitglied', 'Ausleihe'],
  },
  {
    id: 'uml2',
    title: 'Online-Shop',
    text: `Ein Online-Shop verkauft Produkte in verschiedenen Kategorien. Jedes Produkt hat eine Artikelnummer, eine Bezeichnung und einen Preis. Produkte sind Kategorien zugeordnet, eine Kategorie kann mehrere Produkte enthalten. Kunden können Bestellungen aufgeben. Eine Bestellung enthält eine oder mehrere Bestellpositionen. Jede Bestellposition verweist auf ein Produkt und hat eine Menge sowie einen berechneten Positionspreis. Kunden haben eine Kundennummer, einen Namen und eine E-Mail-Adresse.`,
    hint: 'Klassen: Produkt, Kategorie, Kunde, Bestellung, Bestellposition',
    expectedClasses: ['Produkt', 'Kategorie', 'Kunde', 'Bestellung', 'Bestellposition'],
  },
  {
    id: 'uml3',
    title: 'Hochschulverwaltung',
    text: `Eine Hochschule bietet Studiengänge an. Jeder Studiengang hat eine Bezeichnung und eine Regelstudienzeit. Studiengänge setzen sich aus Modulen zusammen. Ein Modul hat eine Modulnummer, einen Namen und eine Anzahl von ECTS-Punkten. Studierende sind in einem oder mehreren Studiengängen eingeschrieben und haben eine Matrikelnummer sowie einen Namen. Lehrende (Professoren und wissenschaftliche Mitarbeiter) sind Personen mit einem Namen und einer Personalnummer. Professoren haben zusätzlich einen Fachbereich. Lehrende können Module betreuen.`,
    hint: 'Klassen: Studiengang, Modul, Studierender, Lehrender, Professor, WissMitarbeiter. Vererbung: Professor und WissMitarbeiter erben von Lehrender',
    expectedClasses: ['Studiengang', 'Modul', 'Studierender', 'Lehrender', 'Professor'],
  },
  {
    id: 'uml4',
    title: 'Fuhrparkverwaltung',
    text: `Ein Unternehmen verwaltet seinen Fuhrpark. Fahrzeuge können PKW, LKW oder Busse sein. Jedes Fahrzeug hat ein Kennzeichen, ein Baujahr und einen Kilometerstand. PKW haben zusätzlich eine Anzahl von Sitzplätzen, LKW eine Nutzlast. Mitarbeiter können Fahrzeuge für Dienstfahrten reservieren. Eine Reservierung hat ein Start- und Enddatum sowie einen Zweck. Mitarbeiter haben eine Personalnummer und einen Namen.`,
    hint: 'Generalisierung: PKW, LKW, Bus erben von Fahrzeug. Klassen: Fahrzeug, PKW, LKW, Bus, Mitarbeiter, Reservierung',
    expectedClasses: ['Fahrzeug', 'PKW', 'LKW', 'Bus', 'Mitarbeiter', 'Reservierung'],
  },
  {
    id: 'uml5',
    title: 'Krankenhausinformationssystem',
    text: `In einem Krankenhaus werden Patienten von Ärzten behandelt. Ein Patient hat eine Patientennummer, einen Namen und ein Geburtsdatum. Ärzte haben eine Arztnummer, einen Namen und eine Fachrichtung. Eine Behandlung ist einem Patienten und einem Arzt zugeordnet, hat ein Datum und eine Diagnose. Stationen haben eine Stationsnummer und eine Bezeichnung. Patienten können auf Stationen eingewiesen werden, wobei Einweisung und Entlassung dokumentiert werden.`,
    hint: 'Klassen: Patient, Arzt, Behandlung, Station, Einweisung',
    expectedClasses: ['Patient', 'Arzt', 'Behandlung', 'Station', 'Einweisung'],
  },
]

export const erdCaseStudies: CaseStudy[] = [
  {
    id: 'erd1',
    title: 'Reisebüro',
    text: `Ein Reisebüro verwaltet Reiseangebote und Buchungen. Reiseangebote haben eine Angebotsnummer, ein Zielland und einen Preis. Kunden haben eine Kundennummer, einen Namen und eine Adresse. Ein Kunde kann mehrere Reiseangebote buchen. Eine Buchung hat ein Buchungsdatum und eine Personenanzahl. Reiseangebote werden von Reiseveranstaltern angeboten. Ein Reiseveranstalter hat eine Veranstalternummer und einen Namen.`,
    hint: 'Entitätstypen: Reiseangebot, Kunde, Buchung (als Beziehungstyp), Reiseveranstalter',
    expectedClasses: ['Reiseangebot', 'Kunde', 'Reiseveranstalter'],
  },
  {
    id: 'erd2',
    title: 'Personalverwaltung',
    text: `Ein Unternehmen beschäftigt Mitarbeiter in verschiedenen Abteilungen. Mitarbeiter haben eine Personalnummer, einen Namen und ein Gehalt. Abteilungen haben eine Abteilungsnummer und eine Bezeichnung. Jede Abteilung wird von genau einem Mitarbeiter geleitet. Mitarbeiter können an Projekten mitarbeiten, ein Projekt hat eine Projektnummer und ein Budget. Die Mitarbeit an einem Projekt hat eine Rolle und einen Starttermin.`,
    hint: 'Entitätstypen: Mitarbeiter, Abteilung, Projekt. Beziehungen: arbeitet_in, leitet, arbeitet_an',
    expectedClasses: ['Mitarbeiter', 'Abteilung', 'Projekt'],
  },
  {
    id: 'erd3',
    title: 'Seminarverwaltung',
    text: `Eine Bildungseinrichtung bietet Seminare an. Seminare haben eine Seminarnummer, einen Titel und eine maximale Teilnehmerzahl. Referenten (externe Trainer) halten Seminare. Ein Referent hat eine Referentennummer und einen Namen. Teilnehmer melden sich für Seminare an. Ein Teilnehmer hat eine Teilnehmernummer und eine E-Mail. Eine Anmeldung hat ein Datum und einen Status. Seminare finden in Räumen statt. Ein Raum hat eine Raumnummer und eine Kapazität.`,
    hint: 'Entitätstypen: Seminar, Referent, Teilnehmer, Raum. Beziehungstypen: haelt, angemeldet_fuer, findet_statt_in',
    expectedClasses: ['Seminar', 'Referent', 'Teilnehmer', 'Raum'],
  },
]

export const bpmnCaseStudies: CaseStudy[] = [
  {
    id: 'bpmn1',
    title: 'Bestellabwicklung',
    text: `Ist-Analyse: Der Prozess beginnt, wenn ein Kunde eine Bestellung aufgibt. Die Vertriebsabteilung prüft die Bestellung. Ist die Bestellung unvollständig, wird der Kunde kontaktiert und nach Rückmeldung erneut geprüft. Ist die Bestellung vollständig, prüft das Lager die Verfügbarkeit. Bei Verfügbarkeit wird die Ware kommissioniert und versandt. Bei Nichtverfügbarkeit wird die Lieferzeit geprüft: Ist sie akzeptabel, wird der Kunde informiert und die Bestellung reserviert. Andernfalls wird die Bestellung storniert. Der Prozess endet mit Versand, Reservierung oder Stornierung.`,
    hint: 'Swimlanes: Vertrieb, Lager, Versand. Gateways: XOR-Gateway nach Vollständigkeitsprüfung, XOR-Gateway nach Verfügbarkeitsprüfung',
  },
  {
    id: 'bpmn2',
    title: 'Einstellungsprozess',
    text: `Ist-Analyse: Der Einstellungsprozess startet mit dem Eingang einer Bewerbung. Die Personalabteilung prüft die Unterlagen. Bei unvollständigen Unterlagen wird die Bewerbung abgelehnt. Bei vollständigen Unterlagen beurteilt die Fachabteilung die fachliche Eignung. Ist der Bewerber geeignet, werden Vorstellungsgespräche vereinbart und geführt. Danach treffen Personalabteilung und Fachabteilung gemeinsam die Einstellungsentscheidung. Bei positiver Entscheidung wird ein Vertragsangebot erstellt. Bei negativer Entscheidung erhält der Bewerber eine Absage. Der Prozess endet mit Vertragsabschluss oder Absage.`,
    hint: 'Swimlanes: Personalabteilung, Fachabteilung. AND-Join vor Entscheidung, XOR-Splits nach Prüfungen',
  },
]
