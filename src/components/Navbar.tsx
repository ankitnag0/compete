import React from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav
      className="flex p-4 items-center justify-between border
    "
    >
      <Link href="/" className="text-xl font-black">
        XO 🎮
      </Link>
      <p>Game On!</p>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Button asChild>
          <SignInButton />
        </Button>
      </SignedOut>
    </nav>
  );
}
