export const SIMILARITY_THRESHOLD = 0.9; // 90% similarity required

export const EMOTION_SCORES: { [key: string]: number } = {
    'Afeto Positivo': 20,
    'Baixa Valência': -20,
    'Alta Excitação': -15,
    'Baixa Excitação': -25,
    'Neutro': 0,
};

export const EMOTION_COLORS: { [key: string]: string } = {
    'Afeto Positivo': 'text-green-400',
    'Baixa Valência': 'text-blue-400',
    'Alta Excitação': 'text-yellow-400',
    'Baixa Excitação': 'text-purple-400',
    'Neutro': 'text-gray-400',
    'Analisando...': 'text-gray-500',
};

export const EMOTION_EMOJIS: { [key: string]: string } = {
    'Afeto Positivo': '😊',
    'Baixa Valência': '😔',
    'Alta Excitação': '😟',
    'Baixa Excitação': '😴',
    'Neutro': '😐',
    'Analisando...': '🤔',
};