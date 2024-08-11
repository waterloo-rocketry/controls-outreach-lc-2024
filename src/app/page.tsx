import { Metadata } from "next";
import { Game } from "./game";

export const metadata: Metadata = {
  title: "Controls Outreach Game",
  description: "A video game to see what it's like to control a rocket!",
  manifest: "manifest.json",
};

export default function Home() {
  return <Game />;
}
