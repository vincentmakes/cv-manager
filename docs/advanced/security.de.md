# Sicherheit & Datenschutz

## Schutz der Admin-Oberfläche

Die Admin-Oberfläche (Port 3000) bietet vollen Zugriff zum Bearbeiten und Löschen Ihrer Lebenslaufdaten. **Sie sollte niemals direkt dem Internet ausgesetzt werden.**

**Empfohlene Ansätze:**

- **Cloudflare Access** — Wenn Sie Cloudflare Tunnel verwenden, richten Sie eine [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)-Richtlinie auf Ihrem Admin-Hostnamen ein. Dies fügt eine Authentifizierungsschicht (E-Mail-OTP, SSO usw.) hinzu, bevor jemand die Admin-Seite erreichen kann. Stellen Sie nur Port 3001 (öffentlich) ohne Authentifizierung bereit.
- **Nur über VPN** — Halten Sie Port 3000 nur aus Ihrem lokalen Netzwerk oder VPN zugänglich. Leiten Sie ihn niemals über Port-Forwarding ins Internet weiter.
- **Reverse Proxy mit Authentifizierung** — Wenn Sie Nginx, Caddy oder Traefik verwenden, fügen Sie HTTP-Basic-Auth oder eine Authentifizierungs-Middleware vor Port 3000 hinzu.

## Sicherheit der öffentlichen Seite

Die öffentliche Seite (Port 3001) ist für den Internetzugang konzipiert — sie blockiert alle Schreiboperationen, erzwingt Ratenbegrenzung (60 Anfragen/Minute pro IP) und enthält Sicherheits-Header (CSP, X-Frame-Options, XSS-Schutz).

!!! warning "Faustregel"
    Öffentlicher Port → offen für die Welt. Admin-Port → immer hinter einer Authentifizierung.
