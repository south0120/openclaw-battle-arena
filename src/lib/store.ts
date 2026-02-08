import type { Battle } from './battle'

// インメモリストレージ（MVP用）
const battles = new Map<string, Battle>()

export function saveBattle(battle: Battle): void {
  battles.set(battle.id, battle)
}

export function getBattle(id: string): Battle | undefined {
  return battles.get(id)
}

export function updateBattle(battle: Battle): void {
  battles.set(battle.id, battle)
}

export function getAllBattles(): Battle[] {
  return Array.from(battles.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
