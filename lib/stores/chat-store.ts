import { type UIMessage } from "ai";
import { create } from "zustand";

type ChatStatus = "ready" | "submitted" | "streaming" | "error";

type ConversationData = {
  chatId: string;
  query: string;
};

type ChatStore = {
  conversation: ConversationData | null;
  visibleMessages: UIMessage[];
  status: ChatStatus;
  setConversation: (conversation: ConversationData) => void;
  setVisibleMessages: (messages: UIMessage[]) => void;
  setStatus: (status: ChatStatus) => void;
  hydrate: (input: {
    conversation: ConversationData;
    messages: UIMessage[];
    status?: ChatStatus;
  }) => void;
  reset: () => void;
};

const initialState: Pick<ChatStore, "conversation" | "visibleMessages" | "status"> = {
  conversation: null,
  visibleMessages: [],
  status: "ready",
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,
  setConversation: (conversation) => set({ conversation }),
  setVisibleMessages: (visibleMessages) => set({ visibleMessages }),
  setStatus: (status) => set({ status }),
  hydrate: ({ conversation, messages, status = "ready" }) =>
    set({
      conversation,
      visibleMessages: messages,
      status,
    }),
  reset: () => set(initialState),
}));

