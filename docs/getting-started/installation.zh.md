# 安装

## Docker Compose（推荐）

```bash
docker-compose up -d --build
```

这将启动管理端（端口 3000）和公开端（端口 3001）两个服务器。

## 一行命令安装

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

通过 **Community Applications** 安装 — 搜索 "cv-manager"。有两个模板可用：

- **cv-manager**（管理端）— 映射到端口 3000
- **cv-manager-public**（公开端）— 映射到端口 3001，只读

两个容器共享同一个数据目录（通常为 `/mnt/user/appdata/cv-manager`）。

## 使用 Cloudflare Tunnel 公开您的简历

1. 设置 Cloudflare Tunnel 指向端口 3001（公开服务器）
2. 使用 **Cloudflare Access** 将端口 3000（管理端）保护在身份验证之后
3. 这样您的简历就可以通过您的域名访问，同时管理端保持安全

## 不使用 Docker 运行

安装 Node.js 18+，在项目目录中运行 `npm install`，然后执行 `node src/server.js`。管理端运行在端口 3000，公开站点运行在端口 3001。
