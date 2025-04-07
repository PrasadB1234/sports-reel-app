import Image from "next/image";
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/reels');
  // return (
  //   <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
  //     <h1>Welcome to ReelLegends 🏆🔥</h1>
  //   </main>
  // );
}
