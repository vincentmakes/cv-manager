# Segurança e Privacidade

## Protegendo a Interface de Admin

A interface de admin (porta 3000) dá acesso total para editar e excluir os dados do seu CV. **Ela nunca deve ser exposta diretamente à internet.**

**Abordagens recomendadas:**

- **Cloudflare Access** — Se você usa Cloudflare Tunnel, configure uma política do [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) no seu hostname de admin. Isso adiciona uma camada de autenticação (OTP por email, SSO, etc.) antes que qualquer pessoa possa acessar a página de admin. Exponha apenas a porta 3001 (pública) sem autenticação.
- **Apenas VPN** — Mantenha a porta 3000 acessível apenas pela sua rede local ou VPN. Nunca faça redirecionamento de porta para a internet.
- **Proxy reverso com autenticação** — Se estiver usando Nginx, Caddy ou Traefik, adicione autenticação HTTP básica ou um middleware de autenticação na frente da porta 3000.

## Segurança do Site Público

O site público (porta 3001) é projetado para ser exposto à internet — ele bloqueia todas as operações de escrita, aplica limitação de taxa (60 requisições/minuto por IP) e inclui cabeçalhos de segurança (CSP, X-Frame-Options, proteção XSS).

!!! warning "Regra geral"
    Porta pública → aberta para o mundo. Porta de admin → atrás de autenticação, sempre.
