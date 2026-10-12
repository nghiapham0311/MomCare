import React from 'react';
import { formatTimeStr, formatDuration } from '../utils/routineHelper';
import { Sun, Moon, Milk, UtensilsCrossed, Baby as DiaperIcon, Sparkles, Edit2 } from 'lucide-react';

export default function RoutineListView({
  routineData,
  onItemClick,
  darkMode = true,
  latestAvailableDate = null,
  onJumpToDate = null,
}) {
  const { naps, nightEvents, totals } = routineData;

  const bgClass = darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-gray-800 border border-gray-100';
  const headerClass = darkMode ? 'text-zinc-400 border-zinc-800' : 'text-gray-500 border-gray-200';
  const subtextClass = darkMode ? 'text-zinc-400' : 'text-gray-500';
  const cardBorderClass = darkMode ? 'border-zinc-800/80 hover:bg-zinc-900/50' : 'border-gray-100 hover:bg-gray-50';

  if (!naps.length && !nightEvents.length) {
    return (
      <div className={`rounded-2xl p-6 text-center text-xs ${subtextClass} border ${cardBorderClass} my-3 space-y-2.5`}>
        <p>Chưa có nhật ký nào cho ngày này. Hãy bấm nút dấu (+) ở dưới màn hình để ghi nhận nhé!</p>
        {latestAvailableDate && onJumpToDate && (
          <button
            onClick={() => onJumpToDate(latestAvailableDate)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/15 hover:bg-pink-500/25 text-pink-500 font-bold transition text-xs shadow-xs"
          >
            👉 Xem ngày gần nhất có dữ liệu (
            {new Date(latestAvailableDate + 'T00:00:00').toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
            })}
            )
          </button>
        )}
      </div>
    );
  }

  const renderActivityText = (act) => {
    const time = formatTimeStr(act.start_time);

    if (act.activity_type === 'WAKE') {
      return (
        <span className="flex items-center gap-1.5 font-medium">
          <span className="font-semibold">{time}</span>
          <span>dậy</span>
          {act.notes && <span className={`${subtextClass} text-[11px]`}>({act.notes})</span>}
        </span>
      );
    }

    if (act.activity_type === 'SLEEP') {
      const isBed = act.details?.is_bedtime;
      return (
        <span className="flex items-center gap-1.5 font-medium">
          <span className="font-semibold">{time}</span>
          <span>{isBed ? 'ngủ (vào giấc đêm)' : 'ngủ'}</span>
          {act.notes && <span className={`${subtextClass} text-[11px]`}>({act.notes})</span>}
        </span>
      );
    }

    if (act.activity_type === 'FEED') {
      const isBottle = act.details?.feed_type !== 'breast';
      const ml = act.details?.amount_ml;
      return (
        <span className="flex items-center gap-1.5 font-medium">
          <span className="font-semibold">{time}</span>
          <span>
            {isBottle ? `bú bình ${ml ? `${ml}ml` : ''}` : 'bú mẹ'}
          </span>
          {act.notes && <span className={`${subtextClass} text-[11px]`}>{act.notes}</span>}
        </span>
      );
    }

    if (act.activity_type === 'SOLID_FOOD') {
      return (
        <span className="flex items-center gap-1.5 font-medium">
          <span className="font-semibold">{time}</span>
          <span>ăn cháo {act.details?.amount_ml ? `${act.details.amount_ml}ml` : ''}</span>
          {act.notes && <span className={`${subtextClass} text-[11px]`}>{act.notes}</span>}
        </span>
      );
    }

    if (act.activity_type === 'DIAPER') {
      let statusText = 'thay tã';
      if (act.details?.status === 'poop_liquid') statusText = 'ỉa lỏng';
      else if (act.details?.status === 'poop_little') statusText = 'ỉa 1 ít';
      else if (act.details?.status === 'poop_normal') statusText = 'ỉa';
      else if (act.details?.status === 'wet') statusText = 'tè';

      return (
        <span className="flex items-center gap-1.5 font-medium">
          <span className="font-semibold">{time}</span>
          <span>{statusText}</span>
          {act.notes && <span className={`${subtextClass} text-[11px]`}>({act.notes})</span>}
        </span>
      );
    }

    // Note / Night / Health
    return (
      <span className="flex items-center gap-1.5 font-medium">
        <span className="font-semibold">{time}</span>
        <span>{act.notes || 'ghi chú'}</span>
      </span>
    );
  };

  return (
    <div className={`rounded-2xl p-4 transition-colors font-mono text-xs shadow-sm border ${bgClass}`}>
      {/* List of Nap Cycles */}
      <div className="space-y-4">
        {naps.map((cycle, idx) => (
          <div key={idx} className="group">
            {/* Nap Title (no duplicate duration numbers after Nap X; only WT/ST on the right) */}
            <div className={`flex items-center justify-between pb-1 mb-1 border-b border-dashed ${darkMode ? 'border-gray-700/40' : 'border-gray-200'}`}>
              <span className={`font-bold text-sm tracking-wide ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                {cycle.title}
              </span>
              <div className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold`}>
                {cycle.wakeWindowMinutes !== null && cycle.wakeWindowMinutes !== undefined
                  ? `WT: ${formatDuration(cycle.wakeWindowMinutes)}`
                  : ''}
                {cycle.napDurationMinutes !== null && cycle.napDurationMinutes !== undefined
                  ? `${cycle.wakeWindowMinutes !== null && cycle.wakeWindowMinutes !== undefined ? ' • ' : ''}ST: ${formatDuration(cycle.napDurationMinutes)}`
                  : ''}
              </div>
            </div>

            {/* Nap Activity Items */}
            <div className="space-y-1 pl-1">
              {cycle.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className={`flex items-center justify-between py-0.5 px-1.5 rounded-lg cursor-pointer transition ${cardBorderClass}`}
                >
                  <div className="flex items-center gap-2">
                    {item.activity_type === 'WAKE' && <Sun size={13} className="text-amber-400 flex-shrink-0" />}
                    {item.activity_type === 'SLEEP' && <Moon size={13} className="text-indigo-400 flex-shrink-0" />}
                    {item.activity_type === 'FEED' && <Milk size={13} className="text-orange-400 flex-shrink-0" />}
                    {item.activity_type === 'SOLID_FOOD' && <UtensilsCrossed size={13} className="text-lime-500 flex-shrink-0" />}
                    {item.activity_type === 'DIAPER' && <DiaperIcon size={13} className="text-sky-400 flex-shrink-0" />}
                    {item.activity_type !== 'WAKE' &&
                      item.activity_type !== 'SLEEP' &&
                      item.activity_type !== 'FEED' &&
                      item.activity_type !== 'SOLID_FOOD' &&
                      item.activity_type !== 'DIAPER' && <Sparkles size={13} className="text-purple-400 flex-shrink-0" />}

                    {renderActivityText(item)}
                  </div>
                  <Edit2 size={11} className="opacity-0 group-hover:opacity-40 text-gray-400 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Routine Daily Summary Line: e.g. "Wt 8h20 st 4h 550ml" */}
      <div className={`mt-5 pt-3 border-t border-dashed ${darkMode ? 'border-gray-700/60' : 'border-gray-200'} flex items-center justify-between text-xs font-bold`}>
        <span className={darkMode ? 'text-zinc-300' : 'text-gray-800'}>
          Thức: {totals.wtFormatted || '0p'} &nbsp;- Ngủ: {totals.stFormatted || '0p'} &nbsp; {totals.milkMl}ml
          {totals.solidMl > 0 && ` • Cháo: ${totals.solidMl}ml`}
        </span>
        {totals.diapers > 0 && (
          <span className={`${darkMode ? 'text-sky-400' : 'text-sky-600'} font-medium text-[11px]`}>
            {totals.diapers} lần tã
          </span>
        )}
      </div>

      {/* Night Events (Ban đêm) */}
      {nightEvents.length > 0 && (
        <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className={`text-xs font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-1.5 flex items-center gap-1.5`}>
            <Moon size={13} />
            <span>Ban đêm:</span>
          </div>

          <div className="space-y-1 pl-1">
            {nightEvents.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className={`flex items-center justify-between py-0.5 px-1.5 rounded-lg cursor-pointer transition ${cardBorderClass}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  {renderActivityText(item)}
                </div>
                <Edit2 size={11} className="opacity-0 group-hover:opacity-40 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
