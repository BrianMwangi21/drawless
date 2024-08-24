import Chessboard from "@/components/Chessboard";

export default function Home() {
  return (
    <main className="flex flex-col h-screen w-screen items-center justify-between gap-4">
      <div className="flex flex-col gap-2 w-full justify-center place-items-center font-mono p-4 border-b-2 border-white-500">
        <p className="font-mono font-bold text-2xl text-center">drawless</p>
        <p className="font-mono font-bold text-lg text-center">play and insert random pieces when you get in a fix - enjoy!</p>
      </div>

      <div className="w-full h-full flex flex-col gap-4 justify-center place-items-center">
        <Chessboard />
      </div>
    </main>
  );
}
