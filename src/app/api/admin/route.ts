import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toZonedTime, format } from "date-fns-tz";
import { startOfDay, differenceInDays } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });

    const now = new Date();

    let activeUsersCount = 0;
    const lapsedUsers: any[] = [];

    users.forEach(user => {
      if (!user.onboarded) return;

      const userTimezone = user.timezone || "UTC";
      const zonedNow = toZonedTime(now, userTimezone);
      const todayInUserTz = startOfDay(zonedNow);

      let daysMissed = 0;

      if (user.lastCheckInDate) {
        const zonedLastCheckIn = toZonedTime(user.lastCheckInDate, userTimezone);
        const lastCheckInDay = startOfDay(zonedLastCheckIn);
        daysMissed = differenceInDays(todayInUserTz, lastCheckInDay);
      } else {
        // If no check-in, calculate days since creation
        const zonedCreatedAt = toZonedTime(user.createdAt, userTimezone);
        const createdAtDay = startOfDay(zonedCreatedAt);
        daysMissed = differenceInDays(todayInUserTz, createdAtDay);
      }

      // If daysMissed is 0 (checked in today) or 1 (checked in yesterday, hasn't lapsed today yet)
      // We consider 0 or 1 as "active" in terms of missing days, but strict missed days is > 1
      if (daysMissed <= 1) {
        activeUsersCount++;
      } else {
        lapsedUsers.push({
          id: user.id,
          email: user.email,
          habitName: user.habitName,
          daysMissed,
          nudgeStage: user.nudgeStage,
          lastCheckIn: user.lastCheckInDate,
        });
      }
    });

    return NextResponse.json({
      totalUsers: users.length,
      onboardedUsers: users.filter(u => u.onboarded).length,
      activeUsers: activeUsersCount,
      lapsedUsersCount: lapsedUsers.length,
      lapsedUsers,
    });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
