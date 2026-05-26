"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { DiscoveryProfileView } from "@/components/DiscoveryProfileView";
import styles from "./DiscoveryChat.module.css";
import btnStyles from "@/styles/buttons.module.css";
import type {
  ChatMessage,
  UserDiscoveryProfile,
} from "@/lib/discovery-profile";
import { saveDiscoveryProfile } from "@/lib/discovery-storage";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Welcome. I will ask a few questions about your spiritual interests, the kind of community you imagine, practical needs, and how seriously you are exploring — then I will shape a profile to guide your search. \n\n What draws you to monasteries or retreats right now?",
};

type DiscoveryContextValue = {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  error: string | null;
  profile: UserDiscoveryProfile | null;
  setProfile: (profile: UserDiscoveryProfile | null) => void;
  sendMessage: () => Promise<void>;
  startOver: () => void;
};

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

function useDiscovery() {
  const value = useContext(DiscoveryContext);
  if (!value) {
    throw new Error(
      "Discovery components must be used within DiscoveryProvider",
    );
  }
  return value;
}

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserDiscoveryProfile | null>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || profile) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/discovery/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setMessages([INITIAL_MESSAGE]);
    setProfile(null);
    setError(null);
    setInput("");
  }

  return (
    <DiscoveryContext.Provider
      value={{
        messages,
        input,
        setInput,
        loading,
        error,
        profile,
        setProfile,
        sendMessage,
        startOver,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
}

export function DiscoveryChatSection() {
  const { messages, input, setInput, loading, error, profile, sendMessage } =
    useDiscovery();
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && !profile) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [loading, profile]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <section className={styles.discovery} aria-label="Discovery chat">
      <div className={styles.discoveryHeader}>
        <p className={styles.discoveryLabel}>What are you looking for?</p>
        <p className={styles.discoveryHint}>
          A short conversation to find the right place for you.
        </p>
      </div>

      <div className={styles.chatPanel}>
        <div
          ref={messagesRef}
          className={styles.messages}
          role="log"
          aria-live="polite"
        >
          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={
                msg.role === "user"
                  ? styles.messageUser
                  : styles.messageAssistant
              }
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className={styles.messageAssistant}>
              <span className={styles.typing}>Thinking…</span>
            </div>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!profile && (
          <div className={styles.composer}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={loading}
              aria-label="Your message"
            />
            <button
              type="button"
              className={btnStyles.btn}
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function DiscoveryProfileSection() {
  const { profile, startOver } = useDiscovery();
  const router = useRouter();
  const profileRef = useRef<HTMLElement>(null);

  function viewResults() {
    if (!profile) return;
    saveDiscoveryProfile(profile);
    router.push("/discovery/results");
  }

  useEffect(() => {
    if (!profile) return;
    profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [profile]);

  if (!profile) return null;

  return (
    <section
      ref={profileRef}
      className={styles.profileBelowFold}
      aria-label="Your discovery profile"
    >
      <div className={styles.profilePanel}>
        <DiscoveryProfileView profile={profile} />
        <div className={styles.profileActions}>
          <button type="button" className={btnStyles.btn} onClick={viewResults}>
            View my results
          </button>
          <button
            type="button"
            className={btnStyles.btnGhost}
            onClick={startOver}
          >
            Start over
          </button>
        </div>
      </div>
    </section>
  );
}

/** @deprecated Use DiscoveryProvider with DiscoveryChatSection and DiscoveryProfileSection */
export default function DiscoveryChat() {
  return (
    <>
      <DiscoveryChatSection />
      <DiscoveryProfileSection />
    </>
  );
}
