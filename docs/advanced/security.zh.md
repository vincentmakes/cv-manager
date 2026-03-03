# 安全与隐私

## 保护管理界面

管理界面（端口 3000）拥有编辑和删除简历数据的完全权限。**绝不应将其直接暴露在互联网上。**

**推荐方案：**

- **Cloudflare Access** — 如果您使用 Cloudflare Tunnel，请在管理域名上设置 [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) 策略。这会在任何人访问管理页面之前添加一个认证层（邮件 OTP、SSO 等）。仅将端口 3001（公开）在无需认证的情况下暴露。
- **仅限 VPN** — 使端口 3000 仅可从本地网络或 VPN 访问。切勿将其端口转发到互联网。
- **带认证的反向代理** — 如果使用 Nginx、Caddy 或 Traefik，请在端口 3000 前添加 HTTP 基本认证或认证中间件。

## 公开站点安全

公开站点（端口 3001）设计为面向互联网——它会阻止所有写操作，强制实施速率限制（每个 IP 每分钟 60 次请求），并包含安全头（CSP、X-Frame-Options、XSS 防护）。

!!! warning "经验法则"
    公开端口 → 向全世界开放。管理端口 → 始终置于认证之后。
