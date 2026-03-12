# Vercel Setup Anleitung

## 1. Vercel Token erstellen
1. Gehe zu https://vercel.com/account/tokens
2. Klicke "Create Token"
3. Name: `GitHub Actions`
4. Kopiere den Token

## 2. Vercel Projekt ID & Org ID ermitteln
Nach dem ersten Deploy in Vercel:
1. Gehe zu deinem Projekt → Settings → General
2. Scrolle zu "Project ID" und "Organization ID"
3. Kopiere beide IDs

## 3. GitHub Secrets hinzufügen
Gehe zu https://github.com/Misterwanwa/wi-lernplattform/settings/secrets/actions

Füge diese Secrets hinzu:
- `VERCEL_TOKEN` → Der Token aus Schritt 1
- `VERCEL_ORG_ID` → Die Org ID aus Schritt 2
- `VERCEL_PROJECT_ID` → Die Project ID aus Schritt 2

## 4. Automatisches Deployment
Sobald die Secrets gesetzt sind, wird bei jedem Push zu `master` automatisch deployed!

## 5. Tägliches Deployment
Das tägliche Deployment läuft automatisch um 3:00 Uhr morgens (UTC).
Du kannst es auch manuell starten unter:
https://github.com/Misterwanwa/wi-lernplattform/actions/workflows/daily-deploy.yml
