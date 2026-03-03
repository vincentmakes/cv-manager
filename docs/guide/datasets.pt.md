# Datasets (Múltiplas Versões de CV)

## Como os Datasets Funcionam

Datasets são snapshots salvos do seu CV. Um dataset é sempre o **padrão** — esta é a versão que os visitantes veem na sua URL raiz (`/`). Você pode criar datasets adicionais para diferentes públicos (ex.: um CV técnico, um CV de gestão) e compartilhá-los em suas próprias URLs.

Quando você instala o CV Manager pela primeira vez, um dataset "Default" é criado automaticamente a partir dos dados do seu CV. Todas as edições que você faz no admin são **salvas automaticamente** no dataset ativo — não há uma etapa separada de "salvar".

## O Banner do Dataset Ativo

Um banner abaixo da barra de ferramentas mostra qual dataset você está editando no momento. Ele exibe:

- O **nome do dataset** (ex.: "Default", "CV Técnico")
- Um **selo "Default"** se este dataset é o que está sendo servido em `/`
- Um **status de salvamento automático** — exibe brevemente "Saving…" e depois "✓ Saved" após cada edição

Toda alteração que você faz (adicionar itens, editar conteúdo, reordenar, alternar visibilidade) é automaticamente salva no dataset ativo após um curto intervalo.

## Salvando um Novo Dataset

Clique em **Save As...** na barra de ferramentas, digite um nome (ex.: "CV Técnico", "Vaga de Marketing") e o estado atual do seu CV é salvo como um novo snapshot. O novo dataset se torna o ativo.

## O Modal Abrir

Clique em **Open...** para ver todos os datasets salvos. Uma **legenda** no topo explica os três controles:

| Controle | Finalidade |
|----------|------------|
| **Botão de rádio** | Seleciona qual dataset é servido na sua URL raiz `/` (o padrão) |
| **Toggle** | Compartilha outros datasets em sua própria URL `/v/slug` |
| **Botão de olho** | Visualiza um dataset salvo sem torná-lo público |

Cada linha de dataset mostra:

- **Nome** e data da última atualização
- **Selo "Default"** — no dataset selecionado com o botão de rádio
- **Selo "Editing"** — no dataset atualmente carregado no admin
- Uma **URL versionada** (ex.: `/v/technical-cv-1`) — oculta para o dataset padrão, pois ele é servido em `/`
- Botão **Load** — alterna para este dataset (mostra "Reload" se já estiver ativo)
- Botão **Delete** — remove permanentemente o dataset (desabilitado para o padrão atual)

## Definindo o Dataset Padrão

O dataset padrão é a versão que os visitantes veem quando acessam sua URL raiz (`/`). Para alterá-lo:

1. Abra o modal **Open...**
2. Clique no **botão de rádio** ao lado do dataset que você deseja como seu CV público
3. A alteração entra em vigor imediatamente — o site público agora serve esse dataset

Isso desacopla seu CV público da sua edição. Você pode editar conteúdo livremente no admin sem que os visitantes vejam alterações em andamento até que você esteja pronto.

## URLs Públicas Versionadas

Cada dataset salvo (exceto o padrão) recebe um caminho de URL único (ex.: `/v/technical-cv-1`). Por padrão, eles são **privados** — acessíveis apenas pela interface de admin para visualização.

Para compartilhar uma versão específica publicamente:

1. Abra o modal **Open...**
2. Encontre o dataset que você deseja compartilhar
3. Ative o **switch** ao lado dele — ele fica azul e um selo verde **Public** aparece
4. A URL `/v/slug` agora está acessível no **site público** (porta 3001)

Isso permite que você compartilhe versões personalizadas do CV com diferentes públicos. Por exemplo, você pode tornar um "CV Técnico" público para vagas de engenharia enquanto mantém um "CV de Gestão" privado até ser necessário.

**Copiando a URL**: Clique no ícone de cópia ao lado do slug para copiar a URL completa para sua área de transferência. A mensagem de toast informará se você copiou uma URL pública ou apenas de visualização.

!!! note
    A página pública principal em `/` sempre mostra o **dataset padrão** — não suas edições ao vivo. Isso significa que você pode experimentar com segurança no admin sem afetar o que os visitantes veem.
