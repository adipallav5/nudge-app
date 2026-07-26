"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminDashboardPage() {
  const { status } = useSession();
  const router = useRouter();

  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchAdminData();
    }
  }, [status, router]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) {
        throw new Error("Failed to fetch admin data");
      }
      const data = await res.json();
      setAdminData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading admin data...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-8 pt-10">
        <h1 className="text-3xl font-bold">Founder Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-bold">{adminData.totalUsers}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Onboarded</h3>
            <p className="mt-2 text-3xl font-bold">{adminData.onboardedUsers}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Active (0-1 days missed)</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{adminData.activeUsers}</p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Lapsed (2+ days missed)</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{adminData.lapsedUsersCount}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Lapsed Users Detail</h2>

          {adminData.lapsedUsers.length === 0 ? (
            <p className="text-gray-500">No lapsed users currently.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Habit</th>
                    <th className="px-4 py-3">Days Missed</th>
                    <th className="px-4 py-3">Nudge Stage</th>
                    <th className="px-4 py-3">Last Check-In</th>
                  </tr>
                </thead>
                <tbody>
                  {adminData.lapsedUsers.map((user: any) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.habitName}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{user.daysMissed}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.nudgeStage === 0 ? "bg-gray-100 text-gray-800" :
                          user.nudgeStage === 1 ? "bg-yellow-100 text-yellow-800" :
                          user.nudgeStage === 2 ? "bg-orange-100 text-orange-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          Stage {user.nudgeStage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {user.lastCheckIn ? new Date(user.lastCheckIn).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
