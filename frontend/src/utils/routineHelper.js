/**
 * Routine helper functions for MomCare EASY tracking
 */

export const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '';
  const totalMins = Math.round(minutes);
  if (totalMins <= 0) return '0p';
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  if (hrs > 0 && mins > 0) {
    return `${hrs}h${mins < 10 ? '0' : ''}${mins}`;
  } else if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${mins}p`;
};

export const formatTimeStr = (isoOrDate) => {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  const hrs = d.getHours();
  const mins = d.getMinutes();
  return `${hrs}h${mins < 10 ? '0' : ''}${mins}`;
};

export const getTimeDiffMinutes = (startIso, endIso) => {
  if (!startIso || !endIso) return 0;
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  const diff = Math.round((e - s) / (1000 * 60));
  return diff > 0 ? diff : 0;
};

/**
 * Builds structured Nap cycles and Night events from chronological activities
 */
export const buildDailyRoutine = (activities = []) => {
  // Sort ascending by start_time
  const sorted = [...activities].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  let napCount = 0;
  const naps = [];
  const nightEvents = [];
  let currentCycle = null;

  let totalWakeMinutes = 0;
  let totalNapMinutes = 0;
  let totalMilkMl = 0;
  let totalSolidMl = 0;
  let totalDiaperCount = 0;

  sorted.forEach((act) => {
    // Accumulate milk (bottle feeds) and solid food (cháo)
    if (act.activity_type === 'FEED') {
      const ml = Number(act.details?.amount_ml || 0);
      totalMilkMl += ml;
    } else if (act.activity_type === 'SOLID_FOOD') {
      const ml = Number(act.details?.amount_ml || 0);
      totalSolidMl += ml;
    } else if (act.activity_type === 'DIAPER') {
      totalDiaperCount += 1;
    }

    // Night events: strictly NIGHT activity type or NOTE marked as night (e.g. night soothe, dream feed notes)
    // Core WAKE and SLEEP events are NEVER pushed to nightEvents so that WT and ST can always be computed.
    const isNightActivity =
      act.activity_type === 'NIGHT' ||
      (act.activity_type === 'NOTE' &&
        (act.details?.is_night ||
          act.notes?.includes('hỗ trợ ngủ') ||
          act.notes?.includes('bú mẹ')));

    if (isNightActivity) {
      nightEvents.push(act);
      return;
    }

    // WAKE event
    if (act.activity_type === 'WAKE') {
      // If previous cycle has a sleep event, this wake marks the end of that sleep!
      if (currentCycle && currentCycle.sleepEvent) {
        const napDuration = getTimeDiffMinutes(
          currentCycle.sleepEvent.start_time,
          act.start_time
        );
        currentCycle.napDurationMinutes = napDuration;

        // Only count as daytime nap ST if sleep was NOT marked as bedtime
        if (!currentCycle.sleepEvent.details?.is_bedtime) {
          totalNapMinutes += napDuration;
        }

        // Start new nap cycle
        napCount += 1;
        currentCycle = {
          napIndex: napCount,
          title: `Nap ${napCount}`,
          wakeEvent: act,
          sleepEvent: null,
          wakeWindowMinutes: null,
          napDurationMinutes: null,
          items: [act],
        };
        naps.push(currentCycle);
        return;
      }

      // If currentCycle already exists but does NOT have a sleep event yet:
      // (e.g. user logged wake, and then logged another wake or adjusted time before sleeping)
      if (currentCycle && !currentCycle.sleepEvent) {
        currentCycle.items.push(act);
        return;
      }

      // First activity of the day is a WAKE
      napCount += 1;
      currentCycle = {
        napIndex: napCount,
        title: `Nap ${napCount}`,
        wakeEvent: act,
        sleepEvent: null,
        wakeWindowMinutes: null,
        napDurationMinutes: null,
        items: [act],
      };
      naps.push(currentCycle);
      return;
    }

    // SLEEP event
    if (act.activity_type === 'SLEEP') {
      if (!currentCycle) {
        // Morning wake wasn't logged, create an initial cycle starting with sleep
        napCount += 1;
        currentCycle = {
          napIndex: napCount,
          title: `Nap ${napCount}`,
          wakeEvent: null,
          sleepEvent: act,
          wakeWindowMinutes: null,
          napDurationMinutes: null,
          items: [act],
        };
        naps.push(currentCycle);
        return;
      }

      if (currentCycle.sleepEvent) {
        // Cycle already has a sleep event (e.g. multiple sleeps logged without wake in between)
        currentCycle.items.push(act);
        currentCycle.sleepEvent = act;
        return;
      }

      // Baby falls asleep
      currentCycle.sleepEvent = act;
      currentCycle.items.push(act);

      if (currentCycle.wakeEvent) {
        const ww = getTimeDiffMinutes(
          currentCycle.wakeEvent.start_time,
          act.start_time
        );
        currentCycle.wakeWindowMinutes = ww;
        totalWakeMinutes += ww;
      }
      return;
    }

    // Other events (FEED, DIAPER, NOTE) during the day
    if (!currentCycle) {
      napCount += 1;
      currentCycle = {
        napIndex: napCount,
        title: `Nap ${napCount}`,
        wakeEvent: null,
        sleepEvent: null,
        wakeWindowMinutes: null,
        napDurationMinutes: null,
        items: [act],
      };
      naps.push(currentCycle);
    } else {
      currentCycle.items.push(act);
    }
  });

  return {
    naps,
    nightEvents,
    totals: {
      wtMinutes: totalWakeMinutes,
      stMinutes: totalNapMinutes,
      milkMl: totalMilkMl,
      solidMl: totalSolidMl,
      diapers: totalDiaperCount,
      wtFormatted: formatDuration(totalWakeMinutes),
      stFormatted: formatDuration(totalNapMinutes),
    },
  };
};
