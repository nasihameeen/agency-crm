import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import TaskTypes "../types/tasks";

module {
  public type State = {
    tasks : List.List<TaskTypes.Task>;
    var nextTaskId : Common.TaskId;
  };

  public func newState() : State {
    {
      tasks = List.empty<TaskTypes.Task>();
      var nextTaskId = 1;
    };
  };

  public func createTask(state : State, args : TaskTypes.CreateTaskArgs) : TaskTypes.Task {
    let id = state.nextTaskId;
    state.nextTaskId += 1;
    let task : TaskTypes.Task = {
      id;
      projectId = args.projectId;
      name = args.name;
      isDone = false;
      createdAt = Time.now().toNat();
    };
    state.tasks.add(task);
    task;
  };

  public func getTasksByProject(state : State, projectId : Common.ProjectId) : [TaskTypes.Task] {
    state.tasks.filter(func(t) { t.projectId == projectId }).toArray();
  };

  public func getTask(state : State, id : Common.TaskId) : ?TaskTypes.Task {
    state.tasks.find(func(t) { t.id == id });
  };

  public func updateTask(state : State, args : TaskTypes.UpdateTaskArgs) : ?TaskTypes.Task {
    var updated : ?TaskTypes.Task = null;
    state.tasks.mapInPlace(func(t) {
      if (t.id == args.id) {
        let u : TaskTypes.Task = {
          t with
          name = args.name;
          isDone = args.isDone;
        };
        updated := ?u;
        u;
      } else { t };
    });
    updated;
  };

  public func deleteTask(state : State, id : Common.TaskId) : Bool {
    let sizeBefore = state.tasks.size();
    let filtered = state.tasks.filter(func(t) { t.id != id });
    state.tasks.clear();
    state.tasks.append(filtered);
    state.tasks.size() < sizeBefore;
  };
};
