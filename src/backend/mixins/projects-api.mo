import ProjectLib "../lib/projects";
import ProjectTypes "../types/projects";
import Common "../types/common";

mixin (state : ProjectLib.State) {
  public func createProject(args : ProjectTypes.CreateProjectArgs) : async ProjectTypes.Project {
    ProjectLib.createProject(state, args);
  };

  public query func getAllProjects() : async [ProjectTypes.Project] {
    ProjectLib.getAllProjects(state);
  };

  public query func getProjectsByClient(clientId : Common.ClientId) : async [ProjectTypes.Project] {
    ProjectLib.getProjectsByClient(state, clientId);
  };

  public query func getProject(id : Common.ProjectId) : async ?ProjectTypes.Project {
    ProjectLib.getProject(state, id);
  };

  public func updateProject(args : ProjectTypes.UpdateProjectArgs) : async ?ProjectTypes.Project {
    ProjectLib.updateProject(state, args);
  };

  public func deleteProject(id : Common.ProjectId) : async Bool {
    ProjectLib.deleteProject(state, id);
  };
};
