import Image from "next/image";
import bannerLogo from "@/images/banner_logo.png";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col justify-center items-center gap-4 p-4 bg-black">
      <div className="w-64 h-16 relative">
        <Image src={bannerLogo} alt="Waterloo Rocketry Logo" fill />
      </div>
      <h1 className="text-3xl text-center font-bold text-white">
        Controls Game
      </h1>
    </main>
  );
}
