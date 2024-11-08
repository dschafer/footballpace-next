// This is a no-op, but adding layout.tsx here hopefully lets
// us target layout for revalidatePath()
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
