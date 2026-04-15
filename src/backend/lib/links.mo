import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import LinkTypes "../types/links";

module {
  public type State = {
    links : List.List<LinkTypes.Link>;
    var nextLinkId : Common.LinkId;
  };

  public func newState() : State {
    {
      links = List.empty<LinkTypes.Link>();
      var nextLinkId = 1;
    };
  };

  public func createLink(state : State, args : LinkTypes.CreateLinkArgs) : LinkTypes.Link {
    let id = state.nextLinkId;
    state.nextLinkId += 1;
    let link : LinkTypes.Link = {
      id;
      parentId = args.parentId;
      parentType = args.parentType;
      title = args.title;
      url = args.url;
      createdAt = Time.now().toNat();
    };
    state.links.add(link);
    link;
  };

  public func getLinksByParent(state : State, parentId : Nat, parentType : Common.ParentType) : [LinkTypes.Link] {
    state.links.filter(func(l) { l.parentId == parentId and l.parentType == parentType }).toArray();
  };

  public func getLink(state : State, id : Common.LinkId) : ?LinkTypes.Link {
    state.links.find(func(l) { l.id == id });
  };

  public func updateLink(state : State, args : LinkTypes.UpdateLinkArgs) : ?LinkTypes.Link {
    var updated : ?LinkTypes.Link = null;
    state.links.mapInPlace(func(l) {
      if (l.id == args.id) {
        let u : LinkTypes.Link = { l with title = args.title; url = args.url };
        updated := ?u;
        u;
      } else { l };
    });
    updated;
  };

  public func deleteLink(state : State, id : Common.LinkId) : Bool {
    let sizeBefore = state.links.size();
    let filtered = state.links.filter(func(l) { l.id != id });
    state.links.clear();
    state.links.append(filtered);
    state.links.size() < sizeBefore;
  };
};
