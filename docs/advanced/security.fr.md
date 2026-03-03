# Sécurité et confidentialité

## Protection de l'interface d'administration

L'interface d'administration (port 3000) donne un accès complet pour modifier et supprimer vos données de CV. **Elle ne doit jamais être exposée directement sur Internet.**

**Approches recommandées :**

- **Cloudflare Access** — Si vous utilisez Cloudflare Tunnel, configurez une politique [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) sur votre nom d'hôte d'administration. Cela ajoute une couche d'authentification (OTP par e-mail, SSO, etc.) avant que quiconque puisse accéder à la page d'administration. N'exposez que le port 3001 (public) sans authentification.
- **VPN uniquement** — Gardez le port 3000 accessible uniquement depuis votre réseau local ou VPN. Ne le redirigez jamais vers Internet.
- **Proxy inverse avec authentification** — Si vous utilisez Nginx, Caddy ou Traefik, ajoutez une authentification HTTP basique ou un middleware d'authentification devant le port 3000.

## Sécurité du site public

Le site public (port 3001) est conçu pour être accessible depuis Internet — il bloque toutes les opérations d'écriture, applique une limitation de débit (60 requêtes par minute par IP) et inclut des en-têtes de sécurité (CSP, X-Frame-Options, protection XSS).

!!! warning "Règle d'or"
    Port public → ouvert au monde entier. Port d'administration → derrière une authentification, toujours.
