import Common "common";

module {
  public type Task = {
    id : Common.TaskId;
    projectId : Common.ProjectId;
    name : Text;
    isDone : Bool;
    createdAt : Common.Timestamp;
  };

  public type CreateTaskArgs = {
    projectId : Common.ProjectId;
    name : Text;
  };

  public type UpdateTaskArgs = {
    id : Common.TaskId;
    name : Text;
    isDone : Bool;
  };
};
