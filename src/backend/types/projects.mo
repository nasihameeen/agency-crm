import Common "common";

module {
  public type ProjectStatus = {
    #Pending;
    #InProgress;
    #Completed;
  };

  public type Project = {
    id : Common.ProjectId;
    clientId : Common.ClientId;
    name : Text;
    description : Text;
    budget : Nat;
    paidAmount : Nat;
    deadline : Text;
    status : ProjectStatus;
    createdAt : Common.Timestamp;
  };

  public type CreateProjectArgs = {
    clientId : Common.ClientId;
    name : Text;
    description : Text;
    budget : Nat;
    paidAmount : Nat;
    deadline : Text;
    status : ProjectStatus;
  };

  public type UpdateProjectArgs = {
    id : Common.ProjectId;
    clientId : Common.ClientId;
    name : Text;
    description : Text;
    budget : Nat;
    paidAmount : Nat;
    deadline : Text;
    status : ProjectStatus;
  };
};
