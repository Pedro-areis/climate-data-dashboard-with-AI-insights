interface ComponentConfigProps {
  children: React.ReactNode;
  title: string;
  H1className?: string;
}

function ComponentConfig({
  children,
  title = "Configurações de usuário",
  H1className = "",
}: ComponentConfigProps) {
  return (
    <form className="flex flex-col gap-2 w-2/5 h-5/6 justify-center p-8 bg-neutral-500 rounded-2xl">
      <h1 className={`text-3xl font-bold text-white ${H1className}`}>
        {title}
      </h1>
      {children}
    </form>
  );
}

export default ComponentConfig;
