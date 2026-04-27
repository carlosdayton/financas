# Design Document: Advanced Analytics Module

## Overview

O módulo de Análises Avançadas é um sistema de análise preditiva e prescritiva que processa dados históricos de transações financeiras armazenados em localStorage para gerar insights automáticos, previsões de gastos, detecção de padrões, análise de tendências e sugestões inteligentes de economia. O sistema é implementado como uma camada analítica sobre os dados existentes do aplicativo de finanças pessoais, utilizando algoritmos estatísticos e técnicas de machine learning simplificadas executadas no cliente.

### Key Design Principles

1. **Client-Side Processing**: Todos os cálculos analíticos são executados no navegador do usuário, garantindo privacidade total dos dados financeiros
2. **Incremental Computation**: Análises são recalculadas apenas quando dados de entrada mudam, utilizando cache para otimizar performance
3. **Progressive Enhancement**: Funcionalidades analíticas são habilitadas progressivamente conforme o usuário acumula histórico suficiente
4. **Actionable Insights**: Cada insight gerado deve incluir uma ação sugerida clara para o usuário
5. **Performance-First**: Análises devem completar em menos de 2 segundos para até 1000 transações

### Scope

**In Scope:**
- Previsão de gastos baseada em média móvel ponderada
- Detecção automática de padrões recorrentes não cadastrados
- Identificação de anomalias e picos de gastos
- Análise de sazonalidade com visualização em heatmap
- Sugestões inteligentes de economia baseadas em benchmarks históricos
- Cálculo de tendências temporais usando regressão linear
- Dashboard de insights automáticos priorizados por relevância
- Score de saúde financeira com breakdown de fatores
- Comparações mês a mês e ano a ano
- Sistema de cache e persistência otimizado

**Out of Scope:**
- Integração com APIs externas ou serviços de terceiros
- Machine learning avançado (redes neurais, deep learning)
- Análise de dados de múltiplos usuários ou benchmarks externos
- Sincronização em nuvem ou processamento server-side
- Exportação de relatórios em PDF ou formatos complexos

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Analytics Page  │────────▶│  Insights Panel  │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │         useAdvancedAnalytics Hook               │        │
│  │  ┌──────────────────────────────────────────┐  │        │
│  │  │      Analytics Engine Core               │  │        │
│  │  │  • Forecast Calculator                   │  │        │
│  │  │  • Pattern Detector                      │  │        │
│  │  │  • Anomaly Detector                      │  │        │
│  │  │  • Seasonality Analyzer                  │  │        │
│  │  │  • Savings Suggester                     │  │        │
│  │  │  • Trend Calculator                      │  │        │
│  │  │  • Health Score Calculator               │  │        │
│  │  │  • Insight Generator                     │  │        │
│  │  └──────────────────────────────────────────┘  │        │
│  │                      │                          │        │
│  │                      ▼                          │        │
│  │  ┌──────────────────────────────────────────┐  │        │
│  │  │         Cache Manager                    │  │        │
│  │  │  • In-Memory Cache                       │  │        │
│  │  │  • Invalidation Logic                    │  │        │
│  │  │  • Dependency Tracking                   │  │        │
│  │  └──────────────────────────────────────────┘  │        │
│  └─────────────────────────────────────────────────┘        │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────┐        │
│  │         Analytics Storage Layer                 │        │
│  │  • localStorage persistence                     │        │
│  │  • Data versioning                              │        │
│  │  • Automatic cleanup                            │        │
│  └─────────────────────────────────────────────────┘        │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   localStorage   │
              │  • transactions  │
              │  • budgets       │
              │  • goals         │
              │  • analytics     │
              └──────────────────┘
```

### Component Architecture

O sistema é organizado em camadas:

1. **Presentation Layer**: Componentes React que exibem análises e insights
2. **Business Logic Layer**: Hook customizado `useAdvancedAnalytics` que orquestra todos os cálculos
3. **Analytics Engine Layer**: Módulos especializados para cada tipo de análise
4. **Cache Layer**: Sistema de cache em memória com invalidação inteligente
5. **Storage Layer**: Persistência em localStorage com versionamento

### Data Flow

```
User Action (Add Transaction)
    │
    ▼
useFinance Hook Updates
    │
    ▼
Analytics Cache Invalidation
    │
    ▼
useAdvancedAnalytics Recalculation
    │
    ├──▶ Forecast Calculator ──▶ Forecast Results
    ├──▶ Pattern Detector ──▶ Detected Patterns
    ├──▶ Anomaly Detector ──▶ Anomalies
    ├──▶ Seasonality Analyzer ──▶ Seasonal Patterns
    ├──▶ Savings Suggester ──▶ Savings Opportunities
    ├──▶ Trend Calculator ──▶ Trend Lines
    ├──▶ Health Score Calculator ──▶ Financial Health Score
    └──▶ Insight Generator ──▶ Prioritized Insights
    │
    ▼
Cache Update
    │
    ▼
localStorage Persistence
    │
    ▼
UI Re-render with New Analytics
```

## Components and Interfaces

### Core Hook: useAdvancedAnalytics

```typescript
interface AdvancedAnalyticsHook {
  // Forecast
  forecast: ForecastResult | null;
  
  // Pattern Detection
  detectedPatterns: DetectedPattern[];
  dismissPattern: (patternId: string) => void;
  acceptRecurringPattern: (pattern: DetectedPattern) => void;
  
  // Anomalies
  anomalies: Anomaly[];
  markAnomalyAsExpected: (anomalyId: string) => void;
  
  // Seasonality
  seasonalityData: SeasonalityData | null;
  
  // Savings Suggestions
  savingsOpportunities: SavingsOpportunity[];
  
  // Trends
  trends: TrendAnalysis[];
  
  // Insights
  insights: Insight[];
  dismissInsight: (insightId: string) => void;
  markInsightAsRead: (insightId: string) => void;
  
  // Health Score
  healthScore: HealthScore | null;
  
  // Comparisons
  monthComparison: ComparisonResult | null;
  yearComparison: ComparisonResult | null;
  customComparison: (period1: string, period2: string) => ComparisonResult;
  
  // State
  isCalculating: boolean;
  hasMinimumData: boolean;
  lastCalculated: Date | null;
}
```

### Analytics Engine Modules

#### 1. Forecast Calculator

```typescript
interface ForecastCalculator {
  calculate(
    transactions: Transaction[],
    recurring: RecurringTransaction[],
    installments: Installment[]
  ): ForecastResult;
}

interface ForecastResult {
  period: {
    start: string; // ISO date
    end: string;   // ISO date
  };
  categories: CategoryForecast[];
  total: {
    predicted: number;
    min: number;
    max: number;
    confidence: number; // 0-100
  };
  alerts: ForecastAlert[];
}

interface CategoryForecast {
  category: string;
  predicted: number;
  min: number;
  max: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  historicalAverage: number;
}

interface ForecastAlert {
  id: string;
  category: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  exceedsBy: number; // percentage
}
```

**Algorithm**: Weighted Moving Average (WMA) dos últimos 6 meses
- Pesos: [0.05, 0.10, 0.15, 0.20, 0.25, 0.25] (mais recente tem maior peso)
- Intervalo de confiança: ±20% do valor previsto
- Considera transações recorrentes e parcelamentos ativos

#### 2. Pattern Detector

```typescript
interface PatternDetector {
  detectRecurring(transactions: Transaction[]): DetectedPattern[];
  detectCategoryPatterns(transactions: Transaction[]): DetectedPattern[];
}

interface DetectedPattern {
  id: string;
  type: 'recurring' | 'category_suggestion' | 'spending_spike' | 'unusual_time';
  description: string;
  confidence: number; // 0-100
  transactions: Transaction[];
  suggestion: string;
  metadata: {
    frequency?: 'weekly' | 'biweekly' | 'monthly';
    averageAmount?: number;
    variance?: number;
    lastOccurrence?: string;
  };
  isDismissed: boolean;
  createdAt: string;
}
```

**Algorithm**: String Similarity + Interval Analysis
- Usa Levenshtein Distance para agrupar transações similares (threshold: 80%)
- Calcula intervalos entre ocorrências
- Identifica padrões com pelo menos 3 ocorrências
- Variação de valor < 10% para considerar recorrente

#### 3. Anomaly Detector

```typescript
interface AnomalyDetector {
  detectSpikes(transactions: Transaction[]): Anomaly[];
  detectUnusualPatterns(transactions: Transaction[]): Anomaly[];
}

interface Anomaly {
  id: string;
  type: 'spending_spike' | 'unusual_amount' | 'unusual_frequency';
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  currentValue: number;
  expectedValue: number;
  deviation: number; // percentage
  affectedTransactions: Transaction[];
  suggestions: string[];
  isExpected: boolean;
  detectedAt: string;
}
```

**Algorithm**: Statistical Outlier Detection
- Calcula média e desvio padrão dos últimos 3 meses por categoria
- Threshold = média + 1.5 * desvio padrão
- Classifica severidade baseado no desvio percentual:
  - Low: 50-100% acima do threshold
  - Medium: 100-200% acima
  - High: >200% acima

#### 4. Seasonality Analyzer

```typescript
interface SeasonalityAnalyzer {
  analyze(transactions: Transaction[]): SeasonalityData;
}

interface SeasonalityData {
  heatmap: HeatmapCell[][];
  seasonalPeriods: SeasonalPeriod[];
  upcomingSeasons: UpcomingSeason[];
}

interface HeatmapCell {
  month: number; // 1-12
  category: string;
  value: number;
  intensity: number; // 0-100, normalized
  isHighSeason: boolean;
}

interface SeasonalPeriod {
  category: string;
  months: number[]; // months where spending exceeds annual average by 25%
  averageIncrease: number; // percentage
  yearOverYearConsistency: number; // 0-100
}

interface UpcomingSeason {
  category: string;
  month: number;
  daysUntil: number;
  expectedAmount: number;
  message: string;
}
```

**Algorithm**: Year-over-Year Analysis
- Requer mínimo 12 meses de histórico
- Calcula média anual por categoria
- Identifica meses com gastos >25% acima da média
- Normaliza intensidade para escala 0-100 para visualização

#### 5. Savings Suggester

```typescript
interface SavingsSuggester {
  identifyOpportunities(
    transactions: Transaction[],
    budgets: Budget[]
  ): SavingsOpportunity[];
}

interface SavingsOpportunity {
  id: string;
  category: string;
  currentSpending: number;
  benchmark: number; // 6-month average
  potentialSavings: number;
  percentageReduction: number;
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
  progress: {
    isImproving: boolean;
    monthsImproving: number;
  };
}
```

**Algorithm**: Benchmark Comparison
- Calcula média dos últimos 6 meses por categoria (benchmark)
- Identifica categorias onde gasto atual excede benchmark em >15%
- Prioriza por impacto absoluto (valor de economia potencial)
- Rastreia progresso por 2 meses consecutivos

#### 6. Trend Calculator

```typescript
interface TrendCalculator {
  calculateTrends(transactions: Transaction[]): TrendAnalysis[];
}

interface TrendAnalysis {
  category: string;
  dataPoints: TrendDataPoint[];
  trendLine: {
    slope: number;
    intercept: number;
    rSquared: number; // goodness of fit
  };
  classification: 'increasing' | 'stable' | 'decreasing';
  monthlyChangeRate: number; // percentage
  projection: {
    nextMonth: number;
    next3Months: number;
  };
  alert: TrendAlert | null;
}

interface TrendDataPoint {
  month: string;
  value: number;
}

interface TrendAlert {
  message: string;
  consecutiveMonths: number;
  severity: 'info' | 'warning';
}
```

**Algorithm**: Simple Linear Regression
- Requer mínimo 6 meses de histórico
- Calcula linha de tendência: y = mx + b
- Classificação baseada na inclinação (slope):
  - Increasing: slope > 5%
  - Stable: -5% ≤ slope ≤ 5%
  - Decreasing: slope < -5%
- Alerta após 3 meses consecutivos de tendência crescente

#### 7. Health Score Calculator

```typescript
interface HealthScoreCalculator {
  calculate(
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    trends: TrendAnalysis[]
  ): HealthScore;
}

interface HealthScore {
  overall: number; // 0-100
  breakdown: {
    savingsRate: ScoreFactor;
    budgetCompliance: ScoreFactor;
    spendingTrend: ScoreFactor;
    incomeDiversification: ScoreFactor;
    goalProgress: ScoreFactor;
  };
  classification: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  changeFromLastMonth: number;
  history: HistoricalScore[];
  recommendations: string[];
}

interface ScoreFactor {
  score: number; // 0-100
  weight: number; // percentage
  description: string;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

interface HistoricalScore {
  month: string;
  score: number;
}
```

**Algorithm**: Weighted Score Calculation
- **Savings Rate (30%)**: (Income - Expenses) / Income * 100
  - Excellent: >20%, Good: 10-20%, Fair: 5-10%, Poor: 0-5%, Critical: <0%
- **Budget Compliance (25%)**: % of budgets not exceeded
  - Excellent: 100%, Good: 80-99%, Fair: 60-79%, Poor: 40-59%, Critical: <40%
- **Spending Trend (20%)**: Based on trend classification
  - Excellent: decreasing, Good: stable, Fair/Poor/Critical: increasing (by degree)
- **Income Diversification (15%)**: Number of income sources
  - Excellent: 3+, Good: 2, Fair: 1, Poor/Critical: 0 or negative
- **Goal Progress (10%)**: Average progress across all goals
  - Excellent: >80%, Good: 60-80%, Fair: 40-60%, Poor: 20-40%, Critical: <20%

#### 8. Insight Generator

```typescript
interface InsightGenerator {
  generate(
    forecast: ForecastResult,
    patterns: DetectedPattern[],
    anomalies: Anomaly[],
    seasonality: SeasonalityData,
    savings: SavingsOpportunity[],
    trends: TrendAnalysis[],
    healthScore: HealthScore
  ): Insight[];
}

interface Insight {
  id: string;
  type: 'anomaly' | 'opportunity' | 'trend' | 'seasonal' | 'achievement' | 'warning';
  priority: number; // 1-10, higher is more important
  title: string;
  description: string;
  visualization: InsightVisualization | null;
  action: InsightAction;
  relatedData: any;
  isDismissed: boolean;
  isRead: boolean;
  createdAt: string;
  expiresAt: string; // insights expire after 30 days
}

interface InsightVisualization {
  type: 'chart' | 'comparison' | 'progress' | 'heatmap';
  data: any;
}

interface InsightAction {
  label: string;
  type: 'navigate' | 'create_budget' | 'create_recurring' | 'view_details' | 'dismiss';
  payload?: any;
}
```

**Prioritization Algorithm**:
1. Anomalies (priority 9-10): Immediate attention required
2. Savings Opportunities (priority 7-8): High impact potential
3. Trends (priority 5-6): Important for planning
4. Seasonal Patterns (priority 3-4): Informational
5. Achievements (priority 1-2): Positive reinforcement

Limit: Maximum 10 insights displayed simultaneously

### Cache Manager

```typescript
interface CacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, dependencies: string[]): void;
  invalidate(dependency: string): void;
  clear(): void;
}

interface CacheEntry<T> {
  value: T;
  dependencies: string[];
  timestamp: number;
  hits: number;
}
```

**Cache Strategy**:
- In-memory cache durante a sessão
- Dependency tracking: cada análise declara suas dependências (transactions, budgets, goals)
- Invalidação automática quando dependências mudam
- Persistência em localStorage para análises custosas (trends, seasonality)

### Storage Layer

```typescript
interface AnalyticsStorage {
  save(data: AnalyticsData): void;
  load(): AnalyticsData | null;
  cleanup(): void; // Remove data older than 90 days
}

interface AnalyticsData {
  version: string; // for migration support
  lastCalculated: string;
  dismissedPatterns: string[];
  expectedAnomalies: string[];
  dismissedInsights: string[];
  healthScoreHistory: HistoricalScore[];
  metadata: {
    totalCalculations: number;
    averageCalculationTime: number;
  };
}
```

**Storage Key**: `financas_analytics_v1`

## Data Models

### Extended Transaction Type

```typescript
// Extends existing Transaction type
interface TransactionWithAnalytics extends Transaction {
  analytics?: {
    isAnomaly: boolean;
    isPartOfPattern: boolean;
    patternId?: string;
    seasonalityScore?: number;
  };
}
```

### Comparison Result

```typescript
interface ComparisonResult {
  period1: {
    label: string;
    start: string;
    end: string;
  };
  period2: {
    label: string;
    start: string;
    end: string;
  };
  categories: CategoryComparison[];
  totals: {
    period1: number;
    period2: number;
    absoluteChange: number;
    percentageChange: number;
  };
  topChanges: {
    increases: CategoryComparison[];
    decreases: CategoryComparison[];
  };
}

interface CategoryComparison {
  category: string;
  period1Amount: number;
  period2Amount: number;
  absoluteChange: number;
  percentageChange: number;
  direction: 'increase' | 'decrease' | 'stable';
}
```

## Error Handling

### Error Types

```typescript
enum AnalyticsErrorType {
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  CALCULATION_TIMEOUT = 'CALCULATION_TIMEOUT',
  STORAGE_ERROR = 'STORAGE_ERROR',
  INVALID_DATA = 'INVALID_DATA',
}

interface AnalyticsError {
  type: AnalyticsErrorType;
  message: string;
  context?: any;
  recoverable: boolean;
}
```

### Error Handling Strategy

1. **Insufficient Data**: Exibir mensagem amigável explicando requisitos mínimos
2. **Calculation Timeout**: Processar em lotes menores, exibir progresso
3. **Storage Error**: Fallback para cálculo sem cache, alertar usuário
4. **Invalid Data**: Sanitizar dados, logar erro, continuar com dados válidos

### Graceful Degradation

- Se análise específica falhar, outras análises continuam funcionando
- Insights são gerados apenas com dados disponíveis
- UI exibe estado de carregamento ou mensagem de erro específica por componente

## Testing Strategy

### Unit Tests

**Frameworks**: Vitest + React Testing Library

**Test Coverage**:
1. **Forecast Calculator**:
   - Cálculo de média móvel ponderada
   - Intervalo de confiança
   - Integração de recorrentes e parcelamentos
   - Edge cases: dados insuficientes, valores extremos

2. **Pattern Detector**:
   - Similaridade de strings (Levenshtein)
   - Detecção de intervalos regulares
   - Agrupamento de transações similares
   - Edge cases: transações únicas, variação alta

3. **Anomaly Detector**:
   - Cálculo de threshold estatístico
   - Classificação de severidade
   - Edge cases: sem histórico, todos os valores anômalos

4. **Seasonality Analyzer**:
   - Normalização de intensidade
   - Identificação de períodos sazonais
   - Edge cases: menos de 12 meses, sem sazonalidade

5. **Savings Suggester**:
   - Cálculo de benchmark
   - Priorização por impacto
   - Rastreamento de progresso
   - Edge cases: sem oportunidades, todas as categorias acima do benchmark

6. **Trend Calculator**:
   - Regressão linear
   - Classificação de tendências
   - Projeções futuras
   - Edge cases: dados insuficientes, tendência plana

7. **Health Score Calculator**:
   - Cálculo de cada fator
   - Ponderação correta
   - Classificação final
   - Edge cases: sem dados, scores extremos

8. **Insight Generator**:
   - Priorização correta
   - Limite de 10 insights
   - Agrupamento de insights relacionados
   - Edge cases: sem insights, muitos insights

9. **Cache Manager**:
   - Armazenamento e recuperação
   - Invalidação por dependência
   - Edge cases: cache cheio, dependências circulares

10. **Storage Layer**:
    - Persistência e carregamento
    - Limpeza automática
    - Versionamento
    - Edge cases: localStorage cheio, dados corrompidos

### Integration Tests

1. **End-to-End Analytics Flow**:
   - Adicionar transação → Invalidar cache → Recalcular análises → Atualizar UI
   - Testar com diferentes volumes de dados (10, 100, 1000 transações)

2. **Performance Tests**:
   - Medir tempo de cálculo para diferentes volumes
   - Verificar que cálculos completam dentro dos limites especificados
   - Testar eficiência do cache

3. **User Interaction Tests**:
   - Dismissar insights
   - Aceitar padrões recorrentes
   - Marcar anomalias como esperadas
   - Navegar entre comparações

### Performance Benchmarks

- **Target**: < 2 segundos para 1000 transações
- **Target**: < 5 segundos para 5000 transações
- **Cache Hit Rate**: > 80% em uso normal
- **Memory Usage**: < 50MB para análises completas

### Test Data Generation

Criar geradores de dados de teste que simulem:
- Padrões recorrentes realistas
- Sazonalidade (ex: gastos maiores em dezembro)
- Anomalias ocasionais
- Tendências crescentes/decrescentes
- Diferentes volumes de transações

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
- [ ] Implementar `useAdvancedAnalytics` hook base
- [ ] Implementar Cache Manager
- [ ] Implementar Storage Layer
- [ ] Configurar estrutura de testes

### Phase 2: Basic Analytics (Week 2)
- [ ] Implementar Forecast Calculator
- [ ] Implementar Pattern Detector
- [ ] Implementar Anomaly Detector
- [ ] Testes unitários para módulos básicos

### Phase 3: Advanced Analytics (Week 3)
- [ ] Implementar Seasonality Analyzer
- [ ] Implementar Savings Suggester
- [ ] Implementar Trend Calculator
- [ ] Implementar Health Score Calculator
- [ ] Testes unitários para módulos avançados

### Phase 4: Insights & UI (Week 4)
- [ ] Implementar Insight Generator
- [ ] Criar componentes de visualização
- [ ] Implementar dashboard de insights
- [ ] Testes de integração

### Phase 5: Optimization & Polish (Week 5)
- [ ] Otimização de performance
- [ ] Testes de performance
- [ ] Refinamento de UI/UX
- [ ] Documentação

## Dependencies

### External Libraries

- **recharts** (já instalado): Visualização de gráficos
- **date-fns** (adicionar): Manipulação de datas para cálculos temporais
- **lodash** (adicionar): Utilitários para cálculos estatísticos (mean, standardDeviation, etc.)

### Internal Dependencies

- `useFinance`: Fonte de dados de transações, budgets, goals
- `useInstallments`: Dados de parcelamentos para previsões
- `localStorage`: Persistência de análises e cache

## Performance Considerations

### Optimization Strategies

1. **Lazy Calculation**: Calcular análises apenas quando necessário (usuário navega para página de analytics)
2. **Memoization**: Usar `useMemo` para evitar recálculos desnecessários
3. **Web Workers**: Considerar mover cálculos pesados para Web Worker (fase futura)
4. **Batch Processing**: Processar transações em lotes de 500 para grandes volumes
5. **Progressive Loading**: Carregar insights progressivamente (mais importantes primeiro)

### Memory Management

- Limitar cache em memória a 100 entradas
- Implementar LRU (Least Recently Used) eviction policy
- Limpar dados de análises antigas (>90 dias) automaticamente

### Monitoring

Adicionar métricas de performance:
- Tempo de cálculo por módulo
- Taxa de acerto do cache
- Tamanho dos dados em localStorage
- Número de insights gerados

## Security & Privacy

### Data Privacy

- **Todos os dados permanecem no dispositivo do usuário**: Nenhum dado financeiro é enviado para servidores externos
- **Sem tracking ou analytics externos**: Não usar serviços de analytics que enviem dados do usuário
- **localStorage encryption**: Considerar criptografia dos dados analíticos (fase futura)

### Data Validation

- Validar todos os inputs antes de processar
- Sanitizar dados de transações para evitar valores inválidos
- Implementar limites máximos para evitar overflow (ex: valores > 1 bilhão)

## Accessibility

- Todos os gráficos devem ter descrições textuais alternativas
- Insights devem ser navegáveis por teclado
- Cores não devem ser o único indicador de informação (usar ícones também)
- Suportar leitores de tela com ARIA labels apropriados

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Machine Learning Avançado**:
   - Usar TensorFlow.js para previsões mais sofisticadas
   - Clustering de transações para categorização automática

2. **Comparações Customizadas**:
   - Permitir comparação entre quaisquer dois períodos
   - Comparação com "usuários similares" (dados agregados e anonimizados)

3. **Alertas Proativos**:
   - Notificações push quando anomalias são detectadas
   - Alertas de sazonalidade com antecedência

4. **Exportação de Relatórios**:
   - Gerar PDFs com análises completas
   - Exportar dados para Excel/CSV

5. **Integração com Metas**:
   - Sugerir ajustes em metas baseado em análises
   - Previsão de quando metas serão atingidas

6. **Análise de Investimentos**:
   - Rastrear ROI de investimentos
   - Sugerir alocação de recursos

