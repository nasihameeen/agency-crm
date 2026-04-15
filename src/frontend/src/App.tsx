import { Layout } from "@/components/Layout";
import { ClientDetail } from "@/pages/ClientDetail";
import { ClientsPage } from "@/pages/ClientsPage";
import { Dashboard } from "@/pages/Dashboard";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { ProjectsPage } from "@/pages/ProjectsPage";
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

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  clientsRoute,
  clientDetailRoute,
  projectsRoute,
  projectDetailRoute,
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
