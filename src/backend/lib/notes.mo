import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import NoteTypes "../types/notes";

module {
  public type State = {
    notes : List.List<NoteTypes.Note>;
    var nextNoteId : Common.NoteId;
  };

  public func newState() : State {
    {
      notes = List.empty<NoteTypes.Note>();
      var nextNoteId = 1;
    };
  };

  public func createNote(state : State, args : NoteTypes.CreateNoteArgs) : NoteTypes.Note {
    let id = state.nextNoteId;
    state.nextNoteId += 1;
    let note : NoteTypes.Note = {
      id;
      parentId = args.parentId;
      parentType = args.parentType;
      content = args.content;
      createdAt = Time.now().toNat();
    };
    state.notes.add(note);
    note;
  };

  public func getNotesByParent(state : State, parentId : Nat, parentType : Common.ParentType) : [NoteTypes.Note] {
    state.notes.filter(func(n) { n.parentId == parentId and n.parentType == parentType }).toArray();
  };

  public func getNote(state : State, id : Common.NoteId) : ?NoteTypes.Note {
    state.notes.find(func(n) { n.id == id });
  };

  public func updateNote(state : State, args : NoteTypes.UpdateNoteArgs) : ?NoteTypes.Note {
    var updated : ?NoteTypes.Note = null;
    state.notes.mapInPlace(func(n) {
      if (n.id == args.id) {
        let u : NoteTypes.Note = { n with content = args.content };
        updated := ?u;
        u;
      } else { n };
    });
    updated;
  };

  public func deleteNote(state : State, id : Common.NoteId) : Bool {
    let sizeBefore = state.notes.size();
    let filtered = state.notes.filter(func(n) { n.id != id });
    state.notes.clear();
    state.notes.append(filtered);
    state.notes.size() < sizeBefore;
  };
};
