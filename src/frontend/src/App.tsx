import { Layout } from "@/components/Layout";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ClientDetail } from "@/pages/ClientDetail";
import { ClientsPage } from "@/pages/ClientsPage";
import { Dashboard } from "@/pages/Dashboard";
import { FinancePage } from "@/pages/FinancePage";
import LeadsPage from "@/pages/LeadsPage";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { TasksPage } from "@/pages/TasksPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import { Outlet } from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});
const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clients",
  component: ClientsPage,
});
const clientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clients/$id",
  component: ClientDetail,
});
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: ProjectsPage,
});
const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$id",
  component: ProjectDetail,
});
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsPage,
});
const financeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finance",
  component: FinancePage,
});
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: TasksPage,
});
const leadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leads",
  component: LeadsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  clientsRoute,
  clientDetailRoute,
  projectsRoute,
  projectDetailRoute,
  analyticsRoute,
  financeRoute,
  tasksRoute,
  leadsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
