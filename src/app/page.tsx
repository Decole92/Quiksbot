"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className=' p-5 bg-white rounded-md '>
      <p>this is the landing page</p>
    </main>
  );
}
