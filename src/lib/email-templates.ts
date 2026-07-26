export const emailTemplates = {
  soft: (habitName: string) => ({
    subject: `Did you forget your ${habitName} yesterday?`,
    text: `Hi there, we noticed you missed your ${habitName} check-in yesterday. Life happens! Just a gentle nudge to get back on track today. You've got this.`,
    html: `<p>Hi there,</p><p>We noticed you missed your <strong>${habitName}</strong> check-in yesterday. Life happens! Just a gentle nudge to get back on track today.</p><p>You've got this.</p>`
  }),
  direct: (habitName: string) => ({
    subject: `Two days missed: Time to protect your ${habitName} habit`,
    text: `Hi again. You've missed two days of ${habitName}. It's important to jump back in now before the habit fades. Take 5 minutes today to do it.`,
    html: `<p>Hi again.</p><p>You've missed two days of <strong>${habitName}</strong>. It's important to jump back in now before the habit fades.</p><p>Take 5 minutes today to do it.</p>`
  }),
  reset: (habitName: string) => ({
    subject: `Fresh start: Let's reset your ${habitName} goal`,
    text: `Hello. It looks like you've been away from ${habitName} for a few days. No guilt, no stress. Let's do a clean reset. Whenever you're ready, just check in to start your streak at 1 again. We'll be here.`,
    html: `<p>Hello.</p><p>It looks like you've been away from <strong>${habitName}</strong> for a few days.</p><p>No guilt, no stress. Let's do a clean reset. Whenever you're ready, just check in to start your streak at 1 again.</p><p>We'll be here.</p>`
  })
};
