# Conjuntos de dados e variantes linguísticas

## Como funcionam os conjuntos de dados

Conjuntos de dados são snapshots salvos do seu CV. Um conjunto de dados é sempre o **predefinido** — esta é a versão que os visitantes veem no seu URL raiz (`/`). Você pode criar conjuntos de dados adicionais para diferentes públicos (por exemplo, um CV técnico, um CV de gestão), em diferentes idiomas, e partilhá-los nos seus próprios URLs.

Quando instala o CV Manager pela primeira vez, um conjunto de dados "Default" é criado automaticamente a partir dos dados do seu CV. Todas as edições que faz no admin são **guardadas automaticamente** no conjunto de dados ativo — não existe um passo separado de "guardar".

## O Gestor de CV

Clique em **Gestor de CV** na barra de ferramentas para abrir a janela modal unificada para todas as operações de conjuntos de dados: guardar, carregar, criar versões, adicionar idiomas, definir predefinidos e gerir visibilidade.

A janela modal tem duas zonas:

- Um **formulário "Guardar como"** no topo — campo de nome, seletor de idioma e botão de guardar
- Uma **lista de CVs guardados** abaixo — agrupados por nome base, com todas as ações de gestão

### Guardar um novo conjunto de dados

O campo de nome é pré-preenchido com o nome do conjunto de dados ativo. O menu de idioma está predefinido para o idioma ativo.

- **Digite um novo nome** e clique no botão azul **Guardar como novo "…"** para criar um conjunto de dados completamente novo
- **Clique numa linha existente** na lista para preencher o campo de nome — o botão muda para **Substituir "…"** laranja (com confirmação)

### Lista de conjuntos de dados

Cada CV guardado aparece como um **grupo** com um cabeçalho mostrando o nome base, um botão **+ Nova versão** e um badge com a contagem de versões/idiomas.

Dentro de cada grupo, cada variante linguística é uma linha:

```
○  EN  v2  Full Stack Developer v2     /v/full-stack-dev/en   16/04/2026   [Carregar]  ⋮
```

- **Botão de rádio** (○) — seleciona qual conjunto de dados os visitantes veem em `/` (o predefinido)
- **Badge de idioma** (EN) — o idioma do conteúdo desta variante
- **Badge de versão** (v2) — mostrado quando o grupo tem múltiplas versões
- **Nome** — o nome do conjunto de dados
- **URL** — o caminho do URL público (se partilhado ou predefinido)
- **Data** — última modificação
- **Carregar** — muda para editar este conjunto de dados
- **⋮** (menu overflow) — ações adicionais

### Menu overflow (⋮)

O menu overflow de cada linha contém:

| Ação | Descrição |
|------|-----------|
| **Tornar partilhado / Tornar privado** | Alterna a visibilidade pública em `/v/slug` (oculto para o predefinido e os seus irmãos linguísticos) |
| **Alterar idioma** | Reatribuir o código de idioma deste conjunto de dados |
| **Pré-visualizar** | Abre a versão guardada num novo separador |
| **Copiar URL** | Copia o URL público ou de pré-visualização para a área de transferência |
| **Eliminar** | Remove permanentemente (desativado para o conjunto de dados predefinido) |

## Versões

Conjuntos de dados que partilham o mesmo nome base são agrupados. Por exemplo, `Frontend Engineer`, `Frontend Engineer v2` e `Frontend Engineer v3` aparecem como um único bloco sob um cabeçalho partilhado.

### Criar uma nova versão

Clique em **+ Nova versão** no cabeçalho do grupo. O campo de nome é preenchido automaticamente com o próximo número de versão (por exemplo, `Frontend Engineer v4`). Quando guarda, a nova versão:

- Recebe um badge de versão adequado (v4)
- Partilha o mesmo slug de URL que os seus irmãos
- Herda todas as variantes linguísticas da versão anterior

### Versões anteriores recolhíveis

Quando um grupo tem múltiplas versões, apenas a mais recente é mostrada. Um botão **"N versões anteriores"** permite expandir para ver todas as versões. Se o conjunto de dados que está a editar ou o predefinido estiver numa versão anterior, expande automaticamente para que possa sempre vê-lo.

!!! tip
    Use a convenção de nomes `Base vN` (por exemplo, `Frontend Engineer`, `Frontend Engineer v2`) para obter agrupamento automático de versões e sugestões da próxima versão.

## Variantes linguísticas

Cada versão de um conjunto de dados pode ter múltiplas variantes linguísticas — por exemplo, uma versão em inglês e uma em alemão do mesmo CV, partilhando a mesma estrutura mas com conteúdo independente.

### Adicionar uma variante linguística

1. Abra o **Gestor de CV**
2. Clique em **+ Adicionar idioma** no cabeçalho do grupo (ou use o fluxo **⋮ → Adicionar idioma** a partir do formulário "Guardar como")
3. Selecione o idioma de destino e guarde

A nova variante começa como uma cópia do conteúdo existente. A interface de administração muda automaticamente para o novo idioma para que possa começar a traduzir.

### Alternar idiomas

Quando edita um conjunto de dados que tem irmãos linguísticos, um **seletor de idioma** aparece no banner do conjunto de dados ativo abaixo da barra de ferramentas. Clique num código de idioma para alternar — o seu trabalho atual é guardado automaticamente primeiro, depois a outra variante é carregada e o idioma da interface ajusta-se em conformidade.

### Sincronização estrutural

As alterações à **estrutura** — ordem das secções, visibilidade, layout de secções personalizadas e contagem de itens — propagam-se automaticamente a todos os irmãos linguísticos. O **conteúdo** (texto, títulos, descrições) permanece independente por idioma, para que possa traduzir livremente sem se preocupar com desalinhamentos de layout.

### Alterar o idioma de um conjunto de dados

Clique no **badge de idioma** em qualquer linha para abrir um seletor e reatribuir o código de idioma. Isto é útil para conjuntos de dados antigos que ficaram com inglês como predefinido durante a configuração inicial.

## Definir o predefinido

O conjunto de dados predefinido é a versão que os visitantes veem no seu URL raiz (`/`). Para alterá-lo:

1. Abra o **Gestor de CV**
2. Clique no **botão de rádio** (○) junto ao conjunto de dados que pretende como predefinido
3. A alteração entra em vigor imediatamente

Os irmãos linguísticos do predefinido ficam automaticamente acessíveis em `/{lang}` (por exemplo, `/de`, `/fr`) — não precisam de um toggle público separado.

!!! note
    O site público serve o conjunto de dados predefinido guardado, não as suas edições em tempo real. Pode experimentar com segurança na interface de administração sem afetar o que os visitantes veem.

## URLs públicos versionados

Conjuntos de dados não predefinidos podem ser partilhados nos seus próprios URLs. Use a ação **⋮ → Tornar partilhado** para tornar um conjunto de dados público em `/v/slug`. Múltiplos conjuntos de dados podem ser públicos simultaneamente.

- **Conjunto de dados predefinido**: servido em `/`
- **Irmãos linguísticos do predefinido**: servidos em `/{lang}` (por exemplo, `/fr`)
- **Conjuntos de dados partilhados**: servidos em `/v/slug` ou `/v/slug/{lang}`
- **Conjuntos de dados privados**: apenas pré-visualizáveis a partir da interface de administração

!!! tip "Copiar URLs"
    Clique no caminho do URL mostrado em cada linha para copiar o URL público completo para a sua área de transferência.
