# Sicurezza e Privacy

## Protezione dell'Interfaccia di Amministrazione

L'interfaccia di amministrazione (porta 3000) fornisce accesso completo per modificare e cancellare i dati del vostro CV. **Non dovrebbe mai essere esposta direttamente su Internet.**

**Approcci consigliati:**

- **Cloudflare Access** — Se utilizzate Cloudflare Tunnel, configurate una policy di [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) sul vostro hostname di amministrazione. Questo aggiunge un livello di autenticazione (OTP via email, SSO, ecc.) prima che chiunque possa raggiungere la pagina di amministrazione. Esponete solo la porta 3001 (pubblica) senza autenticazione.
- **Solo VPN** — Mantenete la porta 3000 accessibile solo dalla vostra rete locale o VPN. Non inoltrate mai questa porta su Internet.
- **Reverse proxy con autenticazione** — Se utilizzate Nginx, Caddy o Traefik, aggiungete l'autenticazione HTTP basic o un middleware di autenticazione davanti alla porta 3000.

## Sicurezza del Sito Pubblico

Il sito pubblico (porta 3001) è progettato per essere esposto su Internet — blocca tutte le operazioni di scrittura, applica limitazioni di frequenza (60 richieste al minuto per IP) e include header di sicurezza (CSP, X-Frame-Options, protezione XSS).

!!! warning "Regola generale"
    Porta pubblica → aperta al mondo. Porta di amministrazione → sempre dietro autenticazione.
