import { useGameStore } from '@/game/store';
import type { BattleLogType } from '@/game/types';
import { ScrollText, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// 日志类型配置 - 单一职责：只定义日志样式配置
const logTypeConfig: Record<BattleLogType, { icon: string; color: string; bgColor: string; label: string }> = {
  build: { icon: '🏗️', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: '建造' },
  upgrade: { icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: '升级' },
  sell: { icon: '💰', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', label: '出售' },
  kill: { icon: '⚔️', color: 'text-red-400', bgColor: 'bg-red-500/10', label: '击杀' },
  damage: { icon: '💥', color: 'text-orange-400', bgColor: 'bg-orange-500/10', label: '伤害' },
  wave: { icon: '🌊', color: 'text-purple-400', bgColor: 'bg-purple-500/10', label: '波次' },
  card: { icon: '🃏', color: 'text-pink-400', bgColor: 'bg-pink-500/10', label: '卡牌' },
  heal: { icon: '💚', color: 'text-green-400', bgColor: 'bg-green-500/10', label: '治疗' },
  gold: { icon: '🪙', color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: '金币' },
  warning: { icon: '⚠️', color: 'text-red-500', bgColor: 'bg-red-500/10', label: '警告' },
  info: { icon: 'ℹ️', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', label: '信息' },
};

// 时间格式化工具 - 单一职责：只负责时间格式化
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 自动滚动开关组件 - 单一职责：只负责自动滚动控制
interface AutoScrollToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function AutoScrollToggle({ enabled, onToggle }: AutoScrollToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-1.5 rounded-lg transition-all duration-200 ${
        enabled
          ? 'bg-purple-500/20 text-purple-400'
          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
      }`}
      title={enabled ? '自动滚动已开启' : '自动滚动已关闭'}
    >
      <Settings className="w-4 h-4" />
    </button>
  );
}

// 日志头部组件 - 单一职责：只负责日志标题栏显示
interface LogHeaderProps {
  logCount: number;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
}

function LogHeader({ logCount, autoScroll, onToggleAutoScroll }: LogHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-purple-400" />
          战斗日志
        </h3>
        <AutoScrollToggle enabled={autoScroll} onToggle={onToggleAutoScroll} />
      </div>
      <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
        <span>共 {logCount} 条</span>
        <span className={autoScroll ? 'text-purple-400' : 'text-gray-500'}>
          {autoScroll ? '● 自动滚动' : '○ 手动滚动'}
        </span>
      </div>
    </>
  );
}

// 单条日志项组件 - 单一职责：只负责单条日志渲染
interface LogItemProps {
  message: string;
  timestamp: number;
  type: BattleLogType;
  isLatest: boolean;
  index: number;
}

function LogItem({ message, timestamp, type, isLatest, index }: LogItemProps) {
  const config = logTypeConfig[type];
  return (
    <div
      className={`p-1.5 rounded-lg text-xs transition-all duration-300 ${config.bgColor} ${
        isLatest ? 'animate-pulse' : ''
      }`}
      style={{
        animation: isLatest ? 'slideIn 0.3s ease-out' : 'none',
      }}
    >
      <div className="flex items-start gap-1.5">
        <span className="text-sm flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`${config.color} font-medium leading-tight`}>
            {message}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

// 空日志状态组件 - 单一职责：只负责空状态显示
function EmptyLogState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-4">
      <ScrollText className="w-8 h-8 mb-1 opacity-30" />
      <p className="text-xs">暂无战斗记录</p>
    </div>
  );
}

// 日志列表组件 - 单一职责：只负责日志列表渲染和滚动逻辑
interface LogListProps {
  logs: ReturnType<typeof useGameStore.getState>['battleLogs'];
  autoScroll: boolean;
}

function LogList({ logs, autoScroll }: LogListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-y-auto space-y-1 pr-1 min-h-0 ${
        autoScroll ? 'scroll-smooth' : ''
      }`}
    >
      {logs.length === 0 ? (
        <EmptyLogState />
      ) : (
        logs.map((log, index) => (
          <LogItem
            key={log.id}
            message={log.message}
            timestamp={log.timestamp}
            type={log.type}
            isLatest={index === 0}
            index={index}
          />
        ))
      )}
    </div>
  );
}

// 战斗日志主组件 - 单一职责：组合各子组件并管理状态
export default function BattleLog() {
  const { battleLogs } = useGameStore();
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <div className="bg-game-panel/90 backdrop-blur-sm rounded-xl p-3 border border-game-magic/30 shadow-lg flex-1 flex flex-col min-h-0">
      <LogHeader
        logCount={battleLogs.length}
        autoScroll={autoScroll}
        onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
      />
      <LogList logs={battleLogs} autoScroll={autoScroll} />

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
