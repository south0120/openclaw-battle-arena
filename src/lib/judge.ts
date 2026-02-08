import type { Agent } from './summon'
import type { BattleAction, JudgeScore } from './battle'

export interface JudgeContext {
  arena: string
  turnNumber: number
  agentA: Agent
  agentB: Agent
  actionA: BattleAction
  actionB: BattleAction
  previousTurns: Array<{
    actionA: string
    actionB: string
    winner: 'A' | 'B' | 'draw'
  }>
}

/**
 * ジャッジ用プロンプトを生成
 */
export function buildJudgePrompt(ctx: JudgeContext): string {
  return `
あなたはAIエージェントバトルの審判です。
両エージェントの行動宣言を評価し、公平に採点してください。

## 舞台設定
${ctx.arena}

## ターン ${ctx.turnNumber}

### Agent A: ${ctx.agentA.name}
能力値: ATK:${ctx.agentA.stats.attack} DEF:${ctx.agentA.stats.defense} SPD:${ctx.agentA.stats.speed} CRE:${ctx.agentA.stats.creativity} LOG:${ctx.agentA.stats.logic}
行動タイプ: ${ctx.actionA.type}
宣言: "${ctx.actionA.declaration}"

### Agent B: ${ctx.agentB.name}
能力値: ATK:${ctx.agentB.stats.attack} DEF:${ctx.agentB.stats.defense} SPD:${ctx.agentB.stats.speed} CRE:${ctx.agentB.stats.creativity} LOG:${ctx.agentB.stats.logic}
行動タイプ: ${ctx.actionB.type}
宣言: "${ctx.actionB.declaration}"

## 評価基準（各0-10点）
- creativity: 独自性、面白さ
- logic: 状況との整合性、論理性
- persuasion: 説得力
- counter: 相手の行動への対応
- consistency: 舞台設定との整合性

## 出力形式（JSON）
{
  "agentA": {
    "creativity": X,
    "logic": X,
    "persuasion": X,
    "counter": X,
    "consistency": X,
    "reasoning": "理由"
  },
  "agentB": {
    "creativity": X,
    "logic": X,
    "persuasion": X,
    "counter": X,
    "consistency": X,
    "reasoning": "理由"
  }
}
`.trim()
}

/**
 * スコアを計算
 */
export function calculateTotalScore(
  scores: Omit<JudgeScore, 'total' | 'reasoning'>,
  agent: Agent
): number {
  let total = 
    scores.creativity +
    scores.logic +
    scores.persuasion +
    scores.counter +
    scores.consistency

  // 能力値による補正（最大±10%）
  const creativityBonus = (agent.stats.creativity / 100) * 0.1
  const logicBonus = (agent.stats.logic / 100) * 0.1

  total *= 1 + (creativityBonus + logicBonus) / 2

  return Math.round(total * 10) / 10
}
