import { Head } from '$fresh/runtime.ts'
import ChatSection from "../islands/ChatSection.tsx";

interface Data {}

export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="h-screen overflow-hidden flex items-center justify-center bg-gray-100 max-w-[1200px] mx-auto">
        <ChatSection />
      </div>
    </>
  )
}

