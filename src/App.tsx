import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  LikedPage,
  DisLikedPage,
  TinderPage,
  AboutUsPage,
  Auth,
} from './pages';
import { NavBar, ProtectedRoute } from './components';
import { AuthProvider } from './contexts/AuthContext';

const PROTECTED_ROUTES = [
  { path: '/liked', component: LikedPage },
  { path: '/dislike', component: DisLikedPage },
  { path: '/explore', component: TinderPage },
  { path: '/about', component: AboutUsPage },
] as const;

const ProtectedRouteWrapper: React.FC<{ component: React.ComponentType }> = ({
  component: Component,
}) => (
  <ProtectedRoute>
    <Component />
  </ProtectedRoute>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="h-screen-safe flex flex-col bg-background">
          <NavBar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/liked" replace />} />

              {PROTECTED_ROUTES.map(({ path, component }) => (
                <Route
                  key={path}
                  path={path}
                  element={<ProtectedRouteWrapper component={component} />}
                />
              ))}

              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/liked" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
