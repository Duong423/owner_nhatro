// App routes configuration
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoginPage } from '@/pages/Login';
import { HomePage } from '@/pages/Home';
import { DashboardPage } from '@/pages/Dashboard';
import { RoomsPage } from '@/pages/Rooms';
import { TenantsPage } from '@/pages/Tenants';
import { ContractsPage } from '@/pages/Contracts';
import { PaymentsPage } from '@/pages/Payments';
import { VehiclesPage } from '@/pages/Vehicles';
import { BillsPage } from '@/pages/Bills/BillsPage';

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public route */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected routes - only for OWNER role */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rooms"
                        element={
                            <ProtectedRoute>
                                <RoomsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tenants"
                        element={
                            <ProtectedRoute>
                                <TenantsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/contracts"
                        element={
                            <ProtectedRoute>
                                <ContractsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payments"
                        element={
                            <ProtectedRoute>
                                <PaymentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vehicles"
                        element={
                            <ProtectedRoute>
                                <VehiclesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/bills"
                        element={
                            <ProtectedRoute>
                                <BillsPage />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Catch all - redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};
