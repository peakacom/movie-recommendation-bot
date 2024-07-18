"use client";
import "@nlux/themes/nova.css";
import {
  AiChat,
  AiChatUI,
  ChatAdapter,
  StreamingAdapterObserver,
} from "@nlux/react";

export default function Chat() {
  const chatAdapter: ChatAdapter = {
    streamText: async (prompt: string, observer: StreamingAdapterObserver) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt: prompt }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.status !== 200) {
        observer.error(new Error("Failed to connect to the server"));
        return;
      }

      if (!response.body) {
        return;
      }

      // Read a stream of server-sent events
      // and feed them to the observer as they are being generated
      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        const content = textDecoder.decode(value);
        if (content) {
          observer.next(content);
        }
      }

      observer.complete();
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm lg:flex">
        <AiChat
          adapter={chatAdapter}
          displayOptions={{
            colorScheme: "dark",
            height: 1200,
          }}
          personaOptions={{
            assistant: {
              name: "Peaka Bot",
              avatar:
                "https://docs.nlkit.com/nlux/images/personas/harry-botter.png",
              tagline: "Making Magic With Peaka",
            },
          }}
          conversationOptions={{
            layout: "bubbles",
            conversationStarters: [
              {
                icon: "https://cdn-icons-png.flaticon.com/512/3171/3171927.png",
                label: "Sample Prompt 1",
                prompt:
                  "I want to watch a popular short movie with my children tonight.",
              },
              {
                icon: "https://cdn-icons-png.flaticon.com/512/3574/3574820.png",
                label: "Sample Prompt 2",
                prompt:
                  "Look at what I rented before and try to recommend me a romantic movie to watch with my partner tonight.",
              },
              {
                icon: "https://cdn-icons-png.flaticon.com/512/16286/16286224.png",
                label: "Sample Prompt 3",
                prompt:
                  "My friends are coming tonight, I want to watch an action movie with them. What can you recommend to me?",
              },
            ],
          }}
        >
          <AiChatUI.Greeting>
            <span className="rounded">
              <div className="flex flex-col justify-center items-center gap-5">
                <div>Hello! 👋</div>
                <div className="text-pretty w-2/3 text-center">
                  This is a movie recommendation bot demo to demonstrate RAG
                  pipeline with Peaka. All movies are fake movies taken from dvd
                  rental store sample database.
                </div>

                <div className="text-pretty w-2/3 text-center">
                  Try by clicking sample prompts or get to the full code from{" "}
                  <a
                    href="https://github.com/peakacom/movie-recommendation-bot"
                    target="_blank"
                    className="underline"
                  >
                    Github
                  </a>
                </div>
              </div>
            </span>
          </AiChatUI.Greeting>
        </AiChat>
      </div>
    </main>
  );
}
