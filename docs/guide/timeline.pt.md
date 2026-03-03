# Linha do Tempo

A linha do tempo é gerada automaticamente a partir das suas experiências profissionais. Ela exibe:

- Logotipos de empresas (ou nomes de empresas se nenhum logotipo estiver definido)
- Cargos
- Intervalos de datas
- Bandeiras de países (quando o país muda entre experiências)

## Navegação por Clique na Linha do Tempo

Clicar em qualquer item na linha do tempo rola até o cartão de experiência correspondente e o destaca brevemente.

## Empregos Simultâneos (Ramificação na Linha do Tempo)

Quando duas ou mais experiências profissionais se sobrepõem no tempo, a linha do tempo pode automaticamente renderizá-las como **trilhas paralelas**:

- A posição simultânea se divide em uma **trilha ramificada** acima da linha do tempo principal
- **Conectores em curva S** mostram visualmente onde a ramificação se separa e se junta à trilha principal
- Se uma posição paralela estiver em andamento (sem data de término), a linha da ramificação se estende até a borda direita da linha do tempo
- Cartões de itens na trilha ramificada são posicionados separadamente para evitar sobreposição com cartões da trilha principal

Nenhuma configuração é necessária — a ramificação é totalmente automática com base nas datas das suas experiências.

### Quando uma ramificação é criada?

Uma ramificação é criada quando duas experiências se sobrepõem por **3 ou mais meses**. Esse limiar filtra transições breves (começar um novo emprego um ou dois meses antes de sair do anterior) enquanto mostra corretamente posições genuinamente simultâneas.

**Exceção para posições curtas:** Se uma experiência for muito curta (por exemplo, um cargo interino de 2 meses) e estiver completamente dentro do período de outra posição, ela sempre aparecerá na trilha ramificada — mesmo que sua duração seja inferior a 3 meses. O importante é que toda a sua duração esteja contida nas datas da outra posição.

### Quando uma ramificação permanece contínua?

Se você mantém uma posição de longa duração (por exemplo, um trabalho em tempo parcial ou atividade secundária) ao lado de uma série de posições principais sucessivas, a ramificação permanece **contínua** — uma única linha paralela à trilha principal. Mesmo que uma das posições sucessivas seja curta demais para atingir o limiar de sobreposição, a ramificação não se funde e se bifurca novamente enquanto a mesma posição de longa duração for o ponto de ancoragem comum.

### Quando uma ramificação NÃO é criada?

- **Sobreposições de 1 a 2 meses** entre duas posições longas são tratadas como transições de emprego, não como emprego paralelo. Este é o caso mais comum — você começa um novo cargo pouco antes do término do aviso prévio no anterior.
- **Sem sobreposição** — posições sucessivas sem sobreposição de datas permanecem na trilha principal.
- **Espaço horizontal insuficiente** — se a linha do tempo estiver muito comprimida (muitos itens em uma largura reduzida), ramificações que seriam estreitas demais para serem exibidas claramente são automaticamente achatadas de volta à trilha principal.

## Formato de Data da Linha do Tempo

Por padrão, a linha do tempo mostra apenas anos (ex.: "2020 - 2023"). Você pode alterar isso em **Configurações → Avançado → Linha do Tempo: Apenas Anos**. Quando desativado, a linha do tempo usa o mesmo formato de data do restante do seu CV.
