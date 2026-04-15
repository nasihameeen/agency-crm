import Common "common";

module {
  public type Note = {
    id : Common.NoteId;
    parentId : Nat;
    parentType : Common.ParentType;
    content : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateNoteArgs = {
    parentId : Nat;
    parentType : Common.ParentType;
    content : Text;
  };

  public type UpdateNoteArgs = {
    id : Common.NoteId;
    content : Text;
  };
};
