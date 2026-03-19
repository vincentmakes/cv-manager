# 导出静态网站

将您的简历导出为完全静态的网站，可免费托管在 GitHub Pages、Cloudflare Pages、Netlify 或任何静态文件托管服务商上。无需服务器。

## 如何导出

1. 打开**设置 → 打印和导出**
2. 滚动到**导出静态网站**
3. 点击**下载 ZIP**

ZIP 文件包含将简历作为独立网站运行所需的一切内容：

- `index.html` — 您的简历页面，已预填元标签和 SEO 数据
- `data.json` — 您的所有简历数据（个人资料、工作经历、教育经历、技能等）
- `shared/` — CSS、JavaScript 和翻译文件
- `uploads/` — 您的头像和公司 Logo
- Favicon 文件

## 包含的内容

静态导出包含您公开简历上可见的所有内容：

- 所有版块及其排列顺序
- 您的主题颜色和设置
- 头像和公司 Logo
- 所选语言的所有翻译（i18n）
- 跟踪/分析代码（如已配置）
- SEO 元标签和 Open Graph 数据

敏感数据（电子邮件、电话）**不**包含在导出内容中。

## 部署到 GitHub Pages

### 方式一：使用 GitHub 网页界面（无需 Git）

1. 在 [github.com/new](https://github.com/new) 上创建一个新仓库
2. 若要创建根站点，将其命名为 `您的用户名.github.io`；若创建项目站点，可使用任意名称
3. 在您的计算机上解压下载的 ZIP 文件
4. 在仓库中点击**添加文件 → 上传文件**
5. 将所有解压后的文件拖入上传区域并提交
6. 进入**Settings → Pages**
7. 在**来源**下，选择**从分支部署**
8. 选择 **main** 分支和 **/ (root)** 文件夹，然后点击**保存**
9. 您的简历将在几分钟内发布到 `https://您的用户名.github.io`

### 方式二：使用 Git

```bash
# Create a new repository
mkdir my-cv && cd my-cv
git init

# Extract the ZIP contents into this directory
unzip /path/to/Your_Name_static_site.zip

# Push to GitHub
git add .
git commit -m "Deploy CV static site"
git branch -M main
git remote add origin https://github.com/您的用户名/您的用户名.github.io.git
git push -u origin main
```

然后按照上述说明在仓库设置中启用 GitHub Pages。

### 自定义域名

若要使用自定义域名（例如 `cv.您的域名.com`）：

1. 在您的仓库中，进入 **Settings → Pages → Custom domain**
2. 输入您的域名并点击**Save**
3. 在您的 DNS 服务商处添加一条 CNAME 记录，指向 `您的用户名.github.io`

!!! tip
    在 Pages 设置中勾选**Enforce HTTPS**，即可获得免费的 SSL 证书。

## 部署到 Cloudflare Pages

1. 将静态网站文件推送到 GitHub 或 GitLab 仓库（参见上方 Git 步骤）
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com)
3. 进入 **Workers & Pages → 创建 → Pages → 连接到 Git**
4. 选择您的仓库
5. 配置构建设置：
    - **构建命令**：留空（无需构建步骤）
    - **构建输出目录**：`/`（根目录）
6. 点击**保存并部署**

您的简历将在一分钟内发布到 `https://您的项目名.pages.dev`。

### 直接上传（无需 Git）

1. 进入 **Workers & Pages → 创建 → Pages → 上传资源**
2. 为您的项目命名
3. 解压 ZIP 文件，将文件夹内容拖入上传区域
4. 点击**部署**

### 在 Cloudflare 上使用自定义域名

1. 在您的 Pages 项目中，进入**自定义域**
2. 点击**设置自定义域**
3. 输入您的域名——如果域名已托管在 Cloudflare，DNS 将自动配置

## 部署到 Netlify

1. 访问 [app.netlify.com](https://app.netlify.com)
2. 将解压后的 ZIP 文件夹拖放到部署区域
3. 您的网站将立即发布到一个 `*.netlify.app` 网址

## 更新静态网站

每次更新简历后，重新导出静态网站并重新上传文件。此过程会覆盖之前的版本。

!!! tip
    若使用 GitHub Pages 或 Cloudflare Pages，最高效的工作流是保留一个本地 Git 克隆，直接替换文件后推送：
    ```bash
    # In your static site repo
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```
