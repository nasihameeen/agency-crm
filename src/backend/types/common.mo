module {
  public type Timestamp = Nat;
  public type ClientId = Nat;
  public type ProjectId = Nat;
  public type TaskId = Nat;
  public type NoteId = Nat;
  public type LinkId = Nat;

  public type ParentType = {
    #Client;
    #Project;
  };
};
