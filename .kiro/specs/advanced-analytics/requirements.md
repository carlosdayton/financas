# Requirements Document

## Introduction

Este documento especifica os requisitos para o módulo de Análises Avançadas do aplicativo de finanças pessoais. O módulo fornecerá capacidades analíticas avançadas incluindo previsão de gastos, detecção de padrões de consumo, sugestões inteligentes de economia, análise de tendências e insights automáticos. O sistema utilizará dados históricos de transações armazenados em localStorage para gerar análises preditivas e prescritivas que auxiliem o usuário na tomada de decisões financeiras.

## Glossary

- **Analytics_Engine**: O componente responsável por processar dados históricos e gerar análises, previsões e insights
- **Transaction_History**: Conjunto de todas as transações registradas pelo usuário no sistema
- **Spending_Pattern**: Padrão identificado no comportamento de gastos do usuário ao longo do tempo
- **Forecast_Model**: Modelo matemático que calcula previsões de gastos futuros baseado em dados históricos
- **Insight**: Descoberta automática sobre comportamento financeiro apresentada ao usuário
- **Financial_Health_Score**: Métrica numérica (0-100) que representa a saúde financeira geral do usuário
- **Seasonality**: Variação periódica nos gastos que se repete em intervalos regulares (mensal, trimestral, anual)
- **Spending_Threshold**: Limite calculado de gasto esperado para uma categoria baseado em histórico
- **Anomaly**: Transação ou padrão de gasto que desvia significativamente do comportamento histórico
- **Trend_Line**: Representação visual da direção geral dos gastos ao longo do tempo
- **Category_Benchmark**: Média histórica de gastos em uma categoria específica
- **Savings_Opportunity**: Categoria ou padrão identificado onde o usuário pode reduzir gastos

## Requirements

### Requirement 1: Previsão de Gastos Baseada em Histórico

**User Story:** Como usuário, eu quero visualizar previsões de meus gastos futuros baseadas em meu histórico, para que eu possa planejar melhor minhas finanças.

#### Acceptance Criteria

1. WHEN o usuário possui pelo menos 3 meses de histórico de transações, THE Analytics_Engine SHALL calcular previsões de gastos para os próximos 30 dias
2. THE Forecast_Model SHALL utilizar média móvel ponderada dos últimos 6 meses para calcular previsões por categoria
3. THE Analytics_Engine SHALL considerar transações recorrentes cadastradas no cálculo de previsões
4. THE Analytics_Engine SHALL considerar parcelamentos ativos no cálculo de previsões
5. WHEN o usuário visualiza a previsão, THE Analytics_Engine SHALL exibir intervalo de confiança (mínimo e máximo esperado) para cada categoria
6. THE Analytics_Engine SHALL recalcular previsões automaticamente quando novas transações forem adicionadas
7. WHEN gastos reais excedem a previsão em mais de 20%, THE Analytics_Engine SHALL gerar um alerta para o usuário

### Requirement 2: Detecção de Padrões de Consumo Recorrentes

**User Story:** Como usuário, eu quero que o sistema identifique automaticamente meus gastos recorrentes não cadastrados, para que eu possa gerenciá-los melhor.

#### Acceptance Criteria

1. WHEN o usuário possui pelo menos 2 meses de histórico, THE Analytics_Engine SHALL analisar transações para identificar padrões recorrentes
2. THE Analytics_Engine SHALL identificar como recorrente qualquer transação que ocorra pelo menos 3 vezes com intervalo regular (semanal, quinzenal ou mensal) e variação de valor menor que 10%
3. WHEN um padrão recorrente é detectado e não está cadastrado como transação recorrente, THE Analytics_Engine SHALL sugerir ao usuário cadastrá-lo
4. THE Analytics_Engine SHALL agrupar sugestões de recorrência por descrição similar (similaridade >= 80%)
5. THE Analytics_Engine SHALL permitir que o usuário aceite ou rejeite sugestões de recorrência
6. WHEN o usuário rejeita uma sugestão, THE Analytics_Engine SHALL armazenar a rejeição e não sugerir novamente o mesmo padrão

### Requirement 3: Detecção de Picos e Anomalias de Gastos

**User Story:** Como usuário, eu quero ser notificado quando meus gastos em uma categoria estiverem anormalmente altos, para que eu possa tomar ações corretivas.

#### Acceptance Criteria

1. WHEN o usuário possui pelo menos 3 meses de histórico em uma categoria, THE Analytics_Engine SHALL calcular o Spending_Threshold para aquela categoria
2. THE Analytics_Engine SHALL definir Spending_Threshold como média dos últimos 3 meses mais 1.5 desvios padrão
3. WHEN gastos mensais em uma categoria excedem o Spending_Threshold, THE Analytics_Engine SHALL classificar como Anomaly e notificar o usuário
4. THE Analytics_Engine SHALL exibir comparação visual entre gasto atual e média histórica na notificação
5. THE Analytics_Engine SHALL permitir que o usuário marque uma Anomaly como "esperada" para não receber alertas futuros similares
6. WHEN uma Anomaly é detectada, THE Analytics_Engine SHALL sugerir categorias alternativas onde o usuário pode reduzir gastos para compensar

### Requirement 4: Análise de Sazonalidade

**User Story:** Como usuário, eu quero entender quais períodos do ano meus gastos aumentam, para que eu possa me planejar financeiramente.

#### Acceptance Criteria

1. WHEN o usuário possui pelo menos 12 meses de histórico, THE Analytics_Engine SHALL analisar Seasonality por categoria
2. THE Analytics_Engine SHALL identificar meses onde gastos em uma categoria excedem a média anual em mais de 25%
3. THE Analytics_Engine SHALL exibir gráfico de calor (heatmap) mostrando intensidade de gastos por categoria e mês
4. THE Analytics_Engine SHALL destacar visualmente períodos de alta sazonalidade no gráfico
5. WHEN um período sazonal de alto gasto se aproxima (30 dias antes), THE Analytics_Engine SHALL alertar o usuário com previsão de gasto esperado
6. THE Analytics_Engine SHALL permitir que o usuário visualize comparação ano a ano para identificar tendências sazonais

### Requirement 5: Sugestões Inteligentes de Economia

**User Story:** Como usuário, eu quero receber sugestões personalizadas de onde posso economizar, para que eu possa melhorar minha saúde financeira.

#### Acceptance Criteria

1. WHEN o usuário possui pelo menos 3 meses de histórico, THE Analytics_Engine SHALL identificar Savings_Opportunity em categorias de despesa
2. THE Analytics_Engine SHALL calcular Category_Benchmark como média dos últimos 6 meses para cada categoria
3. WHEN gastos atuais em uma categoria excedem o Category_Benchmark em mais de 15%, THE Analytics_Engine SHALL classificar como Savings_Opportunity
4. THE Analytics_Engine SHALL priorizar sugestões de economia por impacto potencial (valor absoluto de economia)
5. THE Analytics_Engine SHALL exibir para cada sugestão: categoria, gasto atual, média histórica, economia potencial e percentual de redução necessário
6. WHEN o usuário reduz gastos em uma categoria sugerida por 2 meses consecutivos, THE Analytics_Engine SHALL exibir mensagem de reconhecimento positivo
7. THE Analytics_Engine SHALL sugerir ajustes nos orçamentos cadastrados baseado em padrões de economia identificados

### Requirement 6: Análise de Tendências Temporais

**User Story:** Como usuário, eu quero visualizar tendências de longo prazo nos meus gastos, para que eu possa entender se estou melhorando ou piorando financeiramente.

#### Acceptance Criteria

1. WHEN o usuário possui pelo menos 6 meses de histórico, THE Analytics_Engine SHALL calcular Trend_Line para gastos totais e por categoria
2. THE Analytics_Engine SHALL utilizar regressão linear simples para calcular a Trend_Line
3. THE Analytics_Engine SHALL classificar tendências como: crescente (inclinação > 5%), estável (-5% a +5%), ou decrescente (inclinação < -5%)
4. THE Analytics_Engine SHALL exibir gráfico de linha com dados históricos e Trend_Line sobreposta
5. THE Analytics_Engine SHALL calcular taxa de crescimento/redução mensal percentual para cada categoria
6. WHEN uma categoria apresenta tendência crescente por 3 meses consecutivos, THE Analytics_Engine SHALL alertar o usuário
7. THE Analytics_Engine SHALL permitir comparação lado a lado de tendências entre diferentes períodos (trimestre atual vs anterior, ano atual vs anterior)

### Requirement 7: Dashboard de Insights Automáticos

**User Story:** Como usuário, eu quero ver um resumo dos principais insights sobre minhas finanças, para que eu possa rapidamente entender minha situação financeira.

#### Acceptance Criteria

1. THE Analytics_Engine SHALL gerar automaticamente pelo menos 5 insights relevantes baseados nos dados do usuário
2. THE Analytics_Engine SHALL priorizar insights por relevância: anomalias > oportunidades de economia > tendências > padrões sazonais
3. THE Analytics_Engine SHALL exibir cada insight com: título descritivo, descrição detalhada, visualização gráfica quando aplicável, e ação sugerida
4. THE Analytics_Engine SHALL atualizar insights automaticamente quando novas transações forem adicionadas
5. THE Analytics_Engine SHALL permitir que o usuário marque insights como "lido" ou "dispensar"
6. WHEN um insight é dispensado, THE Analytics_Engine SHALL não exibir insights similares pelos próximos 30 dias
7. THE Analytics_Engine SHALL agrupar insights relacionados (exemplo: múltiplas anomalias na mesma categoria)
8. THE Analytics_Engine SHALL limitar exibição a no máximo 10 insights simultâneos, priorizando os mais recentes e relevantes

### Requirement 8: Score de Saúde Financeira

**User Story:** Como usuário, eu quero ver uma pontuação geral da minha saúde financeira, para que eu possa acompanhar meu progresso ao longo do tempo.

#### Acceptance Criteria

1. WHEN o usuário possui pelo menos 1 mês de histórico, THE Analytics_Engine SHALL calcular o Financial_Health_Score
2. THE Financial_Health_Score SHALL ser um valor entre 0 e 100, onde 100 representa saúde financeira excelente
3. THE Analytics_Engine SHALL calcular o score baseado em 5 fatores ponderados: taxa de poupança (30%), cumprimento de orçamentos (25%), tendência de gastos (20%), diversificação de receitas (15%), e progresso em metas (10%)
4. THE Analytics_Engine SHALL exibir o score com indicador visual (cor e ícone) classificado como: excelente (80-100), bom (60-79), regular (40-59), ruim (20-39), crítico (0-19)
5. THE Analytics_Engine SHALL exibir breakdown detalhado mostrando pontuação de cada fator individual
6. THE Analytics_Engine SHALL calcular e exibir variação do score em relação ao mês anterior
7. THE Analytics_Engine SHALL manter histórico mensal do score para visualização de evolução temporal
8. WHEN o score diminui mais de 10 pontos em um mês, THE Analytics_Engine SHALL gerar alerta explicando os principais fatores da queda

### Requirement 9: Comparação Mês a Mês e Ano a Ano

**User Story:** Como usuário, eu quero comparar meus gastos entre diferentes períodos, para que eu possa identificar mudanças no meu comportamento financeiro.

#### Acceptance Criteria

1. THE Analytics_Engine SHALL permitir comparação de gastos entre mês atual e mês anterior
2. THE Analytics_Engine SHALL permitir comparação de gastos entre mês atual e mesmo mês do ano anterior
3. THE Analytics_Engine SHALL calcular variação percentual e absoluta para cada categoria comparada
4. THE Analytics_Engine SHALL exibir comparações em formato de tabela com indicadores visuais (setas e cores) para aumentos e reduções
5. THE Analytics_Engine SHALL destacar as 3 categorias com maior variação (positiva ou negativa) em cada comparação
6. THE Analytics_Engine SHALL permitir que o usuário selecione períodos customizados para comparação (qualquer mês dos últimos 24 meses)
7. THE Analytics_Engine SHALL exibir gráfico de barras lado a lado para visualização comparativa de categorias

### Requirement 10: Persistência e Performance de Análises

**User Story:** Como desenvolvedor, eu quero que as análises sejam calculadas eficientemente e armazenadas adequadamente, para que o aplicativo mantenha boa performance.

#### Acceptance Criteria

1. THE Analytics_Engine SHALL armazenar resultados de análises em localStorage com chave separada das transações
2. THE Analytics_Engine SHALL recalcular análises apenas quando dados de entrada (transações, orçamentos, metas) forem modificados
3. THE Analytics_Engine SHALL utilizar cache em memória para análises já calculadas durante a sessão atual
4. WHEN o usuário possui mais de 1000 transações, THE Analytics_Engine SHALL processar análises em lotes de no máximo 500 transações por iteração
5. THE Analytics_Engine SHALL completar cálculo de todas as análises em menos de 2 segundos para conjuntos de até 1000 transações
6. THE Analytics_Engine SHALL completar cálculo de todas as análises em menos de 5 segundos para conjuntos de até 5000 transações
7. WHEN cálculos excedem 1 segundo, THE Analytics_Engine SHALL exibir indicador de carregamento para o usuário
8. THE Analytics_Engine SHALL limpar dados de análises com mais de 90 dias automaticamente para economizar espaço

