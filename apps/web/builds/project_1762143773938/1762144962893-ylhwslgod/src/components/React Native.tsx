```typescript
import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { OPENROUTER_API_KEY } from '@env';

/**
 * Interface for chat message objects
 */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Interface for OpenRouter API response
 */
interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Chat component that integrates with OpenRouter API
 */
export const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sends message to OpenRouter API and handles response
   */
  const sendMessage = useCallback(async (userMessage: string) => {
    try {
      setIsLoading(true);

      // Add user message to chat
      const newMessages = [...messages, { role: 'user', content: userMessage }];
      setMessages(newMessages);
      setInputText('');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      // Add AI response to chat
      setMessages([
        ...newMessages,
        { 
          role: 'assistant',
          content: data.choices[0].message.content
        }
      ]);

    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send message'
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        {messages.map((message, index) => (
          <View 
            key={index}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userMessage : styles.aiMessage
            ]}
          >
            <Text style={styles.messageText}>{message.content}</Text>
          </View>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          disabled={isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.disabledButton]}
          onPress={() => {
            if (inputText.trim() && !isLoading) {
              sendMessage(inputText.trim());
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatComponent;
```