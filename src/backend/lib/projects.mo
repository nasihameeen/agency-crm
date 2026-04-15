import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import ProjectTypes "../types/projects";

module {
  public type State = {
    projects : List.List<ProjectTypes.Project>;
    var nextProjectId : Common.ProjectId;
  };

  public func newState() : State {
    {
      projects = List.empty<ProjectTypes.Project>();
      var nextProjectId = 1;
    };
  };

  public func createProject(state : State, args : ProjectTypes.CreateProjectArgs) : ProjectTypes.Project {
    let id = state.nextProjectId;
    state.nextProjectId += 1;
    let project : ProjectTypes.Project = {
      id;
      clientId = args.clientId;
      name = args.name;
      description = args.description;
      budget = args.budget;
      paidAmount = args.paidAmount;
      deadline = args.deadline;
      status = args.status;
      createdAt = Time.now().toNat();
    };
    state.projects.add(project);
    project;
  };

  public func getAllProjects(state : State) : [ProjectTypes.Project] {
    state.projects.toArray();
  };

  public func getProjectsByClient(state : State, clientId : Common.ClientId) : [ProjectTypes.Project] {
    state.projects.filter(func(p) { p.clientId == clientId }).toArray();
  };

  public func getProject(state : State, id : Common.ProjectId) : ?ProjectTypes.Project {
    state.projects.find(func(p) { p.id == id });
  };

  public func updateProject(state : State, args : ProjectTypes.UpdateProjectArgs) : ?ProjectTypes.Project {
    var updated : ?ProjectTypes.Project = null;
    state.projects.mapInPlace(func(p) {
      if (p.id == args.id) {
        let u : ProjectTypes.Project = {
          p with
          clientId = args.clientId;
          name = args.name;
          description = args.description;
          budget = args.budget;
          paidAmount = args.paidAmount;
          deadline = args.deadline;
          status = args.status;
        };
        updated := ?u;
        u;
      } else { p };
    });
    updated;
  };

  public func deleteProject(state : State, id : Common.ProjectId) : Bool {
    let sizeBefore = state.projects.size();
    let filtered = state.projects.filter(func(p) { p.id != id });
    state.projects.clear();
    state.projects.append(filtered);
    state.projects.size() < sizeBefore;
  };

  public func sumPaidAmounts(state : State) : Nat {
    state.projects.foldLeft<Nat, ProjectTypes.Project>(0, func(acc, p) { acc + p.paidAmount });
  };

  public func countByStatus(state : State, status : ProjectTypes.ProjectStatus) : Nat {
    state.projects.foldLeft<Nat, ProjectTypes.Project>(0, func(acc, p) {
      if (p.status == status) { acc + 1 } else { acc };
    });
  };
};
