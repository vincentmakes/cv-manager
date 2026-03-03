# Security & Privacy

## Protecting the Admin Interface

The admin interface (port 3000) gives full access to edit and delete your CV data. **It should never be exposed directly to the internet.**

**Recommended approaches:**

- **Cloudflare Access** — If you use Cloudflare Tunnel, set up a [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) policy on your admin hostname. This adds an authentication layer (email OTP, SSO, etc.) before anyone can reach the admin page. Only expose port 3001 (public) without authentication.
- **VPN only** — Keep port 3000 accessible only from your local network or VPN. Never port-forward it to the internet.
- **Reverse proxy with auth** — If using Nginx, Caddy, or Traefik, add HTTP basic auth or an authentication middleware in front of port 3000.

## Public Site Security

The public site (port 3001) is designed to be internet-facing — it blocks all write operations, enforces rate limiting (60 requests/minute per IP), and includes security headers (CSP, X-Frame-Options, XSS protection).

!!! warning "Rule of thumb"
    Public port → open to the world. Admin port → behind authentication, always.
