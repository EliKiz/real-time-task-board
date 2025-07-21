"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/shared/ui/loading";
import { CreateTaskForm } from "@/features/CreateTask";
import { TaskList } from "@/widgets/TaskList";
import { TeamChat } from "@/widgets/TeamChat";
import { useTheme } from "@/shared/ui/ThemeProvider";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark } = useTheme();

  if (status === "loading") {
    return <PageLoading message="Loading your dashboard..." />;
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Task Board
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Real-time collaboration
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-primary-foreground font-semibold text-sm">
                    {(session.user?.name || session.user?.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-foreground font-medium text-sm">
                    {session.user?.name || session.user?.email}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      session.user.role === "ADMIN" 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                        : "bg-gradient-to-r from-blue-500 to-green-500"
                    }`}></div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {session.user.role === "ADMIN" ? "Administrator" : "Employee"}
                    </span>
                  </div>
                </div>
              </div>

              <ThemeToggle />

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group relative inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground font-medium text-sm rounded-xl shadow-lg shadow-destructive/25 hover:shadow-destructive/40 hover:scale-105 transition-all duration-200 border border-destructive/20"
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-[700px]">
              <TeamChat />
            </div>

            <div className="h-[700px]">
              <CreateTaskForm />
            </div>

            <div className="h-[700px]">
              <TaskList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
