# CV Manager

一个自托管、通过 Docker 部署的简历管理系统。在您自己的服务器上构建、自定义和分享专业简历。

---

## 什么是 CV Manager？

CV Manager 是一个通过 Docker 运行在您自己服务器上的 Web 应用程序。它提供两个界面：

- **管理端**（默认端口 3000）— 用于构建和管理您的简历
- **公开端**（默认端口 3001）— 只读版本，可分享给招聘人员、雇主或任何人

您的数据以 SQLite 数据库的形式存储在本地。不会向外部服务器发送任何数据。

## 核心功能

- **7 个内置板块** — 关于我、时间线、工作经历、资格认证、教育背景、技能、项目
- **自定义板块** — 通过 7 种布局类型添加任何内容（网格、列表、卡片、社交链接、要点列表、自由文本）
- **时间线可视化** — 根据工作经历自动生成，支持并行岗位展示
- **多版本简历** — 为不同受众保存数据集，提供公开的版本化 URL
- **主题自定义** — 颜色选择器、日期格式、亮色/暗色模式
- **打印和 PDF 导出** — 优化的打印输出，可配置页码和分页方式
- **ATS 友好** — Schema.org 标记、语义化 HTML、隐藏的 ATS 文本块
- **8 种界面语言** — 英语、德语、法语、荷兰语、西班牙语、意大利语、葡萄牙语、中文
- **导入与导出** — 完整的 JSON 备份和恢复
- **Docker 部署** — 一行命令安装，支持 Docker Compose 和 Unraid

## 快速链接

<div class="grid cards" markdown>

- :material-rocket-launch: **[快速开始](getting-started/index.md)** — 安装和设置 CV Manager
- :material-book-open-variant: **[使用指南](guide/index.md)** — 了解如何使用每项功能
- :material-cog: **[高级设置](advanced/index.md)** — SEO、安全性和 ATS 设置
- :material-frequently-asked-questions: **[常见问题](reference/faq.md)** — 常见问题解答

</div>

## 支持

- **GitHub**：[github.com/vincentmakes/cv-manager](https://github.com/vincentmakes/cv-manager)
- **问题反馈**：[github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **支持项目**：[ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)

