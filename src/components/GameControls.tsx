import { useGameStore } from '@/game/store';
import { Play, Pause, SkipForward, RotateCcw, FastForward } from 'lucide-react';

// 游戏控制按钮组件 - 单一职责：只渲染开始/暂停/继续按钮
function ControlButtons() {
  const {
    status,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
  } = useGameStore();

  if (status === 'idle') {
    return (
      <button
        onClick={startGame}
        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 text-sm"
      >
        <Play className="w-4 h-4" />
        开始游戏
      </button>
    );
  }

  if (status === 'playing') {
    return (
      <button
        onClick={pauseGame}
        className="w-full py-1.5 px-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
      >
        <Pause className="w-4 h-4" />
        暂停
      </button>
    );
  }

  if (status === 'paused') {
    return (
      <button
        onClick={resumeGame}
        className="w-full py-1.5 px-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
      >
        <Play className="w-4 h-4" />
        继续
      </button>
    );
  }

  return (
    <button
      onClick={restartGame}
      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
    >
      <RotateCcw className="w-4 h-4" />
      再来一局
    </button>
  );
}

// 游戏模式选择组件 - 单一职责：只渲染模式选择
function GameModeSelector() {
  const { status, gameMode, setGameMode } = useGameStore();
  
  if (status !== 'idle') return null;

  return (
    <div className="mb-2">
      <p className="text-xs text-gray-400 mb-1.5">游戏模式:</p>
      <div className="flex gap-2">
        <button
          onClick={() => setGameMode('normal')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
            gameMode === 'normal'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          普通
        </button>
        <button
          onClick={() => setGameMode('endless')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
            gameMode === 'endless'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          无尽
        </button>
      </div>
    </div>
  );
}

// 自动开始开关组件 - 单一职责：自动开始波次开关
function AutoStartToggle() {
  const { status, autoStartWave, toggleAutoStart } = useGameStore();
  
  if (status !== 'playing' && status !== 'paused') return null;

  return (
    <div className="flex items-center justify-between py-1.5 px-2 bg-game-panel-light/50 rounded-lg">
      <span className="text-xs text-gray-300">自动开始下一波</span>
      <button
        onClick={toggleAutoStart}
        className={`w-10 h-5 rounded-full transition-all duration-200 ${
          autoStartWave ? 'bg-green-500' : 'bg-gray-600'
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
            autoStartWave ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// 波次控制按钮组件 - 单一职责：控制开始波次
function WaveControlButton() {
  const {
    status,
    waveInProgress,
    wave,
    maxWaves,
    gameMode,
    isCountdownActive,
    startWave,
    skipCountdown,
  } = useGameStore();

  if (status !== 'playing' && status !== 'paused') return null;

  const canStartWave = !waveInProgress && wave < maxWaves && status === 'playing';
  const displayMaxWaves = gameMode === 'endless' ? '∞' : maxWaves;

  if (isCountdownActive) {
    return (
      <button
        onClick={skipCountdown}
        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-500 hover:to-orange-400 text-white font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 text-sm"
      >
        <FastForward className="w-4 h-4" />
        立即开始
      </button>
    );
  }

  return (
    <button
      onClick={startWave}
      disabled={!canStartWave}
      className={`
        w-full py-2 px-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm
        ${canStartWave
          ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      <SkipForward className="w-4 h-4" />
      {waveInProgress ? '战斗中...' : `第 ${wave + 1}/${displayMaxWaves} 波`}
    </button>
  );
}

// 重新开始按钮组件 - 单一职责：重新开始按钮
function RestartButton() {
  const { status, restartGame } = useGameStore();
  
  if (status !== 'playing' && status !== 'paused') return null;

  return (
    <button
      onClick={restartGame}
      className="w-full py-1.5 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all duration-200 flex items-center justify-center gap-2 text-xs"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      重新开始
    </button>
  );
}

// 游戏控制主组件 - 单一职责：组合所有控制元素
export default function GameControls() {
  return (
    <div className="bg-game-panel/90 backdrop-blur-sm rounded-xl p-3 border border-game-magic/30 shadow-lg flex-shrink-0">
      <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
        <span>⚙️</span> 游戏控制
      </h3>

      <div className="space-y-2">
        <GameModeSelector />
        <ControlButtons />
        <AutoStartToggle />
        <WaveControlButton />
        <RestartButton />
      </div>

      <div className="mt-2 p-2 bg-game-panel-light/50 rounded-lg">
        <h4 className="text-xs font-bold text-gray-300 mb-1">📖 操作说明</h4>
        <ul className="text-[10px] text-gray-400 space-y-0.5">
          <li>• 选塔点击建造点放置</li>
          <li>• 选卡点击目标释放</li>
          <li>• 击败敌人获奖励</li>
        </ul>
      </div>
    </div>
  );
}
