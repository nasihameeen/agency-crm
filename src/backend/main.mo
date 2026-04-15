import ClientLib "lib/clients";
import ProjectLib "lib/projects";
import TaskLib "lib/tasks";
import NoteLib "lib/notes";
import LinkLib "lib/links";
import ClientsApi "mixins/clients-api";
import ProjectsApi "mixins/projects-api";
import TasksApi "mixins/tasks-api";
import NotesApi "mixins/notes-api";
import LinksApi "mixins/links-api";
import DashboardApi "mixins/dashboard-api";

actor {
  let clientState = ClientLib.newState();
  let projectState = ProjectLib.newState();
  let taskState = TaskLib.newState();
  let noteState = NoteLib.newState();
  let linkState = LinkLib.newState();

  include ClientsApi(clientState);
  include ProjectsApi(projectState);
  include TasksApi(taskState);
  include NotesApi(noteState);
  include LinksApi(linkState);
  include DashboardApi(clientState, projectState);
};
