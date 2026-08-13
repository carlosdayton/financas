import type { Category, TransactionType, Account } from '../types/finance';
import { getTodayLocalISO } from './date';

export interface ParsedTransaction {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  confidence: number; // 0 to 100
  accountId?: string;
  accountName?: string;
  isInstallment?: boolean;
  totalInstallments?: number;
  installmentAmount?: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Alimentação: [
    'almoço', 'almoco', 'jantar', 'lanche', 'comida', 'restaurante', 'mcdonalds',
    'ifood', 'pizza', 'supermercado', 'mercado', 'padaria', 'açougue', 'acougue',
    'feira', 'café', 'cafe', 'sorvete', 'hambúrguer', 'hamburguer', 'saque',
  ],
  Transporte: [
    'uber', '99', 'taxi', 'táxi', 'gasolina', 'combustivel', 'combustível', 'posto',
    'estacionamento', 'pedagio', 'pedágio', 'ônibus', 'onibus', 'metrô', 'metro',
    'passagem', 'mecânico', 'mecanico', 'pneu', 'ipva',
  ],
  Lazer: [
    'cinema', 'teatro', 'show', 'festa', 'bar', 'cerveja', 'jogo', 'steam',
    'playstation', 'xbox', 'netflix', 'spotify', 'prime', 'hbo', 'passeio',
    'viagem', 'ingresso', 'clube',
  ],
  Saúde: [
    'farmacia', 'farmácia', 'remédio', 'remedio', 'consulta', 'médico', 'medico',
    'dentista', 'exame', 'hospital', 'academia', 'suplemento', 'drogaria',
  ],
  Moradia: [
    'aluguel', 'condominio', 'condomínio', 'luz', 'água', 'agua', 'gás', 'gas',
    'internet', 'iptu', 'reforma', 'móveis', 'moveis', 'energia',
  ],
  Educação: [
    'curso', 'faculdade', 'escola', 'livro', 'udemy', 'mensalidade', 'material', 'estudo',
  ],
  Salário: [
    'salario', 'salário', 'prolabore', 'freelance', 'freela', 'pagamento', 'bônus',
    'bonus', 'rendimento', 'comissão', 'comissao', 'venda',
  ],
};

const INCOME_KEYWORDS = [
  'salario', 'salário', 'recebi', 'recebido', 'ganhei', 'pix recebido',
  'venda', 'reembolso', 'rendimento', 'deposito', 'depósito', 'entrada',
  'freelance', 'freela', 'comissão', 'comissao',
];

export function parseNaturalLanguageTransaction(
  input: string,
  categories: Category[],
  accounts: Account[] = []
): ParsedTransaction | null {
  const text = input.trim();
  if (!text) return null;

  const textLower = text.toLowerCase();

  // 1. Extração de Valor
  const amountRegex = /(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/i;
  const amountMatch = text.match(amountRegex);

  if (!amountMatch) return null;

  const rawAmountStr = amountMatch[1].replace(',', '.');
  const amount = parseFloat(rawAmountStr);
  if (isNaN(amount) || amount <= 0) return null;

  // 2. Detecção do Tipo (Receita vs Despesa)
  const isIncome = INCOME_KEYWORDS.some((kw) => textLower.includes(kw));
  const type: TransactionType = isIncome ? 'income' : 'expense';

  // 3. Detecção de Compras Parceladas ("X vezes" ou "Xx" ou "X parcelas")
  const installmentRegex = /(?:em\s+)?(\d{1,2})\s*(?:x|vezes|parcelas)/i;
  const installmentMatch = textLower.match(installmentRegex);
  let isInstallment = false;
  let totalInstallments = 1;
  let installmentAmount = amount;

  if (installmentMatch) {
    const num = parseInt(installmentMatch[1], 10);
    if (num > 1 && num <= 72) {
      isInstallment = true;
      totalInstallments = num;
      installmentAmount = amount / totalInstallments;
    }
  }

  // 4. Detecção da Conta Bancária ou Cartão
  let matchedAccount: Account | undefined = undefined;
  for (const acc of accounts) {
    if (textLower.includes(acc.name.toLowerCase())) {
      matchedAccount = acc;
      break;
    }
  }

  if (!matchedAccount && (textLower.includes('cartão') || textLower.includes('cartao') || textLower.includes('crédito') || textLower.includes('credito'))) {
    matchedAccount = accounts.find((acc) => acc.type === 'credit' || acc.name.toLowerCase().includes('cartão') || acc.name.toLowerCase().includes('cartao'));
  }

  if (!matchedAccount && accounts.length > 0) {
    matchedAccount = accounts[0];
  }

  // 5. Detecção de Data
  const today = getTodayLocalISO();
  let date = today;

  if (textLower.includes('ontem')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    date = d.toISOString().split('T')[0];
  } else if (textLower.includes('anteontem')) {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    date = d.toISOString().split('T')[0];
  } else if (textLower.includes('amanhã') || textLower.includes('amanha')) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    date = d.toISOString().split('T')[0];
  } else {
    const dayMatch = textLower.match(/dia\s+(\d{1,2})/);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1], 10);
      if (dayNum >= 1 && dayNum <= 31) {
        const d = new Date();
        d.setDate(dayNum);
        date = d.toISOString().split('T')[0];
      }
    }
  }

  // 6. Detecção de Categoria
  const filteredCategories = categories.filter((c) => c.type === type);
  let matchedCategory = filteredCategories[0]?.name || (type === 'income' ? 'Outras Receitas' : 'Outros');
  let highestCategoryScore = 0;

  for (const cat of filteredCategories) {
    const catNameLower = cat.name.toLowerCase();
    if (textLower.includes(catNameLower)) {
      matchedCategory = cat.name;
      highestCategoryScore = 100;
      break;
    }
  }

  if (highestCategoryScore < 100) {
    for (const [groupName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (textLower.includes(kw)) {
          const matchedUserCat = filteredCategories.find(
            (c) => c.name.toLowerCase().includes(groupName.toLowerCase()) || groupName.toLowerCase().includes(c.name.toLowerCase())
          );
          if (matchedUserCat) {
            matchedCategory = matchedUserCat.name;
            highestCategoryScore = 80;
            break;
          }
        }
      }
      if (highestCategoryScore > 0) break;
    }
  }

  // 7. Limpeza da Descrição
  let description = text
    .replace(amountMatch[0], '')
    .replace(/ontem|anteontem|amanhã|amanha|hoje/gi, '')
    .replace(/dia\s+\d{1,2}/gi, '');

  if (installmentMatch) {
    description = description.replace(installmentMatch[0], '');
  }

  if (matchedAccount) {
    const accRegex = new RegExp(matchedAccount.name, 'gi');
    description = description.replace(accRegex, '');
  }

  description = description
    .replace(/despesa|receita|paguei|ganhei|comprei|gastei|em|no|na|de|do|da|cartão|cartao|crédito|credito/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!description) {
    description = matchedCategory;
  } else {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  const confidence = Math.min(
    60 + (amount > 0 ? 15 : 0) + (highestCategoryScore > 0 ? 15 : 0) + (matchedAccount ? 10 : 0),
    100
  );

  return {
    description,
    amount,
    type,
    category: matchedCategory,
    date,
    confidence,
    accountId: matchedAccount?.id,
    accountName: matchedAccount?.name,
    isInstallment,
    totalInstallments,
    installmentAmount,
  };
}
