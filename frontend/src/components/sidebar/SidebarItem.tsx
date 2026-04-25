'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
    text: string;
    icon: React.ReactNode;
    href: string;
    onClick?: () => void;
};

export default function SidebarItem({ text, icon, href, onClick }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + "/");

    const classes = cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors duration-100 w-full text-left",
        isActive
            ? "bg-accent text-primary font-semibold"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    );

    if (onClick) {
        return (
            <button className={classes} onClick={onClick}>
                <span className="flex-shrink-0">{icon}</span>
                {text}
            </button>
        );
    }

    return (
        <Link href={href} className={classes}>
            <span className="flex-shrink-0">{icon}</span>
            {text}
        </Link>
    );
}
