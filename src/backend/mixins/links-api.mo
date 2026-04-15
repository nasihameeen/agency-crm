import LinkLib "../lib/links";
import LinkTypes "../types/links";
import Common "../types/common";

mixin (state : LinkLib.State) {
  public func createLink(args : LinkTypes.CreateLinkArgs) : async LinkTypes.Link {
    LinkLib.createLink(state, args);
  };

  public query func getLinksByParent(parentId : Nat, parentType : Common.ParentType) : async [LinkTypes.Link] {
    LinkLib.getLinksByParent(state, parentId, parentType);
  };

  public func updateLink(args : LinkTypes.UpdateLinkArgs) : async ?LinkTypes.Link {
    LinkLib.updateLink(state, args);
  };

  public func deleteLink(id : Common.LinkId) : async Bool {
    LinkLib.deleteLink(state, id);
  };
};
