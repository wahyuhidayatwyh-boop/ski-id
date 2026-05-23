export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Authentication is now handled by middleware.ts
    // This layout just renders children
    return <>{children}</>;
}
