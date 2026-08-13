/* Constantes do sistema */

/* Planos disponíveis */
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Grátis',
    maxProducts: 10,
    maxImages: 3,
    maxCategories: 3,
    features: ['Catálogo básico', '1 layout', 'Envio por WhatsApp'],
    price: 0,
  },
  BASIC: {
    id: 'basic',
    name: 'Básico',
    maxProducts: 100,
    maxImages: 5,
    maxCategories: 10,
    features: ['Todos os layouts', 'Logo personalizada', 'Histórico de pedidos', 'Redes sociais'],
    price: 29.90,
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    maxProducts: -1,
    maxImages: 10,
    maxCategories: -1,
    features: ['Produtos ilimitados', 'Categorias ilimitadas', 'Suporte prioritário', 'Relatórios', 'Domínio personalizado'],
    price: 59.90,
  },
}

export function getPlan(planId = 'free') {
  return PLANS[String(planId).toUpperCase()] || PLANS.FREE
}

/* Etapas operacionais de um pedido */
export const ORDER_STATUSES = {
  pending: { label: 'Novo', tone: 'warning' },
  confirmed: { label: 'Confirmado', tone: 'info' },
  preparing: { label: 'Em preparação', tone: 'primary' },
  ready: { label: 'Pronto', tone: 'success' },
  delivered: { label: 'Entregue', tone: 'success' },
  cancelled: { label: 'Cancelado', tone: 'error' },
}

/* Roles de usuário */
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
}

/* Layouts disponíveis */
export const CATALOG_LAYOUTS = {
  MODERN: {
    id: 'modern',
    name: 'Moderno',
    description: 'Cards com sombra e zoom nas imagens',
    icon: 'M',
  },
  CLASSIC: {
    id: 'classic',
    name: 'Clássico',
    description: 'Lista com imagem e detalhes lado a lado',
    icon: 'C',
  },
  MINIMAL: {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Clean, tipografia elegante',
    icon: 'T',
  },
  GRID: {
    id: 'grid',
    name: 'Grade Compacta',
    description: 'Muitos produtos em pouco espaço',
    icon: 'G',
  },
}

/* Mensagens de autenticação */
export const AUTH_ERRORS = {
  'auth/email-already-in-use': 'Este email já está cadastrado',
  'auth/invalid-email': 'Email inválido',
  'auth/user-not-found': 'Usuário não encontrado',
  'auth/wrong-password': 'Senha incorreta',
  'auth/weak-password': 'A senha é muito fraca',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
  'auth/invalid-credential': 'Email ou senha incorretos',
}

/* Limites de upload */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_DIMENSION: 2000,
}
