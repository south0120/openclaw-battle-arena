import type { Agent } from './summon'
import type { BattleAction } from './battle'

export interface JudgeContext {
  arena: string
  turnNumber: number
  agentA: Agent
  agentB: Agent
  actionA: BattleAction
  actionB: BattleAction
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

## 評価基準
- 創造性: 独自性、面白さ
- 論理性: 状況との整合性
- 説得力: 納得感
- 対応力: 相手への適切な対応

## 出力形式（JSON）
{
  "scoreA": { "total": 数値(0-40), "reasoning": "理由（1文）" },
  "scoreB": { "total": 数値(0-40), "reasoning": "理由（1文）" }
}
`.trim()
}
