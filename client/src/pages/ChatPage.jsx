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
        <div className="w-full px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/images/1.png" alt="Vigor AI" className="h-7 w-auto" />
              <div>
                <h1 className="text-base font-display font-bold gradient-text leading-tight">
                  Vigor AI
                </h1>
                <p className="text-[11px] text-neutral-400 hidden sm:block leading-tight">
                  Intelligent Research Assistant
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white 
                       border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            >
              Back to Home
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 w-full px-3 sm:px-4 py-3 flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-full">
          {/* Sidebar - File Management */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 glass-panel p-3 sm:p-4 flex flex-col h-full overflow-hidden"
          >
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              {/* Upload Area */}
              <div className="space-y-2 flex-shrink-0">
                <h3 className="text-sm font-display font-semibold flex items-center gap-2 text-white">
                  <Book className="w-4 h-4 text-accent-blue" />
                  Your Library
                </h3>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full p-3 border-2 border-dashed border-accent-blue/30 rounded-xl
                           hover:border-accent-blue/60 hover:bg-accent-blue/5 transition-all
                           flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 bg-accent-blue/10 rounded-lg group-hover:bg-accent-blue/20 transition-colors">
                    <Upload className="w-4 h-4 text-accent-blue" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white mb-0.5">
                      {isUploading ? 'Uploading...' : 'Drop files here'}
                    </p>
                    <p className="text-[10px] text-neutral-400">or click to browse</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">PDF, TXT, DOCX</p>
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
                <div className="space-y-2 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                  <h4 className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Active Documents</span>
                    <span className="font-normal text-neutral-400">({uploadedFiles.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {uploadedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-2.5 bg-white/5 rounded-lg border border-white/10 group hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 bg-accent-green/10 rounded-md">
                              <FileText className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white truncate">{file.name}</p>
                              <p className="text-[10px] text-neutral-400">{file.size}</p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFile(file.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="pt-3 border-t border-white/10 flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-accent-blue/10 to-accent-green/10 rounded-lg border border-white/10">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold gradient-text">{uploadedFiles.length}</p>
                      <p className="text-[10px] text-neutral-400">Documents</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold gradient-text">
                        {messages.filter((m) => m.type === 'user').length}
                      </p>
                      <p className="text-[10px] text-neutral-400">Questions</p>
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
            className="lg:col-span-4 glass-panel flex flex-col h-full overflow-hidden"
          >
            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 min-h-0 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 max-w-2xl mx-auto px-4">
                  {/* Hero Icon */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/30 to-accent-green/30 rounded-2xl blur-xl" />
                    <div className="relative p-4 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-2xl border border-white/10">
                      <img 
                        src="/images/documentation.png" 
                        alt="Documentation" 
                        className="w-12 h-12 mx-auto object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Welcome Text */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <h2 className="text-xl sm:text-2xl font-display font-bold gradient-text">
                      Start Your Research Journey
                    </h2>
                    <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                      Upload your research papers, documents, or articles and ask me anything.
                    </p>
                  </motion.div>

                  {/* Feature Highlights */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="grid grid-cols-3 gap-4 w-full max-w-sm"
                  >
                    <div className="text-center space-y-1.5">
                      <div className="w-9 h-9 mx-auto bg-accent-blue/10 rounded-xl flex items-center justify-center">
                        <img src="/images/switch.png" alt="Fast" className="w-5 h-5 object-contain" />
                      </div>
                      <p className="text-xs text-neutral-400">Lightning Fast</p>
                    </div>
                    <div className="text-center space-y-1.5">
                      <div className="w-9 h-9 mx-auto bg-accent-green/10 rounded-xl flex items-center justify-center">
                        <img src="/images/stamp.png" alt="Private" className="w-5 h-5 object-contain" />
                      </div>
                      <p className="text-xs text-neutral-400">100% Private</p>
                    </div>
                    <div className="text-center space-y-1.5">
                      <div className="w-9 h-9 mx-auto bg-accent-cyan/10 rounded-xl flex items-center justify-center">
                        <img src="/images/seo.png" alt="Smart" className="w-5 h-5 object-contain" />
                      </div>
                      <p className="text-xs text-neutral-400">AI Powered</p>
                    </div>
                  </motion.div>

                  {/* Suggested Questions */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl"
                  >
                    {suggestedQuestions.map((question, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInput(question)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10
                                 text-left text-xs transition-all group"
                      >
                        <MessageSquare className="w-4 h-4 text-accent-green mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-medium text-white/80">{question}</p>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto w-full">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-3 mb-4 ${
                          message.type === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-green 
                                        flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div className={`${message.type === 'user' ? 'max-w-[75%]' : 'max-w-[85%]'}`}>
                          <div
                            className={`${
                              message.type === 'user'
                                ? 'bg-gradient-to-br from-accent-blue to-accent-cyan text-white shadow-lg'
                                : message.type === 'system'
                                ? 'bg-neutral-800/50 border border-accent-green/30'
                                : 'bg-white/[0.05] border border-white/10 backdrop-blur-sm'
                            } px-4 py-3 rounded-2xl`}
                          >
                            {message.type === 'system' && (
                              <div className="flex items-center gap-1.5 mb-2">
                                <CheckCircle className="w-3.5 h-3.5 text-accent-green" />
                                <span className="text-[10px] font-semibold text-accent-green uppercase tracking-wide">
                                  System
                                </span>
                              </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/90">
                              {message.content}
                            </p>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <p className="text-[10px] font-semibold text-accent-cyan uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" />
                                  Sources Referenced
                                </p>
                                <div className="space-y-1.5">
                                  {message.sources.map((source, idx) => (
                                    <div 
                                      key={idx} 
                                      className="flex items-start gap-2 p-2.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                      <div className="flex-shrink-0 w-6 h-6 bg-accent-blue/20 rounded flex items-center justify-center">
                                        <FileText className="w-3 h-3 text-accent-blue" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white/90 truncate">
                                          {source.file_name}
                                        </p>
                                        {source.title && source.title !== 'Untitled' && (
                                          <p className="text-[10px] text-neutral-400 line-clamp-1">
                                            {source.title}
                                          </p>
                                        )}
                                        {source.relevance_score && (
                                          <div className="flex items-center gap-1.5 mt-1">
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-gradient-to-r from-accent-green to-accent-cyan rounded-full"
                                                style={{ width: `${Math.round(source.relevance_score * 100)}%` }}
                                              />
                                            </div>
                                            <span className="text-[10px] font-semibold text-accent-green">
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
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <p className="text-[10px] text-white/30">
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
                                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-white/50 hover:text-white/80 
                                           bg-white/5 hover:bg-white/10 rounded transition-all"
                                >
                                  {copiedId === message.id ? (
                                    <><Check className="w-2.5 h-2.5" /><span>Copied!</span></>
                                  ) : (
                                    <><Copy className="w-2.5 h-2.5" /><span>Copy</span></>
                                  )}
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>

                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center 
                                        flex-shrink-0 border border-white/20 mt-0.5">
                            <MessageSquare className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 mb-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-green 
                                    flex items-center justify-center shadow-lg mt-0.5">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                        <div className="flex gap-1.5 mb-2">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="w-2 h-2 bg-accent-blue rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                            className="w-2 h-2 bg-accent-green rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                            className="w-2 h-2 bg-accent-cyan rounded-full"
                          />
                        </div>
                        <p className="text-xs text-neutral-400">
                          Thinking... This may take 1-2 minutes on first run.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-white/10 bg-black/20">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-2">
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
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                               text-sm text-white placeholder:text-neutral-500 focus:outline-none
                               focus:border-accent-blue/50 focus:bg-white/8 transition-all
                               resize-none"
                      style={{ minHeight: '42px', maxHeight: '120px' }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-accent-blue to-accent-green
                             text-white rounded-xl font-medium transition-all
                             hover:shadow-lg hover:shadow-accent-blue/30
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                             flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Shift + Enter</kbd> for new line
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
