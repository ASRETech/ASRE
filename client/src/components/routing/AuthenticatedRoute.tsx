import { Route, Redirect } from "wouter";
import { trpc } from "@/lib/trpc";

type Props = {
  path: string;
  children: React.ReactNode;
};

export function AuthenticatedRoute({ path, children }: Props) {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  return (
    <Route path={path}>
      {() => {
        if (meQuery.isLoading) {
          return (
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          );
        }

        if (meQuery.isError || !meQuery.data) {
          return <Redirect to="/login" />;
        }

        return <>{children}</>;
      }}
    </Route>
  );
}
