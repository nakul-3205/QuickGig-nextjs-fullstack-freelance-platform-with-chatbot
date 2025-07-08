'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send } from 'lucide-react'
import { motion } from 'framer-motion'

const LOCAL_STORAGE_KEY = 'quickGigBotMessages' // Define a key for local storage

export default function QuickGigBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // 1. Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
      } else {
        // If no stored messages, add the welcome message
        setMessages([{ from: 'bot', text: '👋 Hey! I’m QuickGig AI. How can I help you today?' }])
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage", error);
      // Fallback: If loading fails, still add the welcome message
      setMessages([{ from: 'bot', text: '👋 Hey! I’m QuickGig AI. How can I help you today?' }])
    }
  }, []) // Empty dependency array means this runs only once on mount

  // 2. Save messages to localStorage whenever the messages state changes
  useEffect(() => {
    if (messages.length > 0) { // Only save if there are messages
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages))
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
      }
    }
  }, [messages]) // Run this effect whenever 'messages' state changes

  // Scroll to bottom of chat when messages update or bot typing changes
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isBotTyping])

  // Removed the old welcome message useEffect as it's now handled by the first useEffect
  // useEffect(() => {
  //   if (open && messages.length === 0) {
  //     setMessages([{ from: 'bot', text: '👋 Hey! I’m QuickGig AI. How can I help you today?' }])
  //   }
  // }, [open, messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isSending) return
    const userMsg = input.trim()

    setMessages(prev => [...prev, { from: 'user', text: userMsg }])
    setInput('')
    setIsSending(true)
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })

      const data = await res.json()
      const reply = data.reply || '🤖 Sorry, I didn’t get that. Please try again!'

      setMessages(prev => [...prev, { from: 'bot', text: reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { from: 'bot', text: '⚠️ Something went wrong. Try again later.' }])
    } finally {
      setIsSending(false)
      setIsBotTyping(false);
    }
  }

  return (
    <div>
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-4 right-4 bg-quickgig-accent p-3 rounded-full z-50 shadow-md hover:scale-110 transition-all dark:bg-quickgig-accent"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open chatbot"
        >
          <Bot size={30} className="text-black dark:text-white" />
        </motion.button>
      )}

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 w-[350px] max-h-[500px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-quickgig-accent text-white rounded-t-2xl">
            <h2 className="font-bold text-lg">QuickGig AI</h2>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="text-white" />
            </button>
          </div>

          {/* Chat Body */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800 custom-scrollbar"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] px-4 py-2 rounded-xl text-sm shadow-sm ${
                  msg.from === 'user'
                    ? 'bg-quickgig-accent text-white ml-auto rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white mr-auto rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isBotTyping && (
              <div className="max-w-[80%] px-4 py-2 rounded-xl text-sm shadow-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white mr-auto rounded-bl-none">
                <span className="typing-text">Thinking</span><span className="typing-dots"></span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex items-center p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={isSending ? 'Sending...' : 'Ask anything...'}
              className="flex-1 px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-quickgig-accent bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSending}
            />
            <motion.button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              className="ml-2 p-2 rounded-full bg-quickgig-accent text-white hover:bg-quickgig-accent/90 disabled:bg-gray-400"
              whileTap={{ scale: 0.95 }}
            >
              <Send size={20} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}