import { useState } from 'react';
import { useGameStore, QuestType } from '../store/gameStore';

const QUEST_TYPES: QuestType[] = [
  'quiz',
  'puzzle',
  'logic',
  'timer',
  'memory',
  'nfc',
  'minigame',
];

export default function AdminPanel() {
  const {
    adminUnlocked,
    quests,
    addQuest,
    updateQuest,
    deleteQuest,
    resetGame,
  } = useGameStore();

  const [titlePL, setTitlePL] = useState('');
  const [titleEN, setTitleEN] = useState('');

  const [type, setType] = useState<QuestType>('quiz');

  const [points, setPoints] = useState(100);

  if (!adminUnlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        🔒 ADMIN LOCKED
      </div>
    );
  }

  const createQuest = () => {
    addQuest({
      id: Date.now(),

      title: {
        pl: titlePL,
        en: titleEN,
      },

      description: {
        pl: '',
        en: '',
      },

      type,

      difficulty: 'easy',

      points,

      status: 'locked',

      nfcTagId: `NFC-${Date.now()}`,

      rewards: {
        xp: points,
      },

      steps: [],
    });

    setTitlePL('');
    setTitleEN('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-corn-gold">
          🧠 QUEST OS ADMIN
        </h1>

        <button
          onClick={resetGame}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl"
        >
          RESET GAME
        </button>
      </div>

      {/* BUILDER */}
      <div className="glass-corn rounded-2xl p-5 mb-8 border border-corn-gold/20">

        <h2 className="text-corn-gold mb-4 text-xl">
          ➕ CREATE QUEST
        </h2>

        <div className="grid md:grid-cols-2 gap-3">

          <input
            placeholder="Tytuł PL"
            value={titlePL}
            onChange={(e) => setTitlePL(e.target.value)}
            className="p-3 rounded-xl bg-black/40 border border-white/10"
          />

          <input
            placeholder="Title EN"
            value={titleEN}
            onChange={(e) => setTitleEN(e.target.value)}
            className="p-3 rounded-xl bg-black/40 border border-white/10"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as QuestType)}
            className="p-3 rounded-xl bg-black text-white border border-white/10"
          >
            {QUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="p-3 rounded-xl bg-black/40 border border-white/10"
          />
        </div>

        <button
          onClick={createQuest}
          className="mt-4 w-full bg-corn-gold text-black font-bold py-3 rounded-xl hover:scale-[1.01] transition-all"
        >
          CREATE QUEST
        </button>
      </div>

      {/* QUEST LIST */}
      <div className="space-y-4">

        {quests.map((q) => (
          <div
            key={q.id}
            className="glass-corn rounded-2xl border border-white/10 p-5"
          >

            <div className="flex justify-between items-center mb-4">

              <div>
                <h3 className="font-bold text-corn-gold">
                  {q.title.pl || 'NO TITLE'}
                </h3>

                <p className="text-xs text-white/40">
                  {q.type.toUpperCase()} • {q.points} XP
                </p>
              </div>

              <button
                onClick={() => deleteQuest(q.id)}
                className="text-red-500 hover:text-red-400"
              >
                DELETE
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">

              <input
                value={q.title.pl}
                onChange={(e) =>
                  updateQuest(q.id, {
                    title: {
                      ...q.title,
                      pl: e.target.value,
                    },
                  })
                }
                className="p-2 rounded-xl bg-black/40"
              />

              <input
                value={q.title.en}
                onChange={(e) =>
                  updateQuest(q.id, {
                    title: {
                      ...q.title,
                      en: e.target.value,
                    },
                  })
                }
                className="p-2 rounded-xl bg-black/40"
              />

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}