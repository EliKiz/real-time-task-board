"use client";;
import { useEffect, useState } from 'react';
import { ComponentLoading } from '@/shared/ui/loading';

interface UserStatsData {
  totalTasks: number;
  completedTasks: number;
  inProgress: number;
  pendingTasks: number;
  teamMembers: number | null;
}

async function fetchUserStats(userRole: string): Promise<UserStatsData> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const isAdmin = userRole === 'ADMIN';
  
  return {
    totalTasks: isAdmin ? 24 : 8,
    completedTasks: isAdmin ? 18 : 6,
    inProgress: isAdmin ? 4 : 2,
    pendingTasks: isAdmin ? 2 : 0,
    teamMembers: isAdmin ? 5 : null,
  };
}

interface StatsCardProps {
  title: string;
  value: number | string;
  color: string;
}

const StatsCard = ({ title, value, color }: StatsCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${color} mr-3`}></div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
};

interface StatsContentProps {
  userRole: string;
}

const StatsContent = ({ userRole }: StatsContentProps) => {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserStats(userRole).then((data) => {
      setStats(data);
      setIsLoading(false);
    });
  }, [userRole]);

  if (isLoading || !stats) {
    return <ComponentLoading message="Loading statistics..." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          color="bg-blue-500"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          color="bg-green-500"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingTasks}
          color="bg-red-500"
        />
      </div>
      
      {stats.teamMembers && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Team Size:</span> {stats.teamMembers} members
          </p>
        </div>
      )}
    </div>
  );
};

interface UserStatsProps {
  userRole: string;
}

export const UserStats = ({ userRole }: UserStatsProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Statistics</h2>
      <StatsContent userRole={userRole} />
    </div>
  );
}; 