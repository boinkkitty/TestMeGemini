import "@/app/globals.css";
import CustomSidebar from "@/components/sidebar/CustomSidebar";

export default function ProtectedLayout({
                                            children,
                                        }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen">
            <CustomSidebar/>
            <main className="flex-1 p-4">{children}</main>
        </div>
    );
}
