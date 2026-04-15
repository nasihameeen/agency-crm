import ClientLib "../lib/clients";
import ClientTypes "../types/clients";
import Common "../types/common";

mixin (state : ClientLib.State) {
  public func createClient(args : ClientTypes.CreateClientArgs) : async ClientTypes.Client {
    ClientLib.createClient(state, args);
  };

  public query func getClients() : async [ClientTypes.Client] {
    ClientLib.getClients(state);
  };

  public query func getClient(id : Common.ClientId) : async ?ClientTypes.Client {
    ClientLib.getClient(state, id);
  };

  public func updateClient(args : ClientTypes.UpdateClientArgs) : async ?ClientTypes.Client {
    ClientLib.updateClient(state, args);
  };

  public func deleteClient(id : Common.ClientId) : async Bool {
    ClientLib.deleteClient(state, id);
  };
};
