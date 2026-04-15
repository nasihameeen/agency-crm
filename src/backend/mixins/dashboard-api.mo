import ClientLib "../lib/clients";
import ProjectLib "../lib/projects";
import DashboardTypes "../types/dashboard";

mixin (clientState : ClientLib.State, projectState : ProjectLib.State) {
  public query func getDashboardStats() : async DashboardTypes.DashboardStats {
    let totalClients = clientState.clients.size();
    let pendingCount = ProjectLib.countByStatus(projectState, #Pending);
    let inProgressCount = ProjectLib.countByStatus(projectState, #InProgress);
    let completedProjects = ProjectLib.countByStatus(projectState, #Completed);
    let activeProjects = pendingCount + inProgressCount;
    let totalEarnings = ProjectLib.sumPaidAmounts(projectState);
    {
      totalClients;
      activeProjects;
      completedProjects;
      totalEarnings;
    };
  };
};
