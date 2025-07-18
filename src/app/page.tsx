"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  console.log("✅ AUTHENTICATED - RENDERING HOME PAGE", session);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-gray-700">
                  Welcome, {session.user?.name || session.user?.email}!
                </div>
                <div className="text-sm text-gray-500">
                  Роль:{" "}
                  {session.user.role === "ADMIN"
                    ? "Administrator"
                    : "Employee"}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to Task Board!
              </h2>
              <p className="text-gray-600">
                Here will be the main interface of the task board
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
