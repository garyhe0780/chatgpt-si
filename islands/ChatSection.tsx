import { SSE } from '$sse'
import { useRef, useMemo } from 'preact/hooks'
import { nanoid } from 'nanoid'
import type { CreateCompletionResponse } from '$openai'
import { signal } from '@preact/signals'

const dialogues = signal<{ question: string; answer: string }[]>([])

const map2Array = (data: Map<string, { question: string; answer: string }>) =>
  Array.from(data, (e) => e.at(1) as { question: string; answer: string })
const map = new Map<string, { question: string; answer: string }>()

export default function ChatSection() {
  const inputRef$ = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const context = inputRef$.current?.value

    inputRef$.current!.value = ''
    const uuid = nanoid(7)

    map.set(uuid, {
      question: context ?? '',
      answer: '',
    })

    dialogues.value = map2Array(map)

    console.log(dialogues.value)

    const eventSource = new SSE('/api/explain', {
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({ context }),
    })

    eventSource.addEventListener('error', (e: unknown) => {
      alert('Something went wrong!')
    })

    eventSource.addEventListener('message', (e: any) => {
      try {
        if (e.data === '[DONE]') {
          return
        }

        const completionResponse: CreateCompletionResponse = JSON.parse(e.data)

        const [{ text }] = completionResponse.choices
        map.set(uuid, {
          ...(map.get(uuid) as any),
          answer: map.get(uuid)?.answer + text,
        })

    		dialogues.value = map2Array(map)
      } catch (err) {
        console.error(err)
        alert('Something went wrong!')
      }
    })

    eventSource.stream()
  }

  return (
    <div class="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
      <div class="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {dialogues.value.map((e: any) => (
          <Dialogue question={e.question} answer={e.answer} />
        ))}
      </div>
      <div class="flex items-center justify-between border border-gray-200 p-1.5 rounded-sm shadow shadow-gray-300 bg-gray-100">
        <input
          ref={inputRef$}
          class="flex-1 px-2 py-1.5 outline-none focus:outline-none bg-gray-100 focus:bg-gray-50"
          name="context"
        />
        <button
          class="bg-black text-white px-2 py-1.5 rounded-md"
          onClick={() => handleSubmit()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export function Dialogue({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <div class="flex flex-col items-center text-sm">
      <div class="w-full border-b group bg-gray-100">
        <div class="text-base gap-4 md:gap-6 m-auto flex p-4">
          <div class="w-[30px] flex flex-col relative items-end">
            <div class="relative flex">You:</div>
          </div>
          <div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
            <div class="flex flex-grow flex-col gap-3">
              <div class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap">
                {question}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full border-b group bg-gray-50 ">
        <div class="text-base gap-4 md:gap-6 m-auto p-4 flex">
          <svg
            data-name="OpenAI Logo"
            width="24px"
            height="24px"
            viewBox="140 140 520 520"
          >
            <defs>
              <linearGradient id="linear" x1="100%" y1="22%" x2="0%" y2="78%">
                <stop offset="0%" stop-color="rgb(131,211,231)" />
                <stop offset="2%" stop-color="rgb(127,203,229)" />
                <stop offset="25%" stop-color="rgb(86,115,217)" />
                <stop offset="49%" stop-color="rgb(105,80,190)" />
                <stop offset="98%" stop-color="rgb(197,59,119)" />
                <stop offset="100%" stop-color="rgb(197,59,119)" />
              </linearGradient>
            </defs>
            <path
              id="logo"
              d="m617.24 354a126.36 126.36 0 0 0 -10.86-103.79 127.8 127.8 0 0 0 -137.65-61.32 126.36 126.36 0 0 0 -95.31-42.49 127.81 127.81 0 0 0 -121.92 88.49 126.4 126.4 0 0 0 -84.5 61.3 127.82 127.82 0 0 0 15.72 149.86 126.36 126.36 0 0 0 10.86 103.79 127.81 127.81 0 0 0 137.65 61.32 126.36 126.36 0 0 0 95.31 42.49 127.81 127.81 0 0 0 121.96-88.54 126.4 126.4 0 0 0 84.5-61.3 127.82 127.82 0 0 0 -15.76-149.81zm-190.66 266.49a94.79 94.79 0 0 1 -60.85-22c.77-.42 2.12-1.16 3-1.7l101-58.34a16.42 16.42 0 0 0 8.3-14.37v-142.39l42.69 24.65a1.52 1.52 0 0 1 .83 1.17v117.92a95.18 95.18 0 0 1 -94.97 95.06zm-204.24-87.23a94.74 94.74 0 0 1 -11.34-63.7c.75.45 2.06 1.25 3 1.79l101 58.34a16.44 16.44 0 0 0 16.59 0l123.31-71.2v49.3a1.53 1.53 0 0 1 -.61 1.31l-102.1 58.95a95.16 95.16 0 0 1 -129.85-34.79zm-26.57-220.49a94.71 94.71 0 0 1 49.48-41.68c0 .87-.05 2.41-.05 3.48v116.68a16.41 16.41 0 0 0 8.29 14.36l123.31 71.19-42.69 24.65a1.53 1.53 0 0 1 -1.44.13l-102.11-59a95.16 95.16 0 0 1 -34.79-129.81zm350.74 81.62-123.31-71.2 42.69-24.64a1.53 1.53 0 0 1 1.44-.13l102.11 58.95a95.08 95.08 0 0 1 -14.69 171.55c0-.88 0-2.42 0-3.49v-116.68a16.4 16.4 0 0 0 -8.24-14.36zm42.49-63.95c-.75-.46-2.06-1.25-3-1.79l-101-58.34a16.46 16.46 0 0 0 -16.59 0l-123.31 71.2v-49.3a1.53 1.53 0 0 1 .61-1.31l102.1-58.9a95.07 95.07 0 0 1 141.19 98.44zm-267.11 87.87-42.7-24.65a1.52 1.52 0 0 1 -.83-1.17v-117.92a95.07 95.07 0 0 1 155.9-73c-.77.42-2.11 1.16-3 1.7l-101 58.34a16.41 16.41 0 0 0 -8.3 14.36zm23.19-50 54.92-31.72 54.92 31.7v63.42l-54.92 31.7-54.92-31.7z"
              fill="#202123"
            />
          </svg>
          <div class="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
            <div class="flex flex-grow flex-col gap-3">
              <div class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
