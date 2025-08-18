import CustomSidebar from "@/components/sidebar/CustomSidebar";

export default function Home() {
  return (
      <div className="flex min-h-screen">
          <CustomSidebar/>
          <main className="flex-1 p-4"></main>
      </div>
  );
}
