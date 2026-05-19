"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./DiscoveryChat.module.css";
import {
  SPECTRUM_LABELS,
  type ChatMessage,
  type UserDiscoveryProfile,
} from "@/lib/discovery-profile";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Welcome. I will ask a few questions about your spiritual interests, the kind of community you imagine, practical needs, and how seriously you are exploring — then I will shape a profile to guide your search. \n\n What draws you to monasteries or retreats right now?",
};

type SpectrumGroup = keyof typeof SPECTRUM_LABELS;

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
    throw new Error("Discovery components must be used within DiscoveryProvider");
  }
  return value;
}

function SpectrumSlider({
  left,
  right,
  value,
  onChange,
}: {
  left: string;
  right: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.spectrumRow}>
      <div className={styles.spectrumLabels}>
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.spectrumSlider}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value}% toward ${right}`}
        aria-label={`${left} to ${right}`}
      />
    </div>
  );
}

function ProfileView({
  profile,
  onChange,
}: {
  profile: UserDiscoveryProfile;
  onChange: (profile: UserDiscoveryProfile) => void;
}) {
  function updateSpectrum(group: SpectrumGroup, key: string, value: number) {
    onChange({
      ...profile,
      [group]: {
        ...profile[group],
        [key]: value,
      },
    });
  }

  const renderSpectrums = (
    scores: Record<string, number>,
    group: SpectrumGroup,
  ) =>
    (
      Object.keys(SPECTRUM_LABELS[group]) as Array<
        keyof (typeof SPECTRUM_LABELS)[typeof group]
      >
    ).map((key) => {
      const labels = SPECTRUM_LABELS[group][key];
      const value = scores[key as string];
      if (value === undefined) return null;
      return (
        <SpectrumSlider
          key={String(key)}
          left={labels[0]}
          right={labels[1]}
          value={value}
          onChange={(next) => updateSpectrum(group, key as string, next)}
        />
      );
    });

  const practical = profile.practicalConstraints;
  const practicalEntries = [
    ["Budget", practical.budget],
    ["Visa needs", practical.visaNeeds],
    ["Languages", practical.languageSupport?.join(", ")],
    ["Dietary", practical.dietaryRestrictions?.join(", ")],
    ["Accessibility", practical.accessibilityNeeds?.join(", ")],
    ["Age", practical.ageConsiderations],
    ["Family", practical.familyFriendliness],
  ].filter(([, v]) => v && String(v).trim().length > 0);

  return (
    <div className={styles.profile}>
      <p className={styles.profileLabel}>Your discovery profile</p>
      <h3 className={styles.profileTitle}>{profile.title}</h3>
      <p className={styles.profileSummary}>{profile.summary}</p>

      <div className={styles.profileSection}>
        <h4>Spiritual orientation</h4>
        {renderSpectrums(
          profile.spiritualOrientation as unknown as Record<string, number>,
          "spiritualOrientation",
        )}
      </div>

      <div className={styles.profileSection}>
        <h4>Community structure</h4>
        {renderSpectrums(
          profile.communityStructure as unknown as Record<string, number>,
          "communityStructure",
        )}
      </div>

      <div className={styles.profileSection}>
        <h4>Lifestyle</h4>
        {renderSpectrums(
          profile.lifestyle as unknown as Record<string, number>,
          "lifestyle",
        )}
      </div>

      {practicalEntries.length > 0 && (
        <div className={styles.profileSection}>
          <h4>Practical constraints</h4>
          <ul className={styles.practicalList}>
            {practicalEntries.map(([label, value]) => (
              <li key={label}>
                <strong>{label}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.profileSection}>
        <h4>Readiness</h4>
        <p>
          <strong>Intent:</strong> {profile.readiness.primaryIntent}
        </p>
        <p>
          <strong>Seriousness:</strong> {profile.readiness.seriousnessLevel} / 5
        </p>
        {profile.readiness.notes && <p>{profile.readiness.notes}</p>}
      </div>
    </div>
  );
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
              placeholder="Share what you are looking for…"
              rows={2}
              disabled={loading}
              aria-label="Your message"
            />
            <button
              type="button"
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
  const { profile, setProfile, startOver } = useDiscovery();
  const profileRef = useRef<HTMLElement>(null);

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
        <ProfileView profile={profile} onChange={setProfile} />
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={startOver}
        >
          Start over
        </button>
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
