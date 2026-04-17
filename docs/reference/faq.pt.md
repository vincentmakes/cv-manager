# FAQ

## Geral

??? question "Os meus dados são armazenados em algum servidor externo?"
    Não. Tudo corre localmente no seu servidor. Os dados do seu CV são armazenados num ficheiro de base de dados SQLite no diretório `/data`.

??? question "Posso executar o CV Manager sem Docker?"
    Sim. Instale o Node.js 18+, execute `npm install` no diretório do projeto e depois `node src/server.js`. A interface de administração corre na porta 3000 e o site público na porta 3001.

??? question "Várias pessoas podem usar a mesma instância?"
    O CV Manager foi concebido como uma aplicação para um único utilizador. Cada instância gere o CV de uma pessoa. Para várias pessoas, execute containers separados.

## Edição

??? question "Como marco uma posição como 'atual'?"
    Deixe o campo **Data de término** vazio. Será exibido como "Presente" no CV.

??? question "Posso reordenar itens dentro de uma secção?"
    Sim. A maioria dos itens suporta reordenação por arrastar e soltar. A ordem é guardada automaticamente.

??? question "Como adiciono marcadores a uma experiência?"
    Edite a experiência e insira os destaques no campo **Destaques** — um marcador por linha.

??? question "Como adiciono um logótipo da empresa?"
    Edite a experiência, desloque-se até à secção **Logótipo da empresa** e clique em **Escolher imagem** para carregar. Também pode clicar em **Usar existente** para reutilizar um logótipo já carregado. Ative a opção **"Sincronizar logótipo em todas as experiências de [Empresa]"** para aplicar o mesmo logótipo a todas as experiências nessa empresa.

??? question "Eliminei algo acidentalmente. Posso desfazer?"
    Não existe funcionalidade de desfazer. Como as edições são guardadas automaticamente no conjunto de dados ativo, a alteração é persistida imediatamente. Se tiver uma exportação anterior ou um conjunto de dados guardado separadamente, pode restaurar a partir daí. É boa prática exportar o seu CV regularmente como backup.

## Secções personalizadas

??? question "Quantas secções personalizadas posso criar?"
    Não existe limite rígido. Crie quantas precisar.

??? question "Posso alterar o tipo de layout de uma secção personalizada após criá-la?"
    Não. O tipo de layout é escolhido uma única vez na criação e depois fica bloqueado. Se precisar de um layout diferente, adicione uma nova secção personalizada com o layout pretendido, mova os itens para lá e elimine a secção antiga. O botão Renomear (lápis) no cabeçalho da secção apenas altera o título.

??? question "Qual a diferença entre os layouts 'Marcadores' e 'Texto livre'?"
    **Marcadores** apresenta cada linha como um item de lista com marcador e um título de grupo. **Texto livre** apresenta texto simples com quebras de linha preservadas e sem título — semelhante à secção Sobre/Bio.

## Impressão e PDF

??? question "Porque é que o meu PDF parece diferente do ecrã?"
    A saída de impressão usa estilos dedicados otimizados para papel. Alguns efeitos visuais (estados de hover, animações, gradientes) são simplificados. Itens ocultos e controlos de administração são removidos automaticamente.

??? question "Como faço para encaixar o meu CV em menos páginas?"
    Tente ativar **Permitir divisão de secções** e **Permitir divisão de itens** nas configurações de Impressão e exportação. Também pode ocultar itens ou secções menos importantes, ou usar layouts de secções personalizadas mais compactos. Além disso, ajuste a escala de impressão pela caixa de diálogo de impressão de qualquer navegador (às vezes fica um pouco escondida).

??? question "Porque é que alguns itens estão a faltar no meu CV impresso?"
    Verifique se esses itens foram alternados para oculto (ícone de olho). Itens ocultos são excluídos da saída de impressão e da visualização pública.

??? question "Os números de página não estão a aparecer?"
    Certifique-se de que **Números de página** está ativado em Configurações → Impressão e exportação. Alguns visualizadores de PDF do navegador podem não exibir números de página gerados por CSS — tente descarregar o PDF e abri-lo num leitor dedicado.

## Linha do tempo

??? question "A linha do tempo mostra datas erradas / apenas anos / datas completas?"
    A linha do tempo tem a sua própria configuração de data. Vá a **Configurações → Avançado → Linha do tempo: Apenas anos** para alternar entre exibição apenas de anos e o formato completo de data.

??? question "Posso adicionar entradas diretamente na linha do tempo?"
    Não. A linha do tempo é gerada automaticamente a partir das suas experiências profissionais. Adicione ou edite experiências e a linha do tempo é atualizada automaticamente.

??? question "A bandeira do país não está a aparecer na linha do tempo?"
    Certifique-se de que o campo **Código do país** na experiência está definido com um código de país ISO de 2 letras válido (por exemplo, `us`, `gb`, `ch`, `de`, `fr`). As bandeiras são carregadas de um CDN externo.

??? question "O que acontece quando tenho dois empregos ao mesmo tempo?"
    A linha do tempo deteta automaticamente posições sobrepostas e apresenta-as como **trilhas paralelas**. O emprego concorrente aparece numa linha de ramificação elevada com conectores em curva S mostrando os pontos de bifurcação e junção. Nenhuma configuração necessária — é baseado inteiramente nas suas datas de início/fim. Sobreposições inferiores a 1 mês são ignoradas (comum durante transições de emprego).

??? question "Porque é que a linha do tempo mostra um logótipo em vez do nome da empresa?"
    Se carregou um logótipo da empresa para essa experiência, a linha do tempo exibe a imagem do logótipo em vez do texto. Se o ficheiro do logótipo estiver em falta, volta a exibir o nome da empresa. Para remover um logótipo da linha do tempo, edite a experiência e clique em **Remover** na secção Logótipo da empresa.

## Idioma e atualizações

??? question "Como mudo o idioma da administração?"
    Clique no **ícone de globo** na barra de ferramentas e selecione um idioma na grelha. A alteração é aplicada imediatamente e guardada entre sessões.

??? question "Como verifico que versão estou a usar?"
    Abra as **Configurações** — o número da versão é mostrado no canto inferior esquerdo da janela modal (por exemplo, `v1.11.0`).

??? question "Não vejo o banner de atualização mesmo havendo uma nova versão disponível?"
    A verificação de versão é armazenada em cache durante 24 horas. Reinicie o seu servidor (ou container Docker) para limpar a cache e forçar uma nova verificação. O seu servidor também precisa de acesso de saída à internet para alcançar `raw.githubusercontent.com`.

## Conjuntos de dados / Múltiplos CVs

??? question "O que é o conjunto de dados 'Default'?"
    O conjunto de dados predefinido é a versão do seu CV que os visitantes veem no seu URL raiz (`/`). Na primeira instalação, o CV Manager cria automaticamente um conjunto de dados "Default" a partir dos dados do seu CV. Pode alterar qual conjunto de dados é o predefinido a qualquer momento usando o botão de rádio na janela modal do Gestor de CV.

??? question "As minhas edições são guardadas automaticamente?"
    Sim. Toda a alteração que faz na administração (adicionar, editar, eliminar, reordenar, alternar visibilidade) é automaticamente guardada no conjunto de dados ativo após um curto intervalo. O banner mostra "A guardar…" e depois "Guardado" para confirmar.

??? question "O que acontece quando 'Carrego' um conjunto de dados?"
    Carregar um conjunto de dados alterna a sua cópia de trabalho para esse conjunto de dados. As suas edições anteriores já foram guardadas automaticamente, portanto nada é perdido. O idioma da interface de administração também muda para corresponder ao idioma do conteúdo do conjunto de dados.

??? question "Os visitantes podem ver as minhas edições em tempo real?"
    Não. O site público serve o conjunto de dados predefinido congelado, não as suas edições em tempo real. Os visitantes só veem as alterações depois de o salvamento automático as gravar no conjunto de dados predefinido. Se estiver a editar um conjunto de dados que não é o predefinido, os visitantes não verão essas alterações até que o defina como predefinido.

??? question "Os visitantes podem ver os meus conjuntos de dados guardados?"
    Apenas se os tornar públicos. Cada conjunto de dados tem uma ação **Tornar partilhado** no menu overflow ⋮. Quando partilhado, essa versão fica acessível em `/v/slug` no site público (porta 3001). Conjuntos de dados privados são apenas pré-visualizáveis a partir da interface de administração.

??? question "Como partilho uma versão específica do CV com alguém?"
    Abra o **Gestor de CV**, use o menu ⋮ no conjunto de dados → **Tornar partilhado**, depois **Copiar URL**. Partilhe esse link — funciona no site público sem expor a sua interface de administração.

??? question "Posso ter várias versões públicas ao mesmo tempo?"
    Sim. Pode partilhar quantos conjuntos de dados quiser. Cada um recebe o seu próprio URL (por exemplo, `/v/technical-cv-1`, `/v/marketing-cv-2`). A página principal `/` mostra o conjunto de dados predefinido.

??? question "Posso eliminar o conjunto de dados predefinido?"
    Não. O conjunto de dados atualmente selecionado como predefinido (via botão de rádio) não pode ser eliminado. Defina um conjunto de dados diferente como predefinido primeiro e depois elimine o antigo.

??? question "Os motores de busca vão indexar os meus URLs versionados?"
    Por predefinição, não — páginas versionadas recebem `noindex, nofollow`. Para permitir a indexação, ative **Indexar URLs versionados** em Configurações → Avançado.

## Variantes linguísticas

??? question "Como crio um CV noutro idioma?"
    Abra o **Gestor de CV** e clique em **+ Adicionar idioma** no cabeçalho do grupo do conjunto de dados que pretende traduzir. Selecione o idioma de destino e guarde. A nova variante começa como uma cópia do conteúdo existente — depois mude para ela e traduza o texto.

??? question "Como funcionam as variantes linguísticas?"
    As variantes linguísticas são conjuntos de dados separados que partilham o mesmo nome e slug de URL. Estão ligadas por um grupo linguístico — alterações estruturais (ordem das secções, visibilidade, layout) sincronizam-se automaticamente entre todas as variantes, enquanto o conteúdo (texto, títulos, descrições) permanece independente.

??? question "Os visitantes podem alternar idiomas no site público?"
    Sim. Quando o conjunto de dados predefinido tem irmãos linguísticos, um botão de alternância de idioma aparece no site público. Os visitantes podem alternar entre URLs `/{lang}` (por exemplo, `/`, `/de`, `/fr`). Para conjuntos de dados partilhados não predefinidos, as variantes linguísticas estão em `/v/slug/{lang}`.

??? question "O que acontece quando defino uma variante linguística como predefinida?"
    Definir qualquer variante linguística como predefinida torna-a a versão principal em `/`. Os seus irmãos linguísticos ficam automaticamente acessíveis em `/{lang}` sem necessidade de os alternar como partilhados — são implicitamente públicos.

## Site público e SEO

??? question "Como partilho o meu CV?"
    Partilhe o URL do seu servidor público (porta 3001). Se configurou um domínio com Cloudflare Tunnel ou proxy reverso, partilhe esse domínio. O URL raiz mostra sempre o seu conjunto de dados predefinido. Também pode partilhar versões específicas usando URLs públicos versionados (veja [Conjuntos de dados](../guide/datasets.md)).

??? question "Os motores de busca vão indexar o meu CV?"
    Por predefinição, sim — a página pública principal inclui meta tags adequadas, um sitemap e robots.txt. Para impedir a indexação, altere a configuração **Indexação por motores de busca** para "No Index" em Configurações → Avançado. URLs públicos versionados (`/v/slug`) **não são indexados** por predefinição; ative **Indexar URLs versionados** se quiser que sejam rastreados.

??? question "Posso adicionar o Google Analytics ao meu CV?"
    Sim. Cole o seu código de rastreamento em **Configurações → Avançado → Código de rastreamento**. É injetado apenas nas páginas públicas.

## Docker e infraestrutura

??? question "As minhas alterações não estão a aparecer no site público?"
    O site público serve o **conjunto de dados predefinido**, que é atualizado automaticamente quando edita na administração. Tente um hard refresh (`Ctrl+Shift+R`) no site público. Se estiver a executar containers separados, certifique-se de que partilham o mesmo volume de dados.

??? question "Estou a receber um erro de 'port already in use'?"
    Altere o mapeamento de porta do host na sua configuração Docker. Por exemplo, mapeie para `3010:3000` e `3011:3001`. **Não** altere a variável de ambiente `PUBLIC_PORT` — essa é a porta interna do container.

??? question "Como faço backup dos meus dados?"
    Duas opções: use o botão **Exportar** na barra de ferramentas da administração (exporta JSON) ou faça backup do diretório `data/` que contém a base de dados SQLite e as imagens carregadas.

??? question "A foto de perfil não está a aparecer?"
    Certifique-se de que a imagem foi carregada pela interface de administração. O ficheiro é armazenado em `data/uploads/picture.jpeg`. Verifique as permissões do ficheiro se estiver a executar no Linux.
