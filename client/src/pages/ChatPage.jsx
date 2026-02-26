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
  AlertCircle,
  Copy,
  Check
} from 'lucide-react'
import { uploadDocument, sendChatMessage } from '../api'

const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const copyToClipboard = (text, messageId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    setIsUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const response = await uploadDocument(file, (progress) => {
          console.log(`Upload progress for ${file.name}: ${progress}%`)
        })
        
        return {
          id: response.doc_id,
          name: response.file_name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type,
          uploadedAt: new Date().toISOString(),
          pageCount: response.page_count,
          totalWords: response.total_words,
          chunksCreated: response.chunks_created
        }
      })

      const newFiles = await Promise.all(uploadPromises)
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
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          content: `Upload failed: ${error.response?.data?.detail || error.message}`,
          timestamp: new Date().toISOString()
        }
      ])
    }
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
    const currentInput = input
    setInput('')
    setIsTyping(true)

    try {
      const response = await sendChatMessage(currentInput, {
        temperature: 0.7,
        maxTokens: 1024,
        stream: false
      })

      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: response.response,
        sources: response.sources || [],
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    } catch (error) {
      console.error('Chat failed:', error)
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Sorry, I encountered an error: ${error.response?.data?.detail || error.message}. Please make sure the server is running.`,
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsTyping(false)
    }
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
    <div className="h-screen bg-primary overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{ backgroundImage: "url('/images/pexels-pixabay-355887.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
      </div>

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 glass-panel border-b border-white/10 backdrop-blur-xl flex-shrink-0"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <img src="/images/1.png" alt="Vigor AI" className="h-8 sm:h-10 lg:h-12 w-auto" />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-display font-bold gradient-text">
                  Vigor AI
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 hidden sm:block">
                  Intelligent Research Assistant
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-2.5 text-xs sm:text-sm font-medium text-white/70 hover:text-white 
                       border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            >
              Back to Home
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10 flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 h-full">
          {/* Sidebar - File Management */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 glass-panel p-4 sm:p-6 lg:p-8 flex flex-col h-full overflow-hidden"
          >
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 flex-1 flex flex-col min-h-0">
              {/* Upload Area */}
              <div className="space-y-3 sm:space-y-4 flex-shrink-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-display font-semibold flex items-center gap-2 sm:gap-3">
                  <Book className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent-blue" />
                  Your Library
                </h3>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-4 sm:p-6 lg:p-8 border-2 border-dashed border-accent-blue/30 rounded-xl lg:rounded-2xl
                           hover:border-accent-blue/60 hover:bg-accent-blue/5 transition-all
                           flex flex-col items-center gap-2 sm:gap-3 lg:gap-4 group"
                >
                  <div className="p-2 sm:p-3 lg:p-4 bg-accent-blue/10 rounded-lg lg:rounded-xl group-hover:bg-accent-blue/20 transition-colors">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-accent-blue" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-semibold text-white mb-1">
                      {isUploading ? 'Uploading...' : 'Drop files here'}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-400">
                      or click to browse
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 sm:mt-2">
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
                <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto scrollbar-hide min-h-0">
                  <h4 className="text-sm sm:text-base font-semibold text-white flex items-center justify-between">
                    <span>Active Documents</span>
                    <span className="text-xs sm:text-sm font-normal text-neutral-400">
                      ({uploadedFiles.length})
                    </span>
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <AnimatePresence>
                      {uploadedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-3 sm:p-4 bg-white/5 rounded-lg lg:rounded-xl border border-white/10 group
                                   hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-accent-green/10 rounded-lg">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green flex-shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-white truncate mb-0.5 sm:mb-1">
                                {file.name}
                              </p>
                              <p className="text-[10px] sm:text-xs text-neutral-400">
                                {file.size}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFile(file.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity
                                       p-1 sm:p-1.5 hover:bg-red-500/20 rounded-lg"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 hover:text-red-300" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="pt-4 sm:pt-6 border-t border-white/10 flex-shrink-0">
                <div className="p-4 sm:p-5 bg-gradient-to-br from-accent-blue/10 to-accent-green/10 rounded-lg lg:rounded-xl border border-white/10">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 text-center">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">
                        {uploadedFiles.length}
                      </p>
                      <p className="text-[10px] sm:text-xs text-neutral-400">Documents</p>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">
                        {messages.filter((m) => m.type === 'user').length}
                      </p>
                      <p className="text-[10px] sm:text-xs text-neutral-400">Questions</p>
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
            className="lg:col-span-4 glass-panel flex flex-col h-full"
          >
            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-10 space-y-4 sm:space-y-6 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 lg:space-y-10 max-w-4xl mx-auto px-4">
                  {/* Hero Icon with Image */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/30 to-accent-green/30 rounded-2xl lg:rounded-3xl blur-2xl" />
                    <div className="relative p-6 sm:p-8 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-2xl lg:rounded-3xl border border-white/10">
                      <img 
                        src="/images/documentation.png" 
                        alt="Documentation" 
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Welcome Text */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold gradient-text mb-3 sm:mb-4">
                      Start Your Research Journey
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl leading-relaxed">
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
                                : 'bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 backdrop-blur-sm'
                            } p-6 rounded-2xl`}
                          >
                            {message.type === 'system' && (
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-accent-green" />
                                <span className="text-xs font-semibold text-accent-green uppercase tracking-wide">
                                  System
                                </span>
                              </div>
                            )}
                            <p className="text-base leading-relaxed whitespace-pre-wrap text-white/90">
                              {message.content}
                            </p>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Sources Referenced
                                </p>
                                <div className="space-y-2">
                                  {message.sources.map((source, idx) => (
                                    <div 
                                      key={idx} 
                                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                      <div className="flex-shrink-0 w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-accent-blue" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white/90 truncate mb-1">
                                          {source.file_name}
                                        </p>
                                        {source.title && source.title !== 'Untitled' && (
                                          <p className="text-xs text-neutral-400 line-clamp-1 mb-1">
                                            {source.title}
                                          </p>
                                        )}
                                        {source.relevance_score && (
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full"
                                                style={{ width: `${Math.round(source.relevance_score * 100)}%` }}
                                              />
                                            </div>
                                            <span className="text-xs font-semibold text-accent-green">
                                              {Math.round(source.relevance_score * 100)}%
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                              <p className="text-xs text-white/40">
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              {message.type === 'ai' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => copyToClipboard(message.content, message.id)}
                                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white/60 hover:text-white/90 
                                           bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                >
                                  {copiedId === message.id ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </motion.button>
                              )}
                            </div>
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
                        <div className="flex gap-2 mb-3">
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
                        <p className="text-sm text-neutral-400">
                          Thinking... This may take 1-2 minutes on first run while the model loads.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 border-t border-white/10 bg-black/20">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 sm:gap-3 lg:gap-4">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        uploadedFiles.length > 0
                          ? 'Ask anything about your documents...'
                          : 'Ask me anything or upload documents for context...'
                      }
                      rows="1"
                      className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 bg-white/5 border border-white/10 rounded-lg lg:rounded-xl
                               text-white text-sm sm:text-base placeholder:text-neutral-500 focus:outline-none
                               focus:border-accent-blue/50 focus:bg-white/10 transition-all
                               resize-none shadow-lg"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-accent-blue to-accent-green
                             text-white rounded-lg lg:rounded-xl font-medium transition-all
                             hover:shadow-xl hover:shadow-accent-blue/40
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                             shadow-lg flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
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
