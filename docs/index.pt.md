# CV Manager

Um sistema auto-hospedado de gerenciamento de CV/currículo, implantado via Docker. Crie, personalize e compartilhe currículos profissionais a partir do seu próprio servidor.

---

## O que é o CV Manager?

CV Manager é uma aplicação web que roda no seu próprio servidor via Docker. Ele oferece duas interfaces:

- **Admin** (porta padrão 3000) — onde você cria e gerencia seu CV
- **Público** (porta padrão 3001) — uma versão somente leitura que você pode compartilhar com recrutadores, empregadores ou qualquer pessoa

Seus dados são armazenados localmente em um banco de dados SQLite. Nada é enviado para servidores externos.

## Principais Recursos

- **7 seções integradas** — Sobre, Linha do Tempo, Experiência, Certificações, Educação, Habilidades, Projetos
- **Seções personalizadas** — Adicione qualquer conteúdo com 7 tipos de layout (grades, listas, cartões, links sociais, marcadores, texto livre)
- **Visualização em linha do tempo** — Gerada automaticamente a partir das experiências profissionais com suporte a empregos simultâneos
- **Múltiplas versões de CV** — Salve conjuntos de dados para diferentes públicos com URLs versionadas públicas
- **Personalização de tema** — Seletor de cores, formatos de data, modo claro/escuro
- **Impressão e exportação para PDF** — Saída de impressão otimizada com números de página e divisão configuráveis
- **Compatível com ATS** — Marcação Schema.org, HTML semântico, bloco de texto oculto para ATS
- **8 idiomas de interface** — Inglês, Alemão, Francês, Holandês, Espanhol, Italiano, Português, Chinês
- **Importação e Exportação** — Backup e restauração completos em JSON
- **Implantação via Docker** — Instalação em uma linha, Docker Compose, suporte a Unraid

## Links Rápidos

<div class="grid cards" markdown>

- :material-rocket-launch: **[Primeiros Passos](getting-started/index.md)** — Instale e configure o CV Manager
- :material-book-open-variant: **[Guia do Usuário](guide/index.md)** — Aprenda a usar todos os recursos
- :material-cog: **[Avançado](advanced/index.md)** — SEO, segurança e configurações ATS
- :material-frequently-asked-questions: **[FAQ](reference/faq.md)** — Respostas para perguntas frequentes

</div>

## Suporte

- **GitHub**: [github.com/vincentmakes/cv-manager](https://github.com/vincentmakes/cv-manager)
- **Issues**: [github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **Apoie o projeto**: [ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)
