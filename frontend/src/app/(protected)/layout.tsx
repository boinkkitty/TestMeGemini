import "@/app/globals.css";
import Sidebar from "@/components/sidebar/Sidebar";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
        </div>
    );
}
