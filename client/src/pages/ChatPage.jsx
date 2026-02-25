import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Send,
  Trash2,
  Sparkles,
  Book,
  MessageSquare,
  Brain,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    setIsUploading(true)

    // Simulate file upload
    setTimeout(() => {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type,
        uploadedAt: new Date().toISOString()
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])
      setIsUploading(false)

      // Add system message about file upload
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          content: `Successfully uploaded ${files.length} file(s). You can now ask questions about them.`,
          timestamp: new Date().toISOString()
        }
      ])
    }, 1500)
  }

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'system',
        content: 'File removed from context.',
        timestamp: new Date().toISOString()
      }
    ])
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: `I understand you're asking about: "${input}". ${
          uploadedFiles.length > 0
            ? `Based on the ${uploadedFiles.length} document(s) you've uploaded, I can help you analyze and understand the content.`
            : 'Please upload some documents so I can provide more specific insights.'
        }`,
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    'Summarize the key findings',
    'What are the main arguments?',
    'Explain the methodology',
    'Compare with related work'
  ]

  return (
    <div className="min-h-screen bg-primary noise-overlay">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl"
      >
        <div className="max-w-[1920px] mx-auto px-8 lg:px-16 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold gradient-text">
                  EdgeScholar AI
                </h1>
                <p className="text-sm text-neutral-400">
                  Intelligent Research Assistant
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="px-6 py-2.5 text-sm font-medium text-white/70 hover:text-white 
                       border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            >
              Back to Home
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-[1920px] mx-auto px-8 lg:px-16 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 h-[calc(100vh-180px)]">
          {/* Sidebar - File Management */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-1 glass-panel p-8 overflow-y-auto scrollbar-hide flex flex-col"
          >
            <div className="space-y-8 flex-1 flex flex-col">
              {/* Upload Area */}
              <div className="space-y-4">
                <h3 className="text-xl font-display font-semibold flex items-center gap-3">
                  <Book className="w-6 h-6 text-accent-blue" />
                  Your Library
                </h3>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-8 border-2 border-dashed border-accent-blue/30 rounded-2xl
                           hover:border-accent-blue/60 hover:bg-accent-blue/5 transition-all
                           flex flex-col items-center gap-4 group"
                >
                  <div className="p-4 bg-accent-blue/10 rounded-xl group-hover:bg-accent-blue/20 transition-colors">
                    <Upload className="w-8 h-8 text-accent-blue" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-white mb-1">
                      {isUploading ? 'Uploading...' : 'Drop files here'}
                    </p>
                    <p className="text-sm text-neutral-400">
                      or click to browse
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      PDF, TXT, DOCX supported
                    </p>
                  </div>
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <h4 className="text-base font-semibold text-white flex items-center justify-between">
                    <span>Active Documents</span>
                    <span className="text-sm font-normal text-neutral-400">
                      ({uploadedFiles.length})
                    </span>
                  </h4>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {uploadedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-4 bg-white/5 rounded-xl border border-white/10 group
                                   hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-accent-green/10 rounded-lg">
                              <FileText className="w-5 h-5 text-accent-green flex-shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate mb-1">
                                {file.name}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {file.size}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFile(file.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity
                                       p-1.5 hover:bg-red-500/20 rounded-lg"
                            >
                              <X className="w-4 h-4 text-red-400 hover:text-red-300" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="p-5 bg-gradient-to-br from-accent-blue/10 to-accent-green/10 rounded-xl border border-white/10">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold gradient-text mb-1">
                        {uploadedFiles.length}
                      </p>
                      <p className="text-xs text-neutral-400">Documents</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold gradient-text mb-1">
                        {messages.filter((m) => m.type === 'user').length}
                      </p>
                      <p className="text-xs text-neutral-400">Questions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Chat Area */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-4 glass-panel flex flex-col"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-12 py-10 space-y-6 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-4xl mx-auto">
                  {/* Hero Icon with Image */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/30 to-accent-green/30 rounded-3xl blur-2xl" />
                    <div className="relative p-8 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-3xl border border-white/10">
                      <img 
                        src="/images/documentation.png" 
                        alt="Documentation" 
                        className="w-24 h-24 mx-auto object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Welcome Text */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                  >
                    <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
                      Start Your Research Journey
                    </h2>
                    <p className="text-lg text-neutral-300 max-w-2xl leading-relaxed">
                      Upload your research papers, documents, or articles and
                      ask me anything. I'll help you understand complex
                      concepts and extract insights.
                    </p>
                  </motion.div>

                  {/* Feature Highlights */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-3 gap-6 w-full max-w-2xl"
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto bg-accent-blue/10 rounded-xl flex items-center justify-center">
                        <img src="/images/switch.png" alt="Fast" className="w-6 h-6 object-contain" />
                      </div>
                      <p className="text-sm text-neutral-400">Lightning Fast</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto bg-accent-green/10 rounded-xl flex items-center justify-center">
                        <img src="/images/stamp.png" alt="Private" className="w-6 h-6 object-contain" />
                      </div>
                      <p className="text-sm text-neutral-400">100% Private</p>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto bg-accent-cyan/10 rounded-xl flex items-center justify-center">
                        <img src="/images/seo.png" alt="Smart" className="w-6 h-6 object-contain" />
                      </div>
                      <p className="text-sm text-neutral-400">AI Powered</p>
                    </div>
                  </motion.div>

                  {/* Suggested Questions */}
                  {uploadedFiles.length > 0 && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full pt-4"
                    >
                      {suggestedQuestions.map((question, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput(question)}
                          className="p-5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10
                                   text-left text-sm transition-all group"
                        >
                          <MessageSquare className="w-5 h-5 text-accent-green mb-3 group-hover:scale-110 transition-transform" />
                          <p className="font-medium">{question}</p>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto w-full">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-4 mb-8 ${
                          message.type === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.type === 'ai' && (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-green 
                                        flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                        )}

                        <div
                          className={`${
                            message.type === 'user'
                              ? 'max-w-[75%]'
                              : 'max-w-[85%]'
                          }`}
                        >
                          <div
                            className={`${
                              message.type === 'user'
                                ? 'bg-gradient-to-br from-accent-blue to-accent-cyan text-white shadow-lg'
                                : message.type === 'system'
                                ? 'bg-neutral-800/50 border border-accent-green/30'
                                : 'bg-white/5 border border-white/10'
                            } p-5 rounded-2xl`}
                          >
                            {message.type === 'system' && (
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-accent-green" />
                                <span className="text-xs font-semibold text-accent-green uppercase tracking-wide">
                                  System
                                </span>
                              </div>
                            )}
                            <p className="text-base leading-relaxed">
                              {message.content}
                            </p>
                            <p className="text-xs text-white/40 mt-3">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {message.type === 'user' && (
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center 
                                        flex-shrink-0 border border-white/20">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 mb-8"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-green 
                                    flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                        <div className="flex gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="w-2.5 h-2.5 bg-accent-blue rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: 0.2
                            }}
                            className="w-2.5 h-2.5 bg-accent-green rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: 0.4
                            }}
                            className="w-2.5 h-2.5 bg-accent-cyan rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="px-12 py-8 border-t border-white/10 bg-black/20">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        uploadedFiles.length > 0
                          ? 'Ask anything about your documents...'
                          : 'Upload documents first to start chatting...'
                      }
                      disabled={uploadedFiles.length === 0}
                      rows="1"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl
                               text-white text-base placeholder:text-neutral-500 focus:outline-none
                               focus:border-accent-blue/50 focus:bg-white/10 transition-all
                               resize-none disabled:opacity-50 disabled:cursor-not-allowed
                               shadow-lg"
                      style={{ minHeight: '56px', maxHeight: '140px' }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!input.trim() || uploadedFiles.length === 0}
                    className="px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-green
                             text-white rounded-xl font-medium transition-all
                             hover:shadow-xl hover:shadow-accent-blue/40
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                             shadow-lg"
                  >
                    <Send className="w-6 h-6" />
                  </motion.button>
                </div>
                <p className="text-xs text-neutral-500 mt-3 text-center">
                  Press <kbd className="px-2 py-0.5 bg-white/10 rounded">Enter</kbd> to send • <kbd className="px-2 py-0.5 bg-white/10 rounded">Shift + Enter</kbd> for new line
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
