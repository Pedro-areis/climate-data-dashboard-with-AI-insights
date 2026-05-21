import { type ReactNode } from "react";

interface InitialPageProps {
  title: string;
  children: ReactNode;
}

function InitialPage({ title, children }: InitialPageProps) {
  return (
    <main className="flex flex-col items-center justify-center h-screen w-screen bg-neutral-600">
      <div
        className="flex flex-col gap-4 bg-gray-500 justify-center 
            items-center p-8 rounded-2xl shadow-md w-150 h-150 border border-gray-300"
      >
        <h1 className="w-full p-2 text-white text-center text-3xl">{title}</h1>
        {children}
      </div>
    </main>
  );
}

export default InitialPage;
