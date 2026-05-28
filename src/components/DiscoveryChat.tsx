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
import { DiscoveryPreferences } from "@/components/DiscoveryPreferences";
import { DiscoveryProfileView } from "@/components/DiscoveryProfileView";
import styles from "./DiscoveryChat.module.css";
import btnStyles from "@/styles/buttons.module.css";
import type {
  ChatMessage,
  DiscoveryChatContext,
  UserDiscoveryProfile,
} from "@/lib/discovery-profile";
import { buildDiscoveryProfile } from "@/lib/discovery-profile";
import { DISCOVERY_MAX_USER_TURNS } from "@/lib/discovery-prompt";
import {
  DEFAULT_DISCOVERY_SLIDER_VALUES,
  type DiscoverySliderValues,
} from "@/lib/discovery-sliders";
import {
  clearDiscoveryProfile,
  saveDiscoveryProfile,
} from "@/lib/discovery-storage";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Welcome. Share what draws you to monastic or retreat life — the more detail you offer, the fewer follow-up questions I will need.\n\nWhen I have enough to go on, you will tune preference sliders and we will build your profile.\n\nWhat draws you to monasteries or retreats right now?",
};

type DiscoveryContextValue = {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  error: string | null;
  userTurnCount: number;
  chatContext: DiscoveryChatContext | null;
  sliderValues: DiscoverySliderValues;
  setSliderValues: (values: DiscoverySliderValues) => void;
  profile: UserDiscoveryProfile | null;
  setProfile: (profile: UserDiscoveryProfile | null) => void;
  sendMessage: () => Promise<void>;
  confirmPreferences: () => void;
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
  const [chatContext, setChatContext] = useState<DiscoveryChatContext | null>(
    null,
  );
  const [sliderValues, setSliderValues] = useState<DiscoverySliderValues>(
    DEFAULT_DISCOVERY_SLIDER_VALUES,
  );
  const [profile, setProfile] = useState<UserDiscoveryProfile | null>(null);

  const userTurnCount = messages.filter((m) => m.role === "user").length;

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || profile || chatContext) return;
    if (userTurnCount >= DISCOVERY_MAX_USER_TURNS) return;

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
      if (data.chatContext) {
        setChatContext(data.chatContext);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  }

  function confirmPreferences() {
    if (!chatContext) return;
    setProfile(buildDiscoveryProfile(chatContext, sliderValues));
  }

  function startOver() {
    setMessages([INITIAL_MESSAGE]);
    setChatContext(null);
    setSliderValues(DEFAULT_DISCOVERY_SLIDER_VALUES);
    setProfile(null);
    setError(null);
    setInput("");
    clearDiscoveryProfile();
  }

  return (
    <DiscoveryContext.Provider
      value={{
        messages,
        input,
        setInput,
        loading,
        error,
        userTurnCount,
        chatContext,
        sliderValues,
        setSliderValues,
        profile,
        setProfile,
        sendMessage,
        confirmPreferences,
        startOver,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
}

export function DiscoveryChatSection() {
  const {
    messages,
    input,
    setInput,
    loading,
    error,
    userTurnCount,
    chatContext,
    profile,
    sendMessage,
  } = useDiscovery();
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatComplete = Boolean(chatContext || profile);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && !chatComplete) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [loading, chatComplete]);

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
          {chatComplete
            ? "Conversation complete — tune your sliders below."
            : "A short conversation — finish when you have said enough, or after a few follow-ups at most."}
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

        {!chatComplete && (
          <div className={styles.composer}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              disabled={loading || userTurnCount >= DISCOVERY_MAX_USER_TURNS}
              placeholder="Share what matters to you — the more context, the better your matches."
              aria-label="Your message"
            />
            <button
              type="button"
              className={btnStyles.btn}
              onClick={() => void sendMessage()}
              disabled={
                loading ||
                !input.trim() ||
                userTurnCount >= DISCOVERY_MAX_USER_TURNS
              }
            >
              Send
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function DiscoveryPreferencesSection() {
  const {
    chatContext,
    profile,
    sliderValues,
    setSliderValues,
    confirmPreferences,
  } = useDiscovery();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!chatContext || profile) return;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [chatContext, profile]);

  if (!chatContext || profile) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.preferencesBelowFold}
      aria-label="Preference sliders"
    >
      <div className={styles.profilePanel}>
        <DiscoveryPreferences
          values={sliderValues}
          onChange={setSliderValues}
        />
        <div className={styles.profileActions}>
          <button
            type="button"
            className={btnStyles.btn}
            onClick={confirmPreferences}
          >
            Build my profile
          </button>
        </div>
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
