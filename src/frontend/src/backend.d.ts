import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UpdateNoteArgs {
    id: NoteId;
    content: string;
}
export interface UpdateLinkArgs {
    id: LinkId;
    url: string;
    title: string;
}
export type Timestamp = bigint;
export type NoteId = bigint;
export interface CreateProjectArgs {
    status: ProjectStatus;
    clientId: ClientId;
    name: string;
    description: string;
    deadline: string;
    paidAmount: bigint;
    budget: bigint;
}
export type ClientId = bigint;
export interface Client {
    id: ClientId;
    name: string;
    createdAt: Timestamp;
    businessName: string;
    email: string;
    phone: string;
}
export interface Task {
    id: TaskId;
    name: string;
    createdAt: Timestamp;
    isDone: boolean;
    projectId: ProjectId;
}
export interface UpdateClientArgs {
    id: ClientId;
    name: string;
    businessName: string;
    email: string;
    phone: string;
}
export interface CreateClientArgs {
    name: string;
    businessName: string;
    email: string;
    phone: string;
}
export interface DashboardStats {
    activeProjects: bigint;
    totalClients: bigint;
    completedProjects: bigint;
    totalEarnings: bigint;
}
export interface CreateTaskArgs {
    name: string;
    projectId: ProjectId;
}
export interface UpdateTaskArgs {
    id: TaskId;
    name: string;
    isDone: boolean;
}
export type LinkId = bigint;
export type TaskId = bigint;
export type ProjectId = bigint;
export interface CreateLinkArgs {
    url: string;
    title: string;
    parentId: bigint;
    parentType: ParentType;
}
export interface CreateNoteArgs {
    content: string;
    parentId: bigint;
    parentType: ParentType;
}
export interface Project {
    id: ProjectId;
    status: ProjectStatus;
    clientId: ClientId;
    name: string;
    createdAt: Timestamp;
    description: string;
    deadline: string;
    paidAmount: bigint;
    budget: bigint;
}
export interface UpdateProjectArgs {
    id: ProjectId;
    status: ProjectStatus;
    clientId: ClientId;
    name: string;
    description: string;
    deadline: string;
    paidAmount: bigint;
    budget: bigint;
}
export interface Link {
    id: LinkId;
    url: string;
    title: string;
    createdAt: Timestamp;
    parentId: bigint;
    parentType: ParentType;
}
export interface Note {
    id: NoteId;
    content: string;
    createdAt: Timestamp;
    parentId: bigint;
    parentType: ParentType;
}
export enum ParentType {
    Client = "Client",
    Project = "Project"
}
export enum ProjectStatus {
    InProgress = "InProgress",
    Completed = "Completed",
    Pending = "Pending"
}
export interface backendInterface {
    createClient(args: CreateClientArgs): Promise<Client>;
    createLink(args: CreateLinkArgs): Promise<Link>;
    createNote(args: CreateNoteArgs): Promise<Note>;
    createProject(args: CreateProjectArgs): Promise<Project>;
    createTask(args: CreateTaskArgs): Promise<Task>;
    deleteClient(id: ClientId): Promise<boolean>;
    deleteLink(id: LinkId): Promise<boolean>;
    deleteNote(id: NoteId): Promise<boolean>;
    deleteProject(id: ProjectId): Promise<boolean>;
    deleteTask(id: TaskId): Promise<boolean>;
    getAllProjects(): Promise<Array<Project>>;
    getClient(id: ClientId): Promise<Client | null>;
    getClients(): Promise<Array<Client>>;
    getDashboardStats(): Promise<DashboardStats>;
    getLinksByParent(parentId: bigint, parentType: ParentType): Promise<Array<Link>>;
    getNotesByParent(parentId: bigint, parentType: ParentType): Promise<Array<Note>>;
    getProject(id: ProjectId): Promise<Project | null>;
    getProjectsByClient(clientId: ClientId): Promise<Array<Project>>;
    getTasksByProject(projectId: ProjectId): Promise<Array<Task>>;
    updateClient(args: UpdateClientArgs): Promise<Client | null>;
    updateLink(args: UpdateLinkArgs): Promise<Link | null>;
    updateNote(args: UpdateNoteArgs): Promise<Note | null>;
    updateProject(args: UpdateProjectArgs): Promise<Project | null>;
    updateTask(args: UpdateTaskArgs): Promise<Task | null>;
}
