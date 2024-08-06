import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <h1>Hello world</h1>
      <Link href="/account">Account</Link>
    </main>
  );
}
