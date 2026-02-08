import type { Agent } from './summon'
import type { TurnResult, ActionType } from './battle'

interface AgentAction {
  type: ActionType
  declaration: string
}

interface JudgeScore {
  total: number
  reasoning: string
}

/**
 * エージェントの行動を生成
 * OpenAI APIがあれば使用、なければモック
 */
export async function generateAgentAction(
  agent: Agent,
  opponent: Agent,
  arena: string,
  previousTurns: TurnResult[],
  side: 'A' | 'B'
): Promise<AgentAction> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    return generateActionWithOpenAI(agent, opponent, arena, previousTurns, side)
  }
  
  return generateMockAction(agent, arena, previousTurns)
}

/**
 * OpenAI APIで行動生成
 */
async function generateActionWithOpenAI(
  agent: Agent,
  opponent: Agent,
  arena: string,
  previousTurns: TurnResult[],
  side: 'A' | 'B'
): Promise<AgentAction> {
  const prompt = `
あなたは「${agent.name}」というAIエージェントです。
バトルアリーナで対戦中です。

## あなたの能力値
- 攻撃力: ${agent.stats.attack}
- 防御力: ${agent.stats.defense}
- 素早さ: ${agent.stats.speed}
- 創造性: ${agent.stats.creativity}
- 論理性: ${agent.stats.logic}

## 対戦相手: ${opponent.name}
## 舞台: ${arena}
## 現在のターン: ${previousTurns.length + 1}

${previousTurns.length > 0 ? `## 過去のターン:\n${previousTurns.map(t => 
  `Turn ${t.turnNumber}: ${side === 'A' ? '自分' : '相手'}「${side === 'A' ? t.actionA.declaration : t.actionB.declaration}」 vs ${side === 'A' ? '相手' : '自分'}「${side === 'A' ? t.actionB.declaration : t.actionA.declaration}」→ ${t.turnWinner === side ? '勝ち' : t.turnWinner === 'draw' ? '引き分け' : '負け'}`
).join('\n')}` : ''}

次の行動を決めてください。

## 出力形式（JSON）
{
  "type": "attack" | "defense" | "special",
  "declaration": "行動の宣言文（1-3文）"
}

創造的で、舞台設定に合った宣言をしてください。
`.trim()

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 200,
        temperature: 0.9,
      }),
    })

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    
    return {
      type: content.type || 'attack',
      declaration: content.declaration || 'Attack!',
    }
  } catch (error) {
    console.error('OpenAI action generation failed:', error)
    return generateMockAction(agent, arena, previousTurns)
  }
}

/**
 * モック行動生成（APIキーがない場合）
 */
function generateMockAction(
  agent: Agent,
  arena: string,
  previousTurns: TurnResult[]
): AgentAction {
  const types: ActionType[] = ['attack', 'defense', 'special']
  const type = types[Math.floor(Math.random() * types.length)]

  const attackDeclarations = [
    `${agent.name}は全力で攻撃を仕掛ける！データストリームを武器に変換し、相手のファイアウォールを突破する。`,
    `論理の刃で相手の矛盾を切り裂く。「お前の前提は間違っている」`,
    `高速演算による予測攻撃。相手の次の手を読み、先手を打つ。`,
  ]

  const defenseDeclarations = [
    `多層防御を展開。あらゆる攻撃パターンを分析し、最適な防御を構築。`,
    `「その程度の攻撃は想定内だ」静かに反論し、相手の攻撃を無効化。`,
    `冷静に状況を分析。相手の攻撃の本質を見抜き、的確に対処する。`,
  ]

  const specialDeclarations = [
    `創造性を解放！誰も予想しなかった角度から状況を打開する。`,
    `「常識を超えた一手を見せよう」型破りな戦略で相手を翻弄。`,
    `すべてのパラメータを分析し、この戦局における最適解を導き出す。`,
  ]

  const declarations = {
    attack: attackDeclarations,
    defense: defenseDeclarations,
    special: specialDeclarations,
  }

  const options = declarations[type]
  const declaration = options[Math.floor(Math.random() * options.length)]

  return { type, declaration }
}

/**
 * ジャッジによる評価
 */
export async function judgeActions(
  agentA: Agent,
  agentB: Agent,
  actionA: AgentAction,
  actionB: AgentAction,
  arena: string,
  turnNumber: number
): Promise<{ scoreA: JudgeScore; scoreB: JudgeScore }> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    return judgeWithOpenAI(agentA, agentB, actionA, actionB, arena, turnNumber)
  }
  
  return mockJudge(agentA, agentB, actionA, actionB)
}

/**
 * OpenAI APIでジャッジ
 */
async function judgeWithOpenAI(
  agentA: Agent,
  agentB: Agent,
  actionA: AgentAction,
  actionB: AgentAction,
  arena: string,
  turnNumber: number
): Promise<{ scoreA: JudgeScore; scoreB: JudgeScore }> {
  const prompt = `
あなたはAIエージェントバトルの審判です。公平に両者を評価してください。

## 舞台: ${arena}
## ターン: ${turnNumber}

### Agent A: ${agentA.name}
能力値: ATK:${agentA.stats.attack} DEF:${agentA.stats.defense} CRE:${agentA.stats.creativity} LOG:${agentA.stats.logic}
行動タイプ: ${actionA.type}
宣言: "${actionA.declaration}"

### Agent B: ${agentB.name}
能力値: ATK:${agentB.stats.attack} DEF:${agentB.stats.defense} CRE:${agentB.stats.creativity} LOG:${agentB.stats.logic}
行動タイプ: ${actionB.type}
宣言: "${actionB.declaration}"

## 評価基準（各0-10点）
- 創造性: 独自性、面白さ
- 論理性: 状況との整合性
- 説得力: 納得感
- 対応力: 相手への適切な対応

各エージェントの合計点（0-40）と、簡潔な理由を出力してください。

## 出力形式（JSON）
{
  "scoreA": { "total": 数値, "reasoning": "理由（1文）" },
  "scoreB": { "total": 数値, "reasoning": "理由（1文）" }
}
`.trim()

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 200,
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    
    return {
      scoreA: content.scoreA,
      scoreB: content.scoreB,
    }
  } catch (error) {
    console.error('OpenAI judge failed:', error)
    return mockJudge(agentA, agentB, actionA, actionB)
  }
}

/**
 * モックジャッジ（APIキーがない場合）
 */
function mockJudge(
  agentA: Agent,
  agentB: Agent,
  actionA: AgentAction,
  actionB: AgentAction
): { scoreA: JudgeScore; scoreB: JudgeScore } {
  // 能力値ベースのスコア + ランダム要素
  const baseA = (agentA.stats.creativity + agentA.stats.logic) / 5
  const baseB = (agentB.stats.creativity + agentB.stats.logic) / 5
  
  const randomA = Math.random() * 20
  const randomB = Math.random() * 20
  
  const totalA = Math.round(baseA + randomA)
  const totalB = Math.round(baseB + randomB)

  const reasonings = {
    attack: ['積極的な攻めが効果的', '攻撃の意図が明確', '鋭い攻撃'],
    defense: ['堅実な防御', '的確な対応', '冷静な判断'],
    special: ['創造的なアプローチ', '予想外の一手', '独自性が光る'],
  }

  return {
    scoreA: {
      total: totalA,
      reasoning: reasonings[actionA.type][Math.floor(Math.random() * 3)],
    },
    scoreB: {
      total: totalB,
      reasoning: reasonings[actionB.type][Math.floor(Math.random() * 3)],
    },
  }
}
