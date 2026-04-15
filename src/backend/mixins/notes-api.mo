import NoteLib "../lib/notes";
import NoteTypes "../types/notes";
import Common "../types/common";

mixin (state : NoteLib.State) {
  public func createNote(args : NoteTypes.CreateNoteArgs) : async NoteTypes.Note {
    NoteLib.createNote(state, args);
  };

  public query func getNotesByParent(parentId : Nat, parentType : Common.ParentType) : async [NoteTypes.Note] {
    NoteLib.getNotesByParent(state, parentId, parentType);
  };

  public func updateNote(args : NoteTypes.UpdateNoteArgs) : async ?NoteTypes.Note {
    NoteLib.updateNote(state, args);
  };

  public func deleteNote(id : Common.NoteId) : async Bool {
    NoteLib.deleteNote(state, id);
  };
};
