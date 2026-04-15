import Common "common";

module {
  public type Link = {
    id : Common.LinkId;
    parentId : Nat;
    parentType : Common.ParentType;
    title : Text;
    url : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateLinkArgs = {
    parentId : Nat;
    parentType : Common.ParentType;
    title : Text;
    url : Text;
  };

  public type UpdateLinkArgs = {
    id : Common.LinkId;
    title : Text;
    url : Text;
  };
};
