import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toZonedTime } from "date-fns-tz";
import { startOfDay, differenceInDays } from "date-fns";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const userTimezone = user.timezone || "UTC";

    // Get current date in user's timezone
    const zonedNow = toZonedTime(now, userTimezone);
    const todayInUserTz = startOfDay(zonedNow);

    let newStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;
    let isFirstCheckin = false;
    let isPostLapse = false;

    if (user.lastCheckInDate) {
      const zonedLastCheckIn = toZonedTime(user.lastCheckInDate, userTimezone);
      const lastCheckInDay = startOfDay(zonedLastCheckIn);

      const daysSinceLastCheckIn = differenceInDays(todayInUserTz, lastCheckInDay);

      if (daysSinceLastCheckIn === 0) {
        // Already checked in today
        return NextResponse.json({ success: true, message: "Already checked in today", user });
      } else if (daysSinceLastCheckIn === 1) {
        // Checked in yesterday, increment streak
        newStreak += 1;
      } else {
        // Lapsed, reset streak
        newStreak = 1;
        isPostLapse = true;
      }
    } else {
      // First check-in
      newStreak = 1;
      isFirstCheckin = true;
    }

    let isNewRecord = false;
    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
      // We only consider it a 'new record milestone' message if it's > 1
      if (newStreak > 1) {
        isNewRecord = true;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastCheckInDate: now,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        nudgeStage: 0, // Reset nudge stage on check-in
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      checkinContext: {
        isFirstCheckin,
        isPostLapse,
        isNewRecord,
        currentStreak: newStreak
      }
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
