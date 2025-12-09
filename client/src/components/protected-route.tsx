import { useAuth } from "@/context/auth-context";
import { Redirect } from "wouter";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return children;
}
