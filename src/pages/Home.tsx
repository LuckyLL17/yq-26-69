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

// 低血量警告效果组件 - 单一职责：只负责低血量视觉警告
function LowHealthWarning() {
  return (
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
  );
}

// 游戏标题组件 - 单一职责：只负责显示游戏标题
function GameTitle() {
  return (
    <div className="text-center mb-2 flex-shrink-0">
      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        ⚔️ 魔法塔防：卡牌之战 ⚔️
      </h1>
    </div>
  );
}

// 左侧面板容器 - 单一职责：左侧塔选择和升级面板
function LeftSidebar({ selectedTowerId }: { selectedTowerId: string | null }) {
  return (
    <div className="lg:w-56 flex-shrink-0 order-2 lg:order-1 flex flex-col gap-2 h-full overflow-y-auto">
      <TowerPanel />
      {selectedTowerId && <TowerUpgradePanel />}
    </div>
  );
}

// 中间游戏区域容器 - 单一职责：包含游戏画布和底部卡牌，卡牌紧贴画布
function GameCenterContent() {
  return (
    <div className="flex-1 order-1 lg:order-2 flex flex-col items-center min-w-0 min-h-0 overflow-hidden">
      {/* 游戏画布 */}
      <div className="w-full flex-shrink-0">
        <GameCanvas />
      </div>
      {/* 底部卡牌区域 - 紧贴游戏画面底部 */}
      <div className="w-full flex-shrink-0 mt-1">
        <CardHand />
      </div>
    </div>
  );
}

// 右侧面板容器 - 单一职责：只负责右侧控制和日志面板
function RightSidebar() {
  return (
    <div className="lg:w-56 flex-shrink-0 order-3 flex flex-col gap-2 h-full min-h-0">
      <div className="flex-shrink-0">
        <GameControls />
      </div>
      <BattleLog />
    </div>
  );
}

// 主游戏区域组件 - 单一职责：组合游戏主界面布局
function GameMainContent({ selectedTowerId }: { selectedTowerId: string | null }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 三列布局：左面板、游戏画布+卡牌、右控制面板，大屏幕下三列等高 */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        <LeftSidebar selectedTowerId={selectedTowerId} />
        <GameCenterContent />
        <RightSidebar />
      </div>
      
      {/* 提示文字 */}
      <div className="text-center mt-1 text-gray-600 text-xs flex-shrink-0 py-1">
        <p>💡 提示：建造防御塔阻击敌人，点击已建造的塔可以升级！</p>
      </div>
    </div>
  );
}

// 主页组件 - 单一职责：组合所有游戏界面元素
export default function Home() {
  const { status, selectedTowerId, lives } = useGameStore();
  const lowHealthThreshold = INITIAL_LIVES * 0.3;
  const isLowHealth = lives <= lowHealthThreshold && status === 'playing';

  return (
    <div className="h-screen bg-gradient-to-b from-game-bg via-game-panel to-game-bg relative overflow-hidden flex flex-col">
      <StartScreen />
      <GameOverModal />
      <WaveRewardModal />
      
      {/* 低血量警告 */}
      {isLowHealth && <LowHealthWarning />}

      {status !== 'idle' && (
        <div className="container mx-auto px-3 py-3 max-w-7xl relative z-10 flex flex-col flex-1 min-h-0">
          <GameTitle />
          
          {/* 状态栏 */}
          <div className="flex-shrink-0 mb-2">
            <StatusBar />
          </div>
          
          {/* 游戏主内容区域 */}
          <GameMainContent selectedTowerId={selectedTowerId} />
        </div>
      )}
    </div>
  );
}
