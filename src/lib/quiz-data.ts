export interface QuizStatement {
  id: string
  text: string
  correct: boolean
}

export interface QuizBlock {
  id: string
  topic: string
  statements: QuizStatement[]
}

export const quizBlocks: QuizBlock[] = [
  {
    id: 'b1',
    topic: 'Grundbegriffe der Modellierung',
    statements: [
      { id: 'b1s1', text: 'Ein Modell ist immer eine vereinfachte Abbildung der Wirklichkeit und abstrahiert irrelevante Details.', correct: true },
      { id: 'b1s2', text: 'Die Diskurswelt bezeichnet die gesamte reale Welt ohne jede Einschränkung.', correct: false },
      { id: 'b1s3', text: 'Ein Informationsmodell hat sowohl eine syntaktische als auch eine semantische Dimension.', correct: true },
      { id: 'b1s4', text: 'Das semiotische Dreieck beschreibt die Beziehung zwischen Symbol, Begriff und Gegenstand.', correct: true },
      { id: 'b1s5', text: 'Pragmatik befasst sich ausschließlich mit der formalen Struktur von Zeichen.', correct: false },
    ],
  },
  {
    id: 'b2',
    topic: 'Zweck und Arten von Modellen',
    statements: [
      { id: 'b2s1', text: 'Erklärungs- und Gestaltungsmodelle sind die zwei Hauptklassen von Informationsmodellen.', correct: true },
      { id: 'b2s2', text: 'Ein Isomorphismus zwischen Modell und Realität bedeutet, dass jedes Element der Realität genau einem Modellelement entspricht.', correct: true },
      { id: 'b2s3', text: 'Das Wirtschaftlichkeitsprinzip verbietet den Einsatz von Modellen wenn diese zu teuer sind.', correct: false },
      { id: 'b2s4', text: 'Modelle können sowohl zur Dokumentation als auch zur Kommunikation eingesetzt werden.', correct: true },
      { id: 'b2s5', text: 'Ein Metamodell beschreibt die Struktur eines Modells und legt fest, welche Elemente ein Modell enthalten darf.', correct: true },
    ],
  },
  {
    id: 'b3',
    topic: 'Sprachebenen (OMG-Ebenen)',
    statements: [
      { id: 'b3s1', text: 'Die M0-Ebene repräsentiert konkrete Instanzen der realen Welt (z. B. ein einzelnes Auto).', correct: true },
      { id: 'b3s2', text: 'UML ist ein Beispiel für eine Sprache auf der M2-Ebene (Metamodellebene).', correct: true },
      { id: 'b3s3', text: 'Eine Klasse in einem UML-Klassendiagramm befindet sich auf der M0-Ebene.', correct: false },
      { id: 'b3s4', text: 'Die Instanziierungsbeziehung ("is instance of") verbindet immer benachbarte Ebenen.', correct: true },
      { id: 'b3s5', text: 'MOF (Meta Object Facility) definiert sich selbst auf der M3-Ebene.', correct: true },
    ],
  },
  {
    id: 'b4',
    topic: 'Semiotisches Dreieck & Zeichen',
    statements: [
      { id: 'b4s1', text: 'Im semiotischen Dreieck steht Syntax für die Beziehung zwischen Zeichen und Bedeutung.', correct: false },
      { id: 'b4s2', text: 'Semantik beschäftigt sich mit der Bedeutung von Zeichen in einem Kontext.', correct: true },
      { id: 'b4s3', text: 'Ein natürlichsprachlicher Begriff kann für dasselbe Konzept mehrere Synonyme haben.', correct: true },
      { id: 'b4s4', text: 'Homonyme sind Zeichen, die identisch aussehen, aber verschiedene Bedeutungen haben.', correct: true },
      { id: 'b4s5', text: 'Die Pragmatik beschäftigt sich mit der Verwendung von Zeichen im sozialen Kontext.', correct: true },
    ],
  },
  {
    id: 'b5',
    topic: 'Objektorientierte Konzepte',
    statements: [
      { id: 'b5s1', text: 'Kapselung (Encapsulation) bedeutet, dass Attribute einer Klasse von außen direkt zugänglich sind.', correct: false },
      { id: 'b5s2', text: 'Vererbung (Generalisierung) ermöglicht, dass eine Unterklasse Attribute und Methoden der Oberklasse übernimmt.', correct: true },
      { id: 'b5s3', text: 'Polymorphismus erlaubt es, dass verschiedene Klassen dieselbe Methode unterschiedlich implementieren.', correct: true },
      { id: 'b5s4', text: 'Eine Assoziation mit Multiplizität 0..1 bedeutet, dass kein oder genau ein Objekt beteiligt ist.', correct: true },
      { id: 'b5s5', text: 'Im UML-Klassendiagramm werden Methoden im dritten Abschnitt der Klassenbox angegeben.', correct: true },
    ],
  },
  {
    id: 'b6',
    topic: 'Entity-Relationship-Modell',
    statements: [
      { id: 'b6s1', text: 'Entitätstypen werden im ER-Diagramm als Rauten dargestellt.', correct: false },
      { id: 'b6s2', text: 'Ein Schlüsselattribut identifiziert eine Entität eindeutig und wird im Diagramm unterstrichen.', correct: true },
      { id: 'b6s3', text: 'Die Kardinalität mc (in alter Notation) entspricht "mehrere und mindestens 1".', correct: false },
      { id: 'b6s4', text: 'Bei der (min,max)-Notation gibt min die Mindestanzahl und max die Höchstanzahl an Beziehungen an.', correct: true },
      { id: 'b6s5', text: 'Generalisierung im ERM kann vollständig oder unvollständig sowie exklusiv oder nicht-exklusiv sein.', correct: true },
    ],
  },
  {
    id: 'b7',
    topic: 'Geschäftsprozessmodellierung',
    statements: [
      { id: 'b7s1', text: 'Ein XOR-Gateway in BPMN bedeutet, dass genau ein ausgehender Pfad gewählt wird.', correct: true },
      { id: 'b7s2', text: 'Swimlanes in BPMN beschreiben die zeitliche Abfolge von Prozessschritten.', correct: false },
      { id: 'b7s3', text: 'Ein AND-Gateway (UND-Konnektor) spaltet den Prozessfluss in parallele Pfade auf.', correct: true },
      { id: 'b7s4', text: 'Jedes geöffnete Gateway muss im Prozessmodell durch ein entsprechendes schließendes Gateway geschlossen werden.', correct: true },
      { id: 'b7s5', text: 'Die Organisationssicht beschreibt, welche Abteilungen oder Rollen an einem Prozessschritt beteiligt sind.', correct: true },
    ],
  },
]

/** FernUni-Scoring: 0→0, 1→0.25, 2→0.75, 3→1.5, 4→2.25, 5→3 */
export const fernuniScore = [0, 0.25, 0.75, 1.5, 2.25, 3]
