import { PropsWithChildren } from "react";

interface Props {}

const HomePage = async ({}: PropsWithChildren<Props>) => {
  return (
    <main className="flex h-screen">
      <div className="m-auto">
        <p>Elige una conversación en el menú lateral</p>
      </div>
    </main>
  );
};

export default HomePage;
