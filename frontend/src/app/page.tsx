import Sidebar from "@/components/sidebar/Sidebar";

export default function Home() {
  return (
      <div className="flex min-h-screen">
          <Sidebar/>
          <main className="flex-1 p-4"></main>
      </div>
  );
}
