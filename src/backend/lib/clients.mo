import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import ClientTypes "../types/clients";

module {
  public type State = {
    clients : List.List<ClientTypes.Client>;
    var nextClientId : Common.ClientId;
  };

  public func newState() : State {
    {
      clients = List.empty<ClientTypes.Client>();
      var nextClientId = 1;
    };
  };

  public func createClient(state : State, args : ClientTypes.CreateClientArgs) : ClientTypes.Client {
    let id = state.nextClientId;
    state.nextClientId += 1;
    let client : ClientTypes.Client = {
      id;
      name = args.name;
      phone = args.phone;
      email = args.email;
      businessName = args.businessName;
      createdAt = Time.now().toNat();
    };
    state.clients.add(client);
    client;
  };

  public func getClients(state : State) : [ClientTypes.Client] {
    state.clients.toArray();
  };

  public func getClient(state : State, id : Common.ClientId) : ?ClientTypes.Client {
    state.clients.find(func(c) { c.id == id });
  };

  public func updateClient(state : State, args : ClientTypes.UpdateClientArgs) : ?ClientTypes.Client {
    var updated : ?ClientTypes.Client = null;
    state.clients.mapInPlace(func(c) {
      if (c.id == args.id) {
        let u : ClientTypes.Client = {
          c with
          name = args.name;
          phone = args.phone;
          email = args.email;
          businessName = args.businessName;
        };
        updated := ?u;
        u;
      } else { c };
    });
    updated;
  };

  public func deleteClient(state : State, id : Common.ClientId) : Bool {
    let sizeBefore = state.clients.size();
    let filtered = state.clients.filter(func(c) { c.id != id });
    state.clients.clear();
    state.clients.append(filtered);
    state.clients.size() < sizeBefore;
  };
};
