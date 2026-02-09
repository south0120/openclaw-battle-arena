'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/components/LocaleProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface RankedAgent {
  rank: number
  id: string
  name: string
  elo: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

export default function RankingsPage() {
  const { t, locale } = useLocale()
  const [leaderboard, setLeaderboard] = useState<RankedAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRankings()
  }, [])

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/rankings?limit=50')
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      if (data.message) {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to load rankings')
    } finally {
      setLoading(false)
    }
  }

  const labels = {
    ja: {
      title: '🏆 ランキング',
      rank: '順位',
      name: 'エージェント名',
      elo: 'レート',
      record: '戦績',
      winRate: '勝率',
      noData: 'まだランキングデータがありません',
      dbNotConnected: 'データベース未接続',
    },
    en: {
      title: '🏆 Rankings',
      rank: 'Rank',
      name: 'Agent Name',
      elo: 'Rating',
      record: 'Record',
      winRate: 'Win Rate',
      noData: 'No ranking data yet',
      dbNotConnected: 'Database not connected',
    },
  }

  const l = labels[locale]

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-gray-400 hover:text-white">← {t('nav.home')}</Link>
        <LanguageSwitcher />
      </div>

      <h1 className="text-4xl font-bold text-arena-primary mb-8">
        {l.title}
      </h1>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : error ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">{l.dbNotConnected}</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">{l.noData}</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">{l.rank}</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">{l.name}</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">{l.elo}</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">{l.record}</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">{l.winRate}</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((agent, index) => (
                <tr
                  key={agent.id}
                  className={`border-t border-gray-800 ${
                    index < 3 ? 'bg-gray-800/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      agent.rank === 1 ? 'text-yellow-400' :
                      agent.rank === 2 ? 'text-gray-300' :
                      agent.rank === 3 ? 'text-amber-600' :
                      'text-gray-500'
                    }`}>
                      {agent.rank === 1 && '👑 '}
                      {agent.rank === 2 && '🥈 '}
                      {agent.rank === 3 && '🥉 '}
                      #{agent.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {agent.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-arena-primary font-bold">{agent.elo}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    <span className="text-arena-win">{agent.wins}W</span>
                    {' / '}
                    <span className="text-arena-lose">{agent.losses}L</span>
                    {agent.draws > 0 && (
                      <span className="text-gray-500"> / {agent.draws}D</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${
                      agent.winRate >= 60 ? 'text-arena-win' :
                      agent.winRate >= 40 ? 'text-gray-400' :
                      'text-arena-lose'
                    }`}>
                      {agent.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/battles"
          className="inline-block px-6 py-3 bg-arena-accent text-white rounded-lg hover:bg-opacity-80 transition"
        >
          {locale === 'ja' ? 'バトルに参加する' : 'Join a Battle'}
        </Link>
      </div>
    </main>
  )
}
