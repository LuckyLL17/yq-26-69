import GameCanvas from '@/components/GameCanvas';
import StatusBar from '@/components/StatusBar';
import TowerPanel from '@/components/TowerPanel';
import TowerUpgradePanel from '@/components/TowerUpgradePanel';
import CardHand from '@/components/CardHand';
import GameControls from '@/components/GameControls';
import StartScreen from '@/components/StartScreen';
import GameOverModal from '@/components/GameOverModal';
import WaveRewardModal from '@/components/WaveRewardModal';
import BattleLog from '@/components/BattleLog';
import { useGameStore } from '@/game/store';
import { INITIAL_LIVES } from '@/game/config';

export default function Home() {
  const { status, selectedTowerId, lives } = useGameStore();
  const lowHealthThreshold = INITIAL_LIVES * 0.3;
  const isLowHealth = lives <= lowHealthThreshold && status === 'playing';

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg via-game-panel to-game-bg relative">
      <StartScreen />
      <GameOverModal />
      <WaveRewardModal />

      {isLowHealth && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div 
            className="absolute inset-0"
            style={{
              boxShadow: 'inset 0 0 100px 30px rgba(239, 68, 68, 0.6)',
              animation: 'pulse-red 1.5s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute top-0 left-0 right-0 h-32"
            style={{
              background: 'linear-gradient(to bottom, rgba(239, 68, 68, 0.5), transparent)',
              animation: 'pulse-red 1.5s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: 'linear-gradient(to top, rgba(239, 68, 68, 0.5), transparent)',
              animation: 'pulse-red 1.5s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute top-0 bottom-0 left-0 w-32"
            style={{
              background: 'linear-gradient(to right, rgba(239, 68, 68, 0.5), transparent)',
              animation: 'pulse-red 1.5s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute top-0 bottom-0 right-0 w-32"
            style={{
              background: 'linear-gradient(to left, rgba(239, 68, 68, 0.5), transparent)',
              animation: 'pulse-red 1.5s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {status !== 'idle' && (
        <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ⚔️ 魔法塔防：卡牌之战 ⚔️
            </h1>
          </div>

          <div className="mb-4">
            <StatusBar />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="lg:w-64 flex-shrink-0 order-2 lg:order-1 lg:relative">
              {/* lg 下使用绝对定位填满列高，避免左侧栏自身内容撑高整行（保持游戏画面决定行高） */}
              <div className="space-y-4 lg:absolute lg:inset-0 lg:overflow-y-auto">
                <TowerPanel />
                {selectedTowerId && <TowerUpgradePanel />}
              </div>
            </div>

            <div className="flex-1 order-1 lg:order-2 flex justify-center">
              <GameCanvas />
            </div>

            <div className="lg:w-64 flex-shrink-0 order-3 lg:relative">
              {/* lg 下右栏使用绝对定位填满游戏画面高度；BattleLog 通过 flex-1 自适应剩余空间 */}
              <div className="space-y-4 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:gap-4 lg:space-y-0 lg:min-h-0">
                <GameControls />
                <div className="lg:flex-1 lg:min-h-0">
                  <BattleLog />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <CardHand />
          </div>

          <div className="text-center mt-4 text-gray-600 text-sm">
            <p>💡 提示：建造防御塔阻击敌人，点击已建造的塔可以升级！</p>
          </div>
        </div>
      )}
    </div>
  );
}
