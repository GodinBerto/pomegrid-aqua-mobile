import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { MessageCircle, Send } from "lucide-react-native";
import { AppText, AuthPrompt, Button, Card, EmptyState, LoadingState, Screen, TextField } from "@/components/ui";
import {
  useMarkSupportConversationReadMutation,
  useSessionUser,
  useSendSupportMessageMutation,
  useSupportChatRealtime,
  useSupportConversation,
  useSupportMessages,
} from "@/query";
import { getChatDayLabel } from "@/lib/utils";

export const ChatScreen = () => {
  const { user, isAuthenticated } = useSessionUser();
  const scrollRef = React.useRef<ScrollView>(null);
  const [message, setMessage] = React.useState("");
  const { data: conversation } = useSupportConversation(isAuthenticated);
  const {
    data: messagesResponse,
    isLoading,
    error,
  } = useSupportMessages({ per_page: 100 }, isAuthenticated);
  const sendMessageMutation = useSendSupportMessageMutation();
  const markConversationReadMutation = useMarkSupportConversationReadMutation();

  const conversationId = conversation?.id ? String(conversation.id) : undefined;
  const currentUserId = String(user?.id || "user-current");
  const messages = messagesResponse?.data || [];

  useSupportChatRealtime({
    enabled: isAuthenticated,
    conversationId,
  });

  React.useEffect(() => {
    if (conversationId) {
      markConversationReadMutation.mutate();
    }
  }, [conversationId, markConversationReadMutation]);

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const response = await sendMessageMutation.mutateAsync(trimmed);
    if (!response.success) {
      Alert.alert("Could not send message", response.message);
      return;
    }

    setMessage("");
  };

  if (!isAuthenticated) {
    return (
      <Screen contentContainerClassName="pt-8">
        <AuthPrompt
          title="Live support needs your account"
          description="Sign in to open your user-side support thread and receive realtime updates from admin."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} className="bg-background">
      <KeyboardAvoidingView
        className="flex-1 pb-4"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 gap-4 pt-2">
          <Card className="gap-2">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <MessageCircle color="#1B5E20" size={22} />
              </View>
              <View className="flex-1">
                <AppText weight="bold" className="text-lg">
                  Customer Support
                </AppText>
                <AppText className="text-sm text-brand-subtext">
                  Messages are sent directly to the admin support team.
                </AppText>
              </View>
            </View>
          </Card>

          <Card className="flex-1 overflow-hidden p-0">
            {isLoading ? <LoadingState label="Loading conversation..." /> : null}
            {error ? (
              <View className="p-5">
                <AppText className="text-destructive">{error.message}</AppText>
              </View>
            ) : null}
            {!isLoading && !error ? (
              <ScrollView
                ref={scrollRef}
                className="flex-1 px-4 py-4"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
              >
                {messages.length === 0 ? (
                  <EmptyState
                    title="Start the conversation"
                    description="Ask about stock, services, delivery, or order issues and the support thread will stay attached to your account."
                  />
                ) : (
                  messages.map((chatMessage, index) => {
                    const isCurrentUser = chatMessage.senderId === currentUserId;
                    const showDate =
                      index === 0 ||
                      messages[index - 1].timestamp.toDateString() !== chatMessage.timestamp.toDateString();

                    return (
                      <View key={chatMessage.id} className="mb-3 gap-2">
                        {showDate ? (
                          <View className="items-center py-2">
                            <AppText className="text-xs uppercase tracking-[1.3px] text-brand-subtext">
                              {getChatDayLabel(chatMessage.timestamp)}
                            </AppText>
                          </View>
                        ) : null}
                        <View className={isCurrentUser ? "items-end" : "items-start"}>
                          <View
                            className={`max-w-[82%] rounded-[22px] px-4 py-3 ${
                              isCurrentUser ? "bg-primary rounded-br-md" : "bg-secondary rounded-bl-md"
                            }`}
                          >
                            {!isCurrentUser ? (
                              <AppText weight="semibold" className="mb-1 text-xs text-primary">
                                Customer Support
                              </AppText>
                            ) : null}
                            <AppText className={isCurrentUser ? "text-white" : "text-brand-ink"}>
                              {chatMessage.content}
                            </AppText>
                            <AppText className={`mt-2 text-[11px] ${isCurrentUser ? "text-white/70" : "text-brand-subtext"}`}>
                              {chatMessage.timestamp.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </AppText>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            ) : null}
          </Card>

          <Card className="gap-3">
            <TextField
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question..."
            />
            <Button onPress={handleSendMessage} disabled={sendMessageMutation.isPending}>
              <View className="flex-row items-center gap-2">
                <Send color="#FFFFFF" size={18} />
                <AppText weight="semibold" className="text-white">
                  {sendMessageMutation.isPending ? "Sending..." : "Send message"}
                </AppText>
              </View>
            </Button>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};
