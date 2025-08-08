import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type SidebarItemProps = {
    text: string;
    icon: ReactNode;
    activeIcon: ReactNode;
    href: string;
}

export default function SidebarItem({ text, icon, activeIcon, href }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-md p-2 transition-colors duration-300 ease-in-out
                hover:bg-gray-700 hover:opacity-100
                focus:outline-none focus:ring-2 focus:ring-teal-500
                ${isActive ? "bg-teal-100 border-l-4 border-teal-600 shadow-md" : "bg-transparent"}`}
        >
          <span className={`${isActive ? "text-teal-950" : "text-slate-400"}`}>
            {isActive ? activeIcon : icon}
          </span>
                    <span
                        className={`text-lg font-semibold ${
                            isActive ? "text-teal-950 italic" : "text-slate-400"
                        }`}
                    >
            {text}
          </span>
        </Link>
    );
}
