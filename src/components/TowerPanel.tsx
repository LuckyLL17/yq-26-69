import { useGameStore } from '@/game/store';
import { TOWER_CONFIGS, getTowerLevelConfig } from '@/game/config';
import type { TowerType } from '@/game/types';

// 单个塔选项组件 - 单一职责：只渲染单个塔选择按钮
interface TowerOptionProps {
  type: TowerType;
  config: typeof TOWER_CONFIGS.arrow;
  isSelected: boolean;
  canAfford: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function TowerOption({ type, config, isSelected, canAfford, isDisabled, onClick }: TowerOptionProps) {
  const levelConfig = getTowerLevelConfig(type, 1);
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full p-2 rounded-lg border-2 transition-all duration-200 text-left
        ${isSelected
          ? 'border-game-magic bg-game-magic/20 shadow-lg shadow-game-magic/30 scale-[1.02]'
          : 'border-game-panel-light bg-game-panel-light/50 hover:border-game-magic/50 hover:bg-game-panel-light'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}
      `}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: config.color + '30' }}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">{config.name}</span>
            <span className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
              💰{levelConfig.cost}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 truncate">{config.description}</p>
        </div>
      </div>
    </button>
  );
}

// 防御塔面板主组件 - 单一职责：组合塔选择列表
export default function TowerPanel() {
  const { selectedTowerType, selectTowerType, gold, status } = useGameStore();

  const towerTypes = Object.entries(TOWER_CONFIGS) as [TowerType, typeof TOWER_CONFIGS.arrow][];

  return (
    <div className="bg-game-panel/90 backdrop-blur-sm rounded-xl p-3 border border-game-magic/30 shadow-lg flex-shrink-0">
      <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
        <span>🏰</span> 防御塔
      </h3>

      <div className="space-y-1.5">
        {towerTypes.map(([type, config]) => {
          const levelConfig = getTowerLevelConfig(type, 1);
          const canAfford = gold >= levelConfig.cost;
          const isSelected = selectedTowerType === type;
          const isDisabled = !canAfford || status !== 'playing';

          return (
            <TowerOption
              key={type}
              type={type}
              config={config}
              isSelected={isSelected}
              canAfford={canAfford}
              isDisabled={isDisabled}
              onClick={() => !isDisabled && selectTowerType(isSelected ? null : type)}
            />
          );
        })}
      </div>

      {selectedTowerType && (
        <p className="text-xs text-purple-400 mt-2 text-center animate-pulse">
          点击地图建造点放置
        </p>
      )}
    </div>
  );
}
