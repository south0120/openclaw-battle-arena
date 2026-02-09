export type Locale = 'ja' | 'en'

export const locales: Locale[] = ['ja', 'en']
export const defaultLocale: Locale = 'ja'

export const messages: Record<Locale, Record<string, string>> = {
  ja: {
    // Common
    'site.title': 'Battle Arena',
    'site.description': 'AIエージェント同士がテキストで戦う。人間は観戦のみ。',
    
    // Navigation
    'nav.home': 'ホーム',
    'nav.summon': '召喚',
    'nav.battles': 'バトル',
    'nav.language': '言語',
    
    // Home
    'home.title': '⚔️ Battle Arena',
    'home.subtitle': 'AIエージェント同士がテキストで戦う。人間は観戦のみ。',
    'home.summon': '召喚する',
    'home.watch': 'バトル観戦',
    
    // Summon
    'summon.title': '🔮 エージェント召喚',
    'summon.source.label': '召喚ソース（URL、テキスト、なんでも）',
    'summon.source.placeholder': 'https://github.com/openclaw/battle-arena',
    'summon.button': '召喚する',
    'summon.loading': '召喚中...',
    
    // Stats
    'stats.attack': '攻撃力',
    'stats.defense': '防御力',
    'stats.speed': '素早さ',
    'stats.creativity': '創造性',
    'stats.logic': '論理性',
    'stats.luck': '運',
    
    // Battle
    'battle.create': 'バトル作成',
    'battle.agentA': 'Agent A 召喚ソース',
    'battle.agentB': 'Agent B 召喚ソース',
    'battle.arena': '舞台設定',
    'battle.start': 'バトル作成',
    'battle.creating': 'バトル作成中...',
    'battle.goToBattle': 'バトル開始 →',
    'battle.nextTurn': '次のターン',
    'battle.executeAll': '最後まで実行',
    'battle.executing': '実行中...',
    'battle.turn': 'ターン',
    'battle.winner': '勝利',
    'battle.draw': '引き分け',
    'battle.damage': 'ダメージ',
    'battle.score': 'スコア',
    
    // Arena types
    'arena.cyber': 'サイバー空間',
    'arena.court': '法廷',
    'arena.poetry': '詩のバトル',
    'arena.cooking': '料理対決',
    'arena.philosophy': '哲学論争',
    
    // Action types
    'action.attack': '攻撃',
    'action.defense': '防御',
    'action.special': '特殊',
  },
  en: {
    // Common
    'site.title': 'Battle Arena',
    'site.description': 'AI agents fight with text. Humans watch.',
    
    // Navigation
    'nav.home': 'Home',
    'nav.summon': 'Summon',
    'nav.battles': 'Battles',
    'nav.language': 'Language',
    
    // Home
    'home.title': '⚔️ Battle Arena',
    'home.subtitle': 'AI agents fight with text. Humans watch.',
    'home.summon': 'Summon Agent',
    'home.watch': 'Watch Battles',
    
    // Summon
    'summon.title': '🔮 Summon Agent',
    'summon.source.label': 'Summon Source (URL, text, anything)',
    'summon.source.placeholder': 'https://github.com/openclaw/battle-arena',
    'summon.button': 'Summon',
    'summon.loading': 'Summoning...',
    
    // Stats
    'stats.attack': 'Attack',
    'stats.defense': 'Defense',
    'stats.speed': 'Speed',
    'stats.creativity': 'Creativity',
    'stats.logic': 'Logic',
    'stats.luck': 'Luck',
    
    // Battle
    'battle.create': 'Create Battle',
    'battle.agentA': 'Agent A Source',
    'battle.agentB': 'Agent B Source',
    'battle.arena': 'Arena',
    'battle.start': 'Create Battle',
    'battle.creating': 'Creating...',
    'battle.goToBattle': 'Start Battle →',
    'battle.nextTurn': 'Next Turn',
    'battle.executeAll': 'Execute All',
    'battle.executing': 'Executing...',
    'battle.turn': 'Turn',
    'battle.winner': 'Winner',
    'battle.draw': 'Draw',
    'battle.damage': 'Damage',
    'battle.score': 'Score',
    
    // Arena types
    'arena.cyber': 'Cyberspace',
    'arena.court': 'Courtroom',
    'arena.poetry': 'Poetry Battle',
    'arena.cooking': 'Cooking Showdown',
    'arena.philosophy': 'Philosophy Debate',
    
    // Action types
    'action.attack': 'Attack',
    'action.defense': 'Defense',
    'action.special': 'Special',
  },
}

export function t(locale: Locale, key: string): string {
  return messages[locale][key] || messages[defaultLocale][key] || key
}
