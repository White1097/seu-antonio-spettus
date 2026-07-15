import { Navigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({
    children,
    cargosPermitidos = []
}) {
    const location = useLocation();

    const {
        autenticado,
        cargo,
        loading
    } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#f8f4eb',
                    color: '#351c32'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '800'
                    }}
                >
                    <LoaderCircle
                        size={24}
                        style={{
                            animation: 'girar 0.8s linear infinite'
                        }}
                    />

                    Carregando sistema...
                </div>
            </div>
        );
    }

    if (!autenticado) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname
                }}
            />
        );
    }

    const possuiRestricaoDeCargo =
        Array.isArray(cargosPermitidos) &&
        cargosPermitidos.length > 0;

    const cargoPermitido =
        !possuiRestricaoDeCargo ||
        cargosPermitidos.includes(cargo);

    if (!cargoPermitido) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;