import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { OPENAI_API_KEY } from '@env';

const API_KEY = 'sk-instalane-COcHz8Jg4sZUkZzriLyeT3BlbkFJD4WIjWRU0p650ijNlSK6';  // Hardcoded API Key

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef();

  // Load chat history from AsyncStorage
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('messages');
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, []);

  // Save chat history to AsyncStorage
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { text: input, type: 'user' }];
    setMessages(newMessages);
    await saveMessages(newMessages);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: input }
          ],
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const botMessage = response.data.choices[0].message.content.trim();
      const updatedMessages = [...newMessages, { text: botMessage, type: 'bot' }];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      const errorMessage = 'Error: Could not fetch response';
      setMessages([...newMessages, { text: errorMessage, type: 'bot' }]);
      await saveMessages([...newMessages, { text: errorMessage, type: 'bot' }]);
    }

    setInput('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ChatBot App</Text>
      </View>

      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View key={index} style={styles.messageWrapper}>
            {/* Display who sent the message (User or Bot) */}
            {message.type === 'user' ?  <Text style={styles.senderLabel } >
              User
            </Text> : <Text style={styles.senderLabelbot } >
              Assistant
            </Text>}
           
            <View
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer
              ]}
            >
              <Text
                style={[
                  styles.message,
                  message.type === 'user' ? styles.userMessage : styles.botMessage
                ]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  messageWrapper: {
    marginVertical: 5,
  },
  senderLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
    textAlign: 'right',
  },
  senderLabelbot: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
    textAlign: 'left',
  },
  messageContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  message: {
    fontSize: 16,
  },
  userMessage: {
    color: '#fff',
  },
  botMessage: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;
