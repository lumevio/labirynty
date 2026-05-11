import { useMemo, useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function QuestGraphEditor() {
  const { quests, updateQuest } = useGameStore();

  const [selected, setSelected] = useState<number | null>(null);
  const [testPath, setTestPath] = useState<number[]>([]);

  const selectedQuest = useMemo(
    () => quests.find(q => q.id === selected),
    [selected, quests]
  );

  /* ---------------- ROOT / BROKEN ---------------- */

  const roots = useMemo(
    () => quests.filter(q => !q.requiresQuestId),
    [quests]
  );

  const broken = useMemo(
    () =>
      quests.filter(q => {
        if (!q.requiresQuestId) return false;
        return !quests.some(x => x.id === q.requiresQuestId);
      }),
    [quests]
  );

  /* ---------------- SAFE CONNECT ---------------- */

  const connect = (from: number, to: number) => {
    if (from === to) return; // ❌ no self loop

    const target = quests.find(q => q.id === to);
    if (!target) return;

    updateQuest(to, {
      requiresQuestId: from,
    });
  };

  /* ---------------- SIMULATION ENGINE ---------------- */

  const simulatePath = (startId: number) => {
    const visited = new Set<number>();
    let current = startId;
    const path: number[] = [];

    while (current && !visited.has(current)) {
      visited.add(current);
      path.push(current);

      const next = quests.find(q => q.requiresQuestId === current);
      current = next?.id || 0;
    }

    setTestPath(path);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-cyan-400">
          🧠 QUEST GRAPH EDITOR V4 (STABLE)
        </h1>
        <p className="text-xs text-white/50">
          logic engine / dependency system / flow builder
        </p>
      </div>

      {/* WARNINGS */}
      {broken.length > 0 && (
        <div className="p-2 border border-red-500 text-red-400 text-xs">
          ⚠ BROKEN LINKS: {broken.map(b => b.id).join(", ")}
        </div>
      )}

      {/* ROOTS */}
      <div className="p-2 border border-green-500 text-green-400 text-xs">
        🌱 ROOT NODES: {roots.map(r => r.id).join(", ")}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4">

        {/* NODES */}
        <div className="border border-white/10 p-3 rounded">
          <h2 className="text-yellow-400 mb-2">NODES</h2>

          {quests.map(q => (
            <div
              key={q.id}
              onClick={() => setSelected(q.id)}
              className={`p-2 mb-2 border cursor-pointer transition ${
                selected === q.id
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-white/10"
              }`}
            >
              <div className="flex justify-between">
                <span>#{q.id} {q.title || q.type}</span>
                <span className="text-xs text-white/40">
                  XP {q.points}
                </span>
              </div>

              <div className="text-[10px] text-white/40">
                requires: {q.requiresQuestId ?? "ROOT"}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  simulatePath(q.id);
                }}
                className="text-[10px] text-cyan-400 mt-1"
              >
                ▶ simulate
              </button>
            </div>
          ))}
        </div>

        {/* EDITOR */}
        <div className="border border-white/10 p-3 rounded">
          <h2 className="text-green-400 mb-2">
            CONNECTION ENGINE
          </h2>

          {!selectedQuest ? (
            <p className="text-white/50 text-sm">
              Select quest
            </p>
          ) : (
            <>
              <p className="text-sm mb-2">
                Selected: <b>#{selectedQuest.id}</b>
              </p>

              <p className="text-xs text-white/50 mb-2">
                Choose prerequisite:
              </p>

              {quests
                .filter(q => q.id !== selectedQuest.id)
                .map(q => (
                  <button
                    key={q.id}
                    onClick={() => connect(q.id, selectedQuest.id)}
                    className="block w-full text-left p-2 mb-1 border border-white/10 hover:border-cyan-400"
                  >
                    {q.id} → {q.title || q.type}
                  </button>
                ))}
            </>
          )}
        </div>
      </div>

      {/* FLOW PREVIEW */}
      <div className="border border-white/10 p-3 rounded">
        <h2 className="text-purple-400 mb-2">
          FLOW PREVIEW
        </h2>

        <div className="text-xs space-y-1">
          {quests.map(q => (
            <div key={q.id}>
              Q{q.id}
              {q.requiresQuestId
                ? ` ← Q${q.requiresQuestId}`
                : " (START)"}
            </div>
          ))}
        </div>
      </div>

      {/* SIMULATION */}
      {testPath.length > 0 && (
        <div className="border border-cyan-500 p-3">
          <h2 className="text-cyan-400 mb-2">
            🧪 SIMULATION
          </h2>

          <div className="text-xs">
            {testPath.map(id => (
              <span key={id} className="mr-2">
                → Q{id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}