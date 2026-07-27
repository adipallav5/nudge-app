export const getCheckinMessage = (
  isFirstCheckin: boolean,
  isPostLapse: boolean,
  isNewRecord: boolean,
  currentStreak: number
) => {
  if (isFirstCheckin) {
    return "Awesome job! You've taken the first step. See you tomorrow.";
  }

  if (isPostLapse) {
    return "Welcome back! Missed days happen to everyone. What matters is that you're here today.";
  }

  if (isNewRecord) {
    return `Incredible! You just hit a new record of ${currentStreak} days! Keep it going!`;
  }

  return `Day ${currentStreak} — keep it going!`;
};
