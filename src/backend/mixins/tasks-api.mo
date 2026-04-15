import TaskLib "../lib/tasks";
import TaskTypes "../types/tasks";
import Common "../types/common";

mixin (state : TaskLib.State) {
  public func createTask(args : TaskTypes.CreateTaskArgs) : async TaskTypes.Task {
    TaskLib.createTask(state, args);
  };

  public query func getTasksByProject(projectId : Common.ProjectId) : async [TaskTypes.Task] {
    TaskLib.getTasksByProject(state, projectId);
  };

  public func updateTask(args : TaskTypes.UpdateTaskArgs) : async ?TaskTypes.Task {
    TaskLib.updateTask(state, args);
  };

  public func deleteTask(id : Common.TaskId) : async Bool {
    TaskLib.deleteTask(state, id);
  };
};
