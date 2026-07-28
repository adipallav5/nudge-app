"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getCheckinMessage } from "@/lib/checkin-messages";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        if (!data.onboarded) {
          router.push("/onboarding");
        } else {
          setUserData(data);
          // If already checked in today upon load, we don't have the context of how they checked in,
          // so we just show a generic 'already checked in' message or re-calculate it if we want.
          // For simplicity, we just won't show the dynamic context message if they reload the page.
          // A fresh check-in will set it.
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);

        if (data.checkinContext) {
           const msg = getCheckinMessage(
             data.checkinContext.isFirstCheckin,
             data.checkinContext.isPostLapse,
             data.checkinContext.isNewRecord,
             data.checkinContext.currentStreak
           );
           setCheckinMessage(msg);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Failed to load user data</div>;
  }

  // Determine if already checked in today (simplified frontend check)
  const isCheckedInToday = userData.lastCheckInDate &&
    new Date(userData.lastCheckInDate).toLocaleDateString() === new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl space-y-8 pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
            <p className="mt-2 text-4xl font-bold text-blue-600">{userData.currentStreak} 🔥</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Longest Streak</h3>
            <p className="mt-2 text-4xl font-bold text-gray-900">{userData.longestStreak} 🏆</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Did you {userData.habitName || "Workout"} today?</h2>

          {isCheckedInToday ? (
            <div className="rounded-md bg-green-50 p-4 text-green-700 font-medium">
              {checkinMessage ? checkinMessage : "Awesome job! You've already checked in today. See you tomorrow."}
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full rounded-md bg-black px-6 py-4 text-lg font-bold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {checkingIn ? "Checking in..." : "Yes, I did!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
