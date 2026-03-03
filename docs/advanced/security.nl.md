# Beveiliging & Privacy

## De beheerinterface beschermen

De beheerinterface (poort 3000) geeft volledige toegang om uw CV-gegevens te bewerken en te verwijderen. **Deze mag nooit rechtstreeks aan het internet worden blootgesteld.**

**Aanbevolen benaderingen:**

- **Cloudflare Access** — Als u Cloudflare Tunnel gebruikt, stel dan een [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)-beleid in op uw beheerhostnaam. Dit voegt een authenticatielaag toe (e-mail-OTP, SSO, enz.) voordat iemand het beheerpaneel kan bereiken. Stel alleen poort 3001 (publiek) bloot zonder authenticatie.
- **Alleen VPN** — Houd poort 3000 alleen toegankelijk vanuit uw lokale netwerk of VPN. Stel deze nooit open naar het internet via port forwarding.
- **Reverse proxy met authenticatie** — Als u Nginx, Caddy of Traefik gebruikt, voeg dan HTTP-basisauthenticatie of een authenticatie-middleware toe vóór poort 3000.

## Beveiliging van de publieke site

De publieke site (poort 3001) is ontworpen om aan het internet te worden blootgesteld — deze blokkeert alle schrijfbewerkingen, dwingt snelheidsbeperking af (60 verzoeken/minuut per IP) en bevat beveiligingsheaders (CSP, X-Frame-Options, XSS-bescherming).

!!! warning "Vuistregel"
    Publieke poort → open voor iedereen. Beheerpoort → altijd achter authenticatie.
