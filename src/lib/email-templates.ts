export const emailTemplates = {
  soft: (habitName: string, userId: string, appUrl: string, nudgeStage: number) => {
    const feedbackLinks = getFeedbackLinks(userId, appUrl, nudgeStage);
    return {
      subject: `Did you forget your ${habitName} yesterday?`,
      text: `Hi there, we noticed you missed your ${habitName} check-in yesterday. Life happens! Just a gentle nudge to get back on track today. You've got this.\n\nWhat got in the way?\nBusy: ${feedbackLinks.busy}\nTired: ${feedbackLinks.tired}\nUnmotivated: ${feedbackLinks.unmotivated}\nOther: ${feedbackLinks.other}`,
      html: `<p>Hi there,</p><p>We noticed you missed your <strong>${habitName}</strong> check-in yesterday. Life happens! Just a gentle nudge to get back on track today.</p><p>You've got this.</p><hr/><p><strong>What got in the way?</strong></p><p><a href="${feedbackLinks.busy}">Busy</a> | <a href="${feedbackLinks.tired}">Tired</a> | <a href="${feedbackLinks.unmotivated}">Unmotivated</a> | <a href="${feedbackLinks.other}">Other</a></p>`
    };
  },
  direct: (habitName: string, userId: string, appUrl: string, nudgeStage: number) => {
    const feedbackLinks = getFeedbackLinks(userId, appUrl, nudgeStage);
    return {
      subject: `Two days missed: Time to protect your ${habitName} habit`,
      text: `Hi again. You've missed two days of ${habitName}. It's important to jump back in now before the habit fades. Take 5 minutes today to do it.\n\nWhat got in the way?\nBusy: ${feedbackLinks.busy}\nTired: ${feedbackLinks.tired}\nUnmotivated: ${feedbackLinks.unmotivated}\nOther: ${feedbackLinks.other}`,
      html: `<p>Hi again.</p><p>You've missed two days of <strong>${habitName}</strong>. It's important to jump back in now before the habit fades.</p><p>Take 5 minutes today to do it.</p><hr/><p><strong>What got in the way?</strong></p><p><a href="${feedbackLinks.busy}">Busy</a> | <a href="${feedbackLinks.tired}">Tired</a> | <a href="${feedbackLinks.unmotivated}">Unmotivated</a> | <a href="${feedbackLinks.other}">Other</a></p>`
    };
  },
  reset: (habitName: string, userId: string, appUrl: string, nudgeStage: number) => {
    const feedbackLinks = getFeedbackLinks(userId, appUrl, nudgeStage);
    return {
      subject: `Fresh start: Let's reset your ${habitName} goal`,
      text: `Hello. It looks like you've been away from ${habitName} for a few days. No guilt, no stress. Let's do a clean reset. Whenever you're ready, just check in to start your streak at 1 again. We'll be here.\n\nWhat got in the way?\nBusy: ${feedbackLinks.busy}\nTired: ${feedbackLinks.tired}\nUnmotivated: ${feedbackLinks.unmotivated}\nOther: ${feedbackLinks.other}`,
      html: `<p>Hello.</p><p>It looks like you've been away from <strong>${habitName}</strong> for a few days.</p><p>No guilt, no stress. Let's do a clean reset. Whenever you're ready, just check in to start your streak at 1 again.</p><p>We'll be here.</p><hr/><p><strong>What got in the way?</strong></p><p><a href="${feedbackLinks.busy}">Busy</a> | <a href="${feedbackLinks.tired}">Tired</a> | <a href="${feedbackLinks.unmotivated}">Unmotivated</a> | <a href="${feedbackLinks.other}">Other</a></p>`
    };
  }
};

function getFeedbackLinks(userId: string, appUrl: string, nudgeStage: number) {
  const baseUrl = `${appUrl}/api/lapse-reason?token=${userId}&stage=${nudgeStage}&reason=`;
  return {
    busy: `${baseUrl}Busy`,
    tired: `${baseUrl}Tired`,
    unmotivated: `${baseUrl}Unmotivated`,
    other: `${baseUrl}Other`
  };
}
