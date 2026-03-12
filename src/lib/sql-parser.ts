/** Simple SQL parser for SELECT/FROM/WHERE/JOIN statements */

export type Row = Record<string, string | number | null>
export type Table = { name: string; columns: string[]; rows: Row[] }

// ===== Sample databases =====
export const sampleDatabases: Record<string, Table[]> = {
  'Klausur 2022': [
    {
      name: 'Mitarbeiter',
      columns: ['PersNr', 'Name', 'Gehalt', 'AbtNr'],
      rows: [
        { PersNr: 1, Name: 'Müller', Gehalt: 3200, AbtNr: 10 },
        { PersNr: 2, Name: 'Schmidt', Gehalt: 4100, AbtNr: 20 },
        { PersNr: 3, Name: 'Weber', Gehalt: 2800, AbtNr: 10 },
        { PersNr: 4, Name: 'Wagner', Gehalt: 5500, AbtNr: 30 },
        { PersNr: 5, Name: 'Fischer', Gehalt: 3900, AbtNr: 20 },
      ],
    },
    {
      name: 'Abteilung',
      columns: ['AbtNr', 'Bezeichnung', 'Ort'],
      rows: [
        { AbtNr: 10, Bezeichnung: 'Entwicklung', Ort: 'Berlin' },
        { AbtNr: 20, Bezeichnung: 'Vertrieb', Ort: 'München' },
        { AbtNr: 30, Bezeichnung: 'Personalwesen', Ort: 'Hamburg' },
      ],
    },
    {
      name: 'Projekt',
      columns: ['ProjNr', 'Titel', 'Budget'],
      rows: [
        { ProjNr: 'P1', Titel: 'Webportal', Budget: 50000 },
        { ProjNr: 'P2', Titel: 'ERP-Migration', Budget: 120000 },
        { ProjNr: 'P3', Titel: 'App-Entwicklung', Budget: 75000 },
      ],
    },
    {
      name: 'Mitarbeit',
      columns: ['PersNr', 'ProjNr', 'Rolle'],
      rows: [
        { PersNr: 1, ProjNr: 'P1', Rolle: 'Entwickler' },
        { PersNr: 2, ProjNr: 'P1', Rolle: 'Manager' },
        { PersNr: 3, ProjNr: 'P2', Rolle: 'Entwickler' },
        { PersNr: 1, ProjNr: 'P2', Rolle: 'Entwickler' },
        { PersNr: 4, ProjNr: 'P3', Rolle: 'Manager' },
        { PersNr: 5, ProjNr: 'P3', Rolle: 'Berater' },
      ],
    },
  ],
  'Klausur 2021': [
    {
      name: 'Student',
      columns: ['MatrNr', 'Name', 'Studiengang', 'Semester'],
      rows: [
        { MatrNr: 1001, Name: 'Bauer', Studiengang: 'Informatik', Semester: 3 },
        { MatrNr: 1002, Name: 'Koch', Studiengang: 'BWL', Semester: 5 },
        { MatrNr: 1003, Name: 'Richter', Studiengang: 'Informatik', Semester: 1 },
        { MatrNr: 1004, Name: 'Hoffmann', Studiengang: 'WI', Semester: 7 },
        { MatrNr: 1005, Name: 'Klein', Studiengang: 'WI', Semester: 3 },
      ],
    },
    {
      name: 'Modul',
      columns: ['ModulNr', 'Titel', 'ECTS', 'Fachbereich'],
      rows: [
        { ModulNr: 'M01', Titel: 'Datenbanken', ECTS: 5, Fachbereich: 'Informatik' },
        { ModulNr: 'M02', Titel: 'Algorithmen', ECTS: 8, Fachbereich: 'Informatik' },
        { ModulNr: 'M03', Titel: 'Marketing', ECTS: 5, Fachbereich: 'BWL' },
        { ModulNr: 'M04', Titel: 'Informationsmodellierung', ECTS: 5, Fachbereich: 'WI' },
      ],
    },
    {
      name: 'Pruefung',
      columns: ['MatrNr', 'ModulNr', 'Note', 'Datum'],
      rows: [
        { MatrNr: 1001, ModulNr: 'M01', Note: 2.0, Datum: '2023-02-15' },
        { MatrNr: 1001, ModulNr: 'M02', Note: 1.7, Datum: '2023-03-20' },
        { MatrNr: 1002, ModulNr: 'M03', Note: 3.0, Datum: '2023-02-15' },
        { MatrNr: 1003, ModulNr: 'M01', Note: 2.7, Datum: '2023-03-20' },
        { MatrNr: 1004, ModulNr: 'M04', Note: 1.3, Datum: '2023-02-15' },
        { MatrNr: 1005, ModulNr: 'M04', Note: 2.3, Datum: '2023-03-20' },
      ],
    },
  ],
}

// ===== SQL Exercises =====
export interface SQLExercise {
  id: string
  description: string
  hint?: string
  sampleAnswer: string
}

export const sqlExercises: SQLExercise[] = [
  {
    id: 'ex1',
    description: 'Zeige alle Namen und Gehälter der Mitarbeiter in der Abteilung 10.',
    hint: 'SELECT ... FROM Mitarbeiter WHERE ...',
    sampleAnswer: 'SELECT Name, Gehalt FROM Mitarbeiter WHERE AbtNr = 10',
  },
  {
    id: 'ex2',
    description: 'Zeige alle Mitarbeiternamen zusammen mit der Bezeichnung ihrer Abteilung.',
    hint: 'Verbinde Mitarbeiter und Abteilung über AbtNr',
    sampleAnswer: 'SELECT Mitarbeiter.Name, Abteilung.Bezeichnung FROM Mitarbeiter JOIN Abteilung ON Mitarbeiter.AbtNr = Abteilung.AbtNr',
  },
  {
    id: 'ex3',
    description: 'Welche Mitarbeiter verdienen mehr als 4000 Euro? Zeige Name und Gehalt.',
    hint: 'Vergleichsoperator > verwenden',
    sampleAnswer: 'SELECT Name, Gehalt FROM Mitarbeiter WHERE Gehalt > 4000',
  },
  {
    id: 'ex4',
    description: 'Zeige alle Projekte an denen Mitarbeiter "Müller" (PersNr=1) beteiligt ist. Zeige Projekttitel.',
    hint: 'JOIN Mitarbeit und Projekt',
    sampleAnswer: 'SELECT Projekt.Titel FROM Projekt JOIN Mitarbeit ON Projekt.ProjNr = Mitarbeit.ProjNr WHERE Mitarbeit.PersNr = 1',
  },
  {
    id: 'ex5',
    description: 'Zeige alle Abteilungen in Berlin.',
    hint: 'WHERE mit Stringvergleich',
    sampleAnswer: "SELECT AbtNr, Bezeichnung FROM Abteilung WHERE Ort = 'Berlin'",
  },
]

// ===== Parser =====

function tokenize(sql: string): string[] {
  return sql
    .replace(/[,]/g, ' , ')
    .replace(/[=<>!]+/g, m => ` ${m} `)
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .split(/\s+/)
    .filter(t => t.length > 0)
}

interface ParsedQuery {
  select: string[]
  from: string[]
  joins: { table: string; leftCol: string; rightCol: string }[]
  where: { left: string; op: string; right: string } | null
}

function parseSQL(sql: string): ParsedQuery | { error: string } {
  const upper = sql.trim().toUpperCase()
  if (!upper.startsWith('SELECT')) {
    return { error: 'Befehl muss mit SELECT beginnen.' }
  }

  // Very simple regex-based parser
  const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i)
  if (!selectMatch) return { error: 'Syntax-Fehler: FROM nicht gefunden.' }

  const selectRaw = selectMatch[1].trim()
  const selectCols = selectRaw === '*'
    ? ['*']
    : selectRaw.split(',').map(c => c.trim())

  const fromMatch = sql.match(/FROM\s+([\w,\s]+?)(?:\s+JOIN|\s+WHERE|$)/i)
  if (!fromMatch) return { error: 'Syntax-Fehler: Tabellenname fehlt.' }
  const fromTables = fromMatch[1].split(',').map(t => t.trim())

  // Parse JOINs
  const joins: ParsedQuery['joins'] = []
  const joinRegex = /JOIN\s+(\w+)\s+ON\s+(\w+\.\w+)\s*=\s*(\w+\.\w+)/gi
  let joinMatch
  while ((joinMatch = joinRegex.exec(sql)) !== null) {
    joins.push({ table: joinMatch[1], leftCol: joinMatch[2], rightCol: joinMatch[3] })
  }

  // Parse WHERE
  let where: ParsedQuery['where'] = null
  const whereMatch = sql.match(/WHERE\s+(\S+)\s*([=<>!]+|LIKE)\s*(\S+)/i)
  if (whereMatch) {
    where = { left: whereMatch[1], op: whereMatch[2], right: whereMatch[3].replace(/^['"]|['"]$/g, '') }
  }

  return { select: selectCols, from: fromTables, joins, where }
}

function resolveColumn(colExpr: string, tables: Table[]): string {
  // Returns "TableName.ColName" or just "ColName"
  if (colExpr.includes('.')) return colExpr
  return colExpr
}

function getColValue(row: Row, colExpr: string, tableAliases: Record<string, string>): string | number | null {
  if (colExpr.includes('.')) {
    const [tbl, col] = colExpr.split('.')
    return row[`${tbl}.${col}`] ?? row[col] ?? null
  }
  return row[colExpr] ?? null
}

export function executeSQL(sql: string, tables: Table[]): { columns: string[]; rows: Row[] } | { error: string } {
  const parsed = parseSQL(sql)
  if ('error' in parsed) return parsed

  // Build table lookup
  const tableMap: Record<string, Table> = {}
  for (const t of tables) tableMap[t.name.toLowerCase()] = t

  // Get base table
  const baseTableName = parsed.from[0]
  const baseTable = tableMap[baseTableName.toLowerCase()]
  if (!baseTable) return { error: `Tabelle '${baseTableName}' nicht gefunden.` }

  // Start with base table rows, prefixed with table name
  let workRows: Row[] = baseTable.rows.map(r => {
    const prefixed: Row = {}
    for (const col of baseTable.columns) prefixed[`${baseTable.name}.${col}`] = r[col]
    // Also add unprefixed for convenience
    for (const col of baseTable.columns) prefixed[col] = r[col]
    return prefixed
  })

  // Process JOINs
  for (const join of parsed.joins) {
    const joinTable = tableMap[join.table.toLowerCase()]
    if (!joinTable) return { error: `Tabelle '${join.table}' nicht gefunden.` }

    const newRows: Row[] = []
    for (const leftRow of workRows) {
      for (const rightRow of joinTable.rows) {
        // Resolve join columns
        const leftVal = leftRow[join.leftCol] ?? leftRow[join.leftCol.split('.')[1]]
        const rightVal = rightRow[join.rightCol.split('.')[1]] ?? rightRow[join.rightCol]
        if (leftVal === rightVal) {
          const combined: Row = { ...leftRow }
          for (const col of joinTable.columns) {
            combined[`${joinTable.name}.${col}`] = rightRow[col]
            combined[col] = rightRow[col] // unprefixed (may overwrite, that's ok for simple cases)
          }
          newRows.push(combined)
        }
      }
    }
    workRows = newRows
  }

  // Apply WHERE
  if (parsed.where) {
    const { left, op, right } = parsed.where
    workRows = workRows.filter(row => {
      const val = row[left] ?? row[left.includes('.') ? left.split('.')[1] : left]
      const numRight = isNaN(Number(right)) ? right : Number(right)
      const numVal = typeof val === 'number' ? val : (isNaN(Number(val)) ? val : Number(val))
      switch (op) {
        case '=': return String(val).toLowerCase() === String(right).toLowerCase()
        case '!=': case '<>': return val !== numRight
        case '>': return Number(numVal) > Number(numRight)
        case '<': return Number(numVal) < Number(numRight)
        case '>=': return Number(numVal) >= Number(numRight)
        case '<=': return Number(numVal) <= Number(numRight)
        default: return true
      }
    })
  }

  // Project SELECT columns
  let outputColumns: string[]
  let outputRows: Row[]

  if (parsed.select[0] === '*') {
    // Return all original (unprefixed) columns
    const baseCol = [...baseTable.columns]
    for (const j of parsed.joins) {
      const jt = tableMap[j.table.toLowerCase()]
      if (jt) baseCol.push(...jt.columns)
    }
    outputColumns = [...new Set(baseCol)]
    outputRows = workRows.map(r => {
      const out: Row = {}
      for (const c of outputColumns) out[c] = r[c] ?? null
      return out
    })
  } else {
    outputColumns = parsed.select.map(c => c.includes('.') ? c.split('.')[1] : c)
    outputRows = workRows.map(r => {
      const out: Row = {}
      for (let i = 0; i < parsed.select.length; i++) {
        const sel = parsed.select[i]
        const displayCol = outputColumns[i]
        out[displayCol] = r[sel] ?? r[sel.includes('.') ? sel.split('.')[1] : sel] ?? null
      }
      return out
    })
  }

  return { columns: outputColumns, rows: outputRows }
}

export function formatASCIITable(columns: string[], rows: Row[]): string {
  if (rows.length === 0) return '(Keine Ergebnisse)\n'

  const widths: number[] = columns.map(c => c.length)
  for (const row of rows) {
    columns.forEach((col, i) => {
      const val = String(row[col] ?? 'NULL')
      widths[i] = Math.max(widths[i], val.length)
    })
  }

  const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+'
  const header = '|' + columns.map((c, i) => ' ' + c.padEnd(widths[i]) + ' ').join('|') + '|'
  const dataRows = rows.map(row =>
    '|' + columns.map((c, i) => ' ' + String(row[c] ?? 'NULL').padEnd(widths[i]) + ' ').join('|') + '|'
  )

  return [sep, header, sep, ...dataRows, sep].join('\n') + '\n'
}

export function formatASCIITableFromTable(table: Table): string {
  return formatASCIITable(table.columns, table.rows)
}
