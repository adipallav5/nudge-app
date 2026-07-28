import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toZonedTime, format } from "date-fns-tz";
import { startOfDay, differenceInDays } from "date-fns";
import { Resend } from "resend";
import { emailTemplates } from "@/lib/email-templates";

// Initialize Resend
// Even if RESEND_API_KEY is not set, we configure it so we don't crash,
// and we'll log if we can't send.
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

// Default fallback to localhost if APP_URL is not set
const appUrl = process.env.APP_URL || "http://localhost:3000";

export async function GET(req: Request) {
  try {
    // Basic security for cron (optional, usually passing a Bearer token or checking IP)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { onboarded: true }
    });

    const now = new Date();
    const sentEmails = [];

    for (const user of users) {
      if (!user.reminderTime || !user.timezone || !user.habitName) continue;

      const userTimezone = user.timezone;
      const zonedNow = toZonedTime(now, userTimezone);
      const todayInUserTz = startOfDay(zonedNow);

      // Check if it's past their reminder time TODAY in their local timezone
      const currentHour = zonedNow.getHours();
      const currentMinute = zonedNow.getMinutes();

      const [reminderHourStr, reminderMinuteStr] = user.reminderTime.split(":");
      const reminderHour = parseInt(reminderHourStr, 10);
      const reminderMinute = parseInt(reminderMinuteStr, 10);

      // If we haven't reached their reminder time today, skip
      if (currentHour < reminderHour || (currentHour === reminderHour && currentMinute < reminderMinute)) {
        continue;
      }

      // If we already nudged them today, skip
      if (user.lastNudgeDate) {
        const zonedLastNudge = toZonedTime(user.lastNudgeDate, userTimezone);
        if (startOfDay(zonedLastNudge).getTime() === todayInUserTz.getTime()) {
          continue;
        }
      }

      // Calculate days missed
      let daysPassed = 0;
      if (user.lastCheckInDate) {
        const zonedLastCheckIn = toZonedTime(user.lastCheckInDate, userTimezone);
        daysPassed = differenceInDays(todayInUserTz, startOfDay(zonedLastCheckIn));
      } else {
        const zonedCreatedAt = toZonedTime(user.createdAt, userTimezone);
        daysPassed = differenceInDays(todayInUserTz, startOfDay(zonedCreatedAt));
      }

      const daysMissed = Math.max(0, daysPassed - 1);

      let template = null;
      let newStage = user.nudgeStage;

      // Logic: Missed 1 day -> soft, 2 days -> direct, 4+ days -> reset
      if (daysMissed === 1 && user.nudgeStage < 1) {
        template = emailTemplates.soft(user.habitName, user.id, appUrl, 1);
        newStage = 1;
      } else if (daysMissed === 2 && user.nudgeStage < 2) {
        template = emailTemplates.direct(user.habitName, user.id, appUrl, 2);
        newStage = 2;
      } else if (daysMissed >= 4 && user.nudgeStage < 3) {
        template = emailTemplates.reset(user.habitName, user.id, appUrl, 3);
        newStage = 3;
      }

      if (template) {
        // Attempt to send email
        try {
          if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
              from: "Nudge <onboarding@resend.dev>",
              to: [user.email],
              subject: template.subject,
              html: template.html,
              text: template.text,
            });
          } else {
            console.log(`[Simulated Email to ${user.email}]: ${template.subject}`);
            console.log(template.html);
          }

          // Update user
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastNudgeDate: now,
              nudgeStage: newStage
            }
          });

          sentEmails.push({ email: user.email, stage: newStage });
        } catch (emailErr) {
          console.error(`Failed to send email to ${user.email}:`, emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, processed: users.length, sentEmails });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
