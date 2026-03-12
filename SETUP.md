# WI Lernplattform – Setup

## Voraussetzungen
- Node.js 18+ (https://nodejs.org)
- npm

## Lokaler Start

```bash
npm install
npm run dev
```
Dann: http://localhost:3000

## Vercel Deployment

1. Projekt zu GitHub pushen
2. https://vercel.com → "Add New Project"
3. Repository verbinden → automatisch erkannt als Next.js
4. Deploy klicken

## Projektstruktur

```
src/
  app/page.tsx              ← XP Desktop (Hauptseite)
  components/
    window/                 ← Fensterverwaltung
    desktop/                ← Desktop, Icons, Taskbar, Startmenü
    apps/
      uml/                  ← App 1: UML Architect Pro
      erd/                  ← App 2: ERD Database Designer
      bpmn/                 ← App 3: Process Flow Modeler
      metamatrix/           ← App 4: OMG Meta-Matrix Simulator
      quiz/                 ← App 5: Zertifikatsprüfung
      sql/                  ← App 6: SQL Terminal
  lib/
    quiz-data.ts            ← Fragenkatalog
    case-studies.ts         ← Fallbeschreibungen
    sql-parser.ts           ← SQL-Parser & Testdaten
  styles/xp.css             ← Windows XP Design
```
