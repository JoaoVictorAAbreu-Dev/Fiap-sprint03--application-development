import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '@/presentation/layouts/dashboard.layout';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    hydrateFallbackElement: (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-700" role="status">
        Carregando dashboard...
      </main>
    ),
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import('@/presentation/pages/dashboard.page');
          return { Component: module.DashboardPage };
        },
      },
      {
        path: 'alerts',
        lazy: async () => {
          const module = await import('@/presentation/pages/alerts.page');
          return { Component: module.AlertsPage };
        },
      },
      {
        path: 'map',
        lazy: async () => {
          const module = await import('@/presentation/pages/map.page');
          return { Component: module.MapPage };
        },
      },
      {
        path: 'sensing',
        lazy: async () => {
          const module = await import('@/presentation/pages/sensing.page');
          return { Component: module.SensingPage };
        },
      },
    ],
  },
]);
