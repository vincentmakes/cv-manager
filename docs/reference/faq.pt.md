# Perguntas Frequentes

## Geral

??? question "Meus dados são armazenados em algum servidor externo?"
    Não. Tudo roda localmente no seu servidor. Os dados do seu currículo são armazenados em um arquivo de banco de dados SQLite no diretório `/data`.

??? question "Posso executar o CV Manager sem Docker?"
    Sim. Instale o Node.js 18+, execute `npm install` no diretório do projeto e depois `node src/server.js`. O painel administrativo roda na porta 3000 e o site público na porta 3001.

??? question "Várias pessoas podem usar a mesma instância?"
    O CV Manager foi projetado como uma aplicação de usuário único. Cada instância gerencia o currículo de uma pessoa. Para várias pessoas, execute contêineres separados.

## Edição

??? question "Como marco uma posição como 'atual'?"
    Deixe o campo **End Date** vazio. Ele será exibido como "Present" no currículo.

??? question "Posso reordenar itens dentro de uma seção?"
    Sim. A maioria dos itens suporta reordenação por arrastar e soltar. A ordem é salva automaticamente.

??? question "Como adiciono marcadores a uma experiência?"
    Edite a experiência e insira os destaques no campo **Highlights** — um marcador por linha.

??? question "Como adiciono um logotipo de empresa?"
    Edite a experiência, role até a seção **Company Logo** e clique em **Choose image** para fazer upload. Você também pode clicar em **Use existing** para reutilizar um logotipo já enviado. Ative o toggle **"Sync logo across all [Company]"** para aplicar o mesmo logotipo a todas as experiências naquela empresa.

??? question "Excluí algo acidentalmente. Posso desfazer?"
    Não há recurso de desfazer. Como as edições são salvas automaticamente no dataset ativo, a alteração é persistida imediatamente. Se você tem uma exportação anterior ou um dataset salvo separado, pode restaurar a partir dele. É uma boa prática exportar seu currículo regularmente como backup.

## Seções Personalizadas

??? question "Quantas seções personalizadas posso criar?"
    Não há limite definido. Crie quantas precisar.

??? question "Posso alterar o tipo de layout de uma seção personalizada após criá-la?"
    Sim. Edite a seção e selecione um layout diferente. Note que alguns campos podem não ser transferidos entre tipos de layout (por exemplo, ao mudar de cards para social links).

??? question "Qual é a diferença entre os layouts 'Bullet Points' e 'Free Text'?"
    **Bullet Points** renderiza cada linha como um item de lista com marcador e um título de grupo. **Free Text** renderiza texto simples com quebras de linha preservadas e sem título — similar à seção About/Bio.

## Impressão e PDF

??? question "Por que meu PDF parece diferente da tela?"
    A saída de impressão usa estilos de impressão dedicados, otimizados para papel. Alguns efeitos visuais (estados de hover, animações, gradientes) são simplificados. Itens ocultos e controles administrativos são removidos automaticamente.

??? question "Como faço para que meu currículo caiba em menos páginas?"
    Tente ativar **Allow Section Splits** e **Allow Item Splits** nas configurações de Print & Export. Você também pode ocultar itens ou seções menos importantes, ou usar layouts de seções personalizadas mais compactos. Também é possível ajustar a escala de impressão pelo modal de impressão de qualquer navegador (às vezes um pouco escondido).

??? question "Por que alguns itens estão faltando no meu currículo impresso?"
    Verifique se esses itens foram marcados como ocultos (ícone de olho). Itens ocultos são excluídos da saída de impressão e da visualização pública.

??? question "Os números de página não estão aparecendo?"
    Certifique-se de que **Page Numbers** está ativado em Settings → Print & Export. Alguns visualizadores de PDF do navegador podem não exibir números de página gerados por CSS — tente baixar o PDF e abri-lo em um leitor dedicado.

## Linha do Tempo

??? question "A linha do tempo mostra as datas erradas / apenas anos / datas completas?"
    A linha do tempo tem sua própria configuração de data. Vá em **Settings → Advanced → Timeline: Years Only** para alternar entre a exibição apenas de anos e o formato de data completo.

??? question "Posso adicionar entradas diretamente na linha do tempo?"
    Não. A linha do tempo é gerada automaticamente a partir das suas experiências profissionais. Adicione ou edite experiências e a linha do tempo será atualizada automaticamente.

??? question "A bandeira do país não está aparecendo na linha do tempo?"
    Certifique-se de que o campo **Country Code** na experiência está definido com um código ISO de 2 letras válido (por exemplo, `us`, `gb`, `ch`, `de`, `fr`). As bandeiras são carregadas de um CDN externo.

??? question "O que acontece quando tenho dois empregos ao mesmo tempo?"
    A linha do tempo detecta automaticamente posições sobrepostas e as renderiza como **trilhas paralelas**. O emprego simultâneo aparece em uma linha de ramificação elevada com conectores em curva S mostrando os pontos de bifurcação e junção. Nenhuma configuração é necessária — é baseado inteiramente nas suas datas de início/término. Sobreposições menores que 1 mês são ignoradas (comuns durante transições de emprego).

??? question "Por que a linha do tempo mostra um logotipo em vez do nome da empresa?"
    Se você fez upload de um logotipo de empresa para essa experiência, a linha do tempo exibe a imagem do logotipo em vez de texto. Se o arquivo do logotipo estiver ausente, ele volta a exibir o nome da empresa. Para remover um logotipo da linha do tempo, edite a experiência e clique em **Remove** na seção Company Logo.

## Idioma e Atualizações

??? question "Como mudo o idioma do painel administrativo?"
    Clique no **ícone de globo** na barra de ferramentas e selecione um idioma no menu suspenso em grade. A alteração é aplicada imediatamente e salva entre sessões.

??? question "Como verifico qual versão estou usando?"
    Abra **Settings** — o número da versão é exibido no canto inferior esquerdo do modal (por exemplo, `v1.11.0`).

??? question "Não vejo o banner de atualização mesmo tendo uma nova versão disponível?"
    A verificação de versão é armazenada em cache por 24 horas. Reinicie seu servidor (ou contêiner Docker) para limpar o cache e forçar uma nova verificação. Seu servidor também precisa de acesso à internet para alcançar `raw.githubusercontent.com`.

## Datasets / Múltiplos Currículos

??? question "O que é o dataset 'Default'?"
    O dataset padrão é a versão do seu currículo que os visitantes veem na URL raiz (`/`). Na primeira instalação, o CV Manager cria automaticamente um dataset "Default" a partir dos dados do seu currículo. Você pode alterar qual dataset é o padrão a qualquer momento usando o botão de rádio no modal Open.

??? question "Minhas edições são salvas automaticamente?"
    Sim. Cada alteração feita no painel administrativo (adicionar, editar, excluir, reordenar, alternar visibilidade) é automaticamente salva no dataset ativo após um curto atraso. O banner mostra "Saving…" e depois "✓ Saved" para confirmar.

??? question "O que acontece quando eu 'Carrego' um dataset?"
    Carregar um dataset alterna sua cópia de trabalho para esse dataset. Suas edições anteriores já foram salvas automaticamente, então nada é perdido.

??? question "Os visitantes podem ver minhas edições em tempo real?"
    Não. O site público serve o dataset padrão congelado, não suas edições ao vivo. Os visitantes só veem as alterações após o salvamento automático gravá-las no dataset padrão. Se você estiver editando um dataset não padrão, os visitantes não verão essas alterações até que você o defina como padrão.

??? question "Os visitantes podem ver meus datasets salvos?"
    Somente se você torná-los públicos. Cada dataset tem um toggle no modal Open. Quando definido como público, essa versão se torna acessível em `/v/slug` no site público (porta 3001). Datasets privados só podem ser visualizados a partir da interface administrativa.

??? question "Como compartilho uma versão específica do currículo com alguém?"
    Abra o modal **Open...**, alterne o dataset para público e clique no ícone de copiar ao lado da URL do slug. Compartilhe esse link — ele funciona no site público sem expor sua interface administrativa.

??? question "Posso ter várias versões públicas ao mesmo tempo?"
    Sim. Você pode tornar quantos datasets quiser públicos. Cada um recebe sua própria URL (por exemplo, `/v/technical-cv-1`, `/v/marketing-cv-2`). A página principal `/` exibe o dataset padrão.

??? question "Posso excluir o dataset padrão?"
    Não. O dataset atualmente selecionado como padrão (pelo botão de rádio) não pode ser excluído. Defina um dataset diferente como padrão primeiro e depois exclua o antigo.

??? question "Os mecanismos de busca indexarão minhas URLs versionadas?"
    Por padrão, não — páginas versionadas recebem `noindex, nofollow`. Para permitir a indexação, ative **Index Versioned URLs** em Settings → Advanced.

## Site Público e SEO

??? question "Como compartilho meu currículo?"
    Compartilhe a URL do seu servidor público (porta 3001). Se você configurou um domínio com Cloudflare Tunnel ou um proxy reverso, compartilhe esse domínio. A URL raiz sempre mostra seu dataset padrão. Você também pode compartilhar versões específicas usando URLs públicas versionadas (veja [Datasets](../guide/datasets.md)).

??? question "Os mecanismos de busca indexarão meu currículo?"
    Por padrão, sim — a página pública principal inclui meta tags adequadas, um sitemap e robots.txt. Para impedir a indexação, altere a configuração de **Search Engine Indexing** para "No Index" em Settings → Advanced. URLs públicas versionadas (`/v/slug`) **não são indexadas** por padrão; ative **Index Versioned URLs** se quiser que sejam rastreadas.

??? question "Posso adicionar o Google Analytics ao meu currículo?"
    Sim. Cole seu código de rastreamento em **Settings → Advanced → Tracking Code**. Ele é injetado apenas nas páginas voltadas ao público.

## Docker e Infraestrutura

??? question "Minhas alterações não estão aparecendo no site público?"
    O site público serve o **dataset padrão**, que é atualizado automaticamente quando você edita no painel administrativo. Tente um hard refresh (`Ctrl+Shift+R`) no site público. Se estiver executando contêineres separados, certifique-se de que compartilham o mesmo volume de dados.

??? question "Estou recebendo um erro de 'porta já em uso'?"
    Altere o mapeamento de porta do host na sua configuração Docker. Por exemplo, mapeie para `3010:3000` e `3011:3001`. **Não** altere a variável de ambiente `PUBLIC_PORT` — essa é a porta interna do contêiner.

??? question "Como faço backup dos meus dados?"
    Duas opções: use o botão **Export** na barra de ferramentas do painel administrativo (exporta JSON), ou faça backup do diretório `data/` que contém o banco de dados SQLite e as imagens enviadas.

??? question "A foto de perfil não está aparecendo?"
    Certifique-se de que a imagem foi enviada pela interface administrativa. O arquivo é armazenado em `data/uploads/picture.jpeg`. Verifique as permissões do arquivo se estiver executando em Linux.
