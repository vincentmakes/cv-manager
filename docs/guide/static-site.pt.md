# Exportação de Site Estático

Exporte seu currículo como um site completamente estático que pode ser hospedado gratuitamente no GitHub Pages, Cloudflare Pages, Netlify ou qualquer outro provedor de hospedagem de arquivos estáticos. Não é necessário servidor.

## Como exportar

1. Abra **Configurações → Impressão e Exportação**
2. Role até **Exportar site estático**
3. Clique em **Baixar ZIP**

O arquivo ZIP contém tudo o que é necessário para executar seu currículo como um site independente:

- `index.html` — Sua página de currículo com metatags e dados de SEO preenchidos
- `data.json` — Todos os dados do seu currículo (perfil, experiências, educação, habilidades, etc.)
- `shared/` — Arquivos CSS, JavaScript e de tradução
- `uploads/` — Sua foto de perfil e logotipos de empresas
- Arquivos de favicon

## O que está incluído

A exportação estática contém tudo o que é visível no seu currículo público:

- Todas as seções e sua ordenação
- Sua cor de tema e configurações
- Foto de perfil e logotipos de empresas
- Todas as traduções (i18n) para o idioma selecionado
- Código de rastreamento/análise (se configurado)
- Metatags de SEO e dados Open Graph

Dados sensíveis (e-mail, telefone) **não** são incluídos na exportação.

## Publicar no GitHub Pages

### Opção 1: Usando a interface do GitHub (sem Git)

1. Crie um novo repositório em [github.com/new](https://github.com/new)
2. Nomeie-o `seuusuario.github.io` para um site raiz, ou qualquer nome para um site de projeto
3. Extraia o arquivo ZIP baixado no seu computador
4. Clique em **Adicionar arquivo → Enviar arquivos** no repositório
5. Arraste todos os arquivos extraídos para a área de upload e confirme o commit
6. Vá para **Configurações → Pages**
7. Em **Fonte**, selecione **Implantar a partir de um branch**
8. Selecione o branch **main** e a pasta **/ (raiz)**, depois clique em **Salvar**
9. Seu currículo estará disponível em `https://seuusuario.github.io` em alguns minutos

### Opção 2: Usando Git

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
git remote add origin https://github.com/seuusuario/seuusuario.github.io.git
git push -u origin main
```

Em seguida, ative o GitHub Pages nas configurações do repositório conforme descrito acima.

### Domínio personalizado

Para usar um domínio personalizado (ex.: `cv.seudominio.com`):

1. No seu repositório, vá para **Configurações → Pages → Domínio personalizado**
2. Insira seu domínio e clique em **Salvar**
3. Adicione um registro CNAME no seu provedor de DNS apontando para `seuusuario.github.io`

!!! tip
    Ative **Forçar HTTPS** nas configurações do Pages para obter um certificado SSL gratuito.

## Publicar no Cloudflare Pages

1. Envie os arquivos do seu site estático para um repositório do GitHub ou GitLab (veja os passos com Git acima)
2. Faça login no [painel do Cloudflare](https://dash.cloudflare.com)
3. Vá para **Workers & Pages → Criar → Pages → Conectar ao Git**
4. Selecione seu repositório
5. Configure as opções de build:
    - **Comando de build**: deixe vazio (nenhuma etapa de build é necessária)
    - **Diretório de saída do build**: `/` (raiz)
6. Clique em **Salvar e implantar**

Seu currículo estará disponível em `https://seu-projeto.pages.dev` em menos de um minuto.

### Upload direto (sem Git)

1. Vá para **Workers & Pages → Criar → Pages → Enviar arquivos**
2. Dê um nome ao seu projeto
3. Extraia o ZIP e arraste o conteúdo da pasta para a área de upload
4. Clique em **Implantar**

### Domínio personalizado no Cloudflare

1. No seu projeto do Pages, vá para **Domínios personalizados**
2. Clique em **Configurar um domínio personalizado**
3. Insira seu domínio — o Cloudflare gerencia o DNS automaticamente se o domínio estiver no Cloudflare

## Publicar no Netlify

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Arraste e solte a pasta ZIP extraída na área de implantação
3. Seu site estará disponível instantaneamente em uma URL `*.netlify.app`

## Atualizando seu site estático

Sempre que você atualizar seu currículo, reexporte o site estático e faça o upload dos arquivos novamente. O processo substitui a versão anterior.

!!! tip
    Para o fluxo de trabalho mais rápido com GitHub Pages ou Cloudflare Pages, mantenha um clone Git local e simplesmente substitua os arquivos e faça push:
    ```bash
    # In your static site repo
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```
