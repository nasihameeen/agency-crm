import Common "common";

module {
  public type Client = {
    id : Common.ClientId;
    name : Text;
    phone : Text;
    email : Text;
    businessName : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateClientArgs = {
    name : Text;
    phone : Text;
    email : Text;
    businessName : Text;
  };

  public type UpdateClientArgs = {
    id : Common.ClientId;
    name : Text;
    phone : Text;
    email : Text;
    businessName : Text;
  };
};
