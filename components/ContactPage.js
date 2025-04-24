import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

const ContactPage = ({ customerName }) => {
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [successContact, setSuccessContact] = useState('');
const [successNewUser, setSuccessNewUser] = useState('');

  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingUser, setSendingUser] = useState(false);

  const emailEndpoint = 'https://us-central1-fuelsrv-dashboard.cloudfunctions.net/sendDashboardEmail';

  const sendMessage = async () => {
    if (!message.trim()) {
      return Alert.alert('Message Required', 'Please enter a message.');
    }

    setSendingMessage(true);
    try {
      const response = await fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          customerName,
          messageBody: message,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
  setSuccessContact("Message sent - we will be in touch within 24 hours!");
  setMessage('');
  setTimeout(() => setSuccessContact(''), 5000); // auto-dismiss after 5 seconds
}
else {
        Alert.alert('Error', result.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error('❌ Contact Error:', error);
      Alert.alert('Error', 'Unable to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const sendUserRequest = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      return Alert.alert('All Fields Required', 'Please fill out both fields.');
    }

    setSendingUser(true);
    try {
      const response = await fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'newUser',
          customerName,
          newUserName: userName,
          newUserEmail: userEmail,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
  setSuccessNewUser("New user request sent - we will be in touch within 24 hours with their new credentials");
  setUserName('');
  setUserEmail('');
  setTimeout(() => setSuccessNewUser(''), 5000); // auto-dismiss after 5 seconds
}
else {
        Alert.alert('Error', result.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error('❌ New User Error:', error);
      Alert.alert('Error', 'Unable to submit user request.');
    } finally {
      setSendingUser(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Contact us for immediate support via (778) 918-3778 (FSRV) in Vancouver or via our Toll-Free number (866) 364-3778 (FSRV) for Edmonton.
      </Text>
      <Text style={styles.subheader}>
        Send us a message by filling out the below which will send directly to contact@fuelsrv.com and we promise to reply within 24 hours.
      </Text>
	  {successContact !== '' && (
  <View style={styles.successBubble}>
    <Text style={styles.successText}>{successContact}</Text>
  </View>
)}

      <TextInput
        style={styles.inputLarge}
        placeholder="Type your message here..."
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={sendMessage} disabled={sendingMessage}>
        {sendingMessage ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send</Text>}
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Grant a New User Access</Text>
      <Text style={styles.subheader}>
        If you'd like to grant a new user access to your FuelSrv Dashboard, please simply fill out and submit the info below - we will send an e-mail to you with confirmation of the user creation with their password within 24 hours.
      </Text>
{successNewUser !== '' && (
  <View style={styles.successBubble}>
    <Text style={styles.successText}>{successNewUser}</Text>
  </View>
)}


      <TextInput
        style={styles.input}
        placeholder="User Name"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="User E-mail"
        value={userEmail}
        onChangeText={setUserEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={sendUserRequest} disabled={sendingUser}>
        {sendingUser ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  subheader: {
    fontSize: 14,
    marginBottom: 12
  },
  successBubble: {
  backgroundColor: '#d4edda',
  borderColor: '#c3e6cb',
  borderWidth: 1,
  padding: 10,
  borderRadius: 6,
  marginBottom: 12
},
successText: {
  color: '#155724',
  fontSize: 14
},

  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6
  },
  inputLarge: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderRadius: 6
  },
  button: {
    backgroundColor: '#1a472a',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default ContactPage;
