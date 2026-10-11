import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ArrowRight, 
  ArrowLeft, 
  Paperclip, 
  Send, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  CheckCheck, 
  Zap, 
  RotateCcw, 
  User, 
  FileText, 
  X 
} from 'lucide-react';
import './styles.css';

// Komponen Avatar Robot SVG (khusus avatar agar selalu tajam, presisi, dan tidak hilang)
function RobotAvatar({ size = 32 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="robot-avatar-svg"
      aria-label="Robot Avatar"
    >
      <defs>
        <linearGradient id="headGrad" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#dbe4ff" />
          <stop offset="100%" stopColor="#9aa5e4" />
        </linearGradient>
        <linearGradient id="faceGrad" x1="25" y1="30" x2="75" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#040c26" />
          <stop offset="100%" stopColor="#101844" />
        </linearGradient>
        <linearGradient id="earGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a73ed" />
          <stop offset="50%" stopColor="#5ae7ff" />
          <stop offset="100%" stopColor="#b6caff" />
        </linearGradient>
        <radialGradient id="orbGrad" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#6fe5ff" />
          <stop offset="100%" stopColor="#7165ff" />
        </radialGradient>
      </defs>

      {/* Antennas */}
      <line x1="38" y1="20" x2="32" y2="8" stroke="#bbc8ff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="7" r="6" fill="url(#orbGrad)" />
      
      <line x1="62" y1="20" x2="68" y2="8" stroke="#bbc8ff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="70" cy="7" r="6" fill="url(#orbGrad)" />

      {/* Ears */}
      <rect x="7" y="42" width="8" height="26" rx="4" fill="url(#earGrad)" />
      <rect x="85" y="42" width="8" height="26" rx="4" fill="url(#earGrad)" />

      {/* Head Shell */}
      <rect x="14" y="18" width="72" height="64" rx="30" fill="url(#headGrad)" stroke="#c5d1ff" strokeWidth="1.5" />

      {/* Face Screen */}
      <rect x="24" y="30" width="52" height="36" rx="14" fill="url(#faceGrad)" stroke="#7b92e8" strokeWidth="1.5" />

      {/* Eyes (Glowing cyan arcs) */}
      <path d="M 33 46 Q 38 40 43 46" stroke="#4deaff" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M 57 46 Q 62 40 67 46" stroke="#4deaff" strokeWidth="3.4" strokeLinecap="round" fill="none" />

      {/* Smile */}
      <path d="M 47 57 Q 50 60 53 57" stroke="#5b70b5" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Komponen Maskot Robot
function Robot({ size = 'normal' }) {
  if (size === 'small') {
    return <RobotAvatar size={34} />;
  }
  const isLarge = size === 'large';
  
  return (
    <div className={`robot ${isLarge ? 'robot-large' : ''}`} aria-label="Robot StudyMate Maskot">
      <div className="antenna antenna-left"><i /></div>
      <div className="antenna antenna-right"><i /></div>
      <div className="ear ear-left" />
      <div className="ear ear-right" />
      <div className="robot-head">
        <div className="face-screen">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="smile" />
        </div>
      </div>
      <div className="robot-body" />
      <div className="robot-arm arm-left" />
      <div className="robot-arm arm-right" />
      <div className="book">
        <div className="book-page left-page" />
        <div className="book-page right-page" />
        <div className="book-spine" />
        <div className="book-cap">
          <BookOpen size={isLarge ? 22 : 18} />
        </div>
      </div>
    </div>
  );
}

// Navigasi Utama Website
function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand" onClick={() => onNavigate('welcome')} role="button" tabIndex={0}>
          <div className="brand-logo-wrap">
            <Robot size="small" />
          </div>
          <div className="brand-info">
            <span className="brand-title">StudyMate <strong>AI</strong></span>
            <span className="brand-tag">Smart Study Companion</span>
          </div>
        </div>

        <nav className="nav-actions">
          {currentPage === 'chat' ? (
            <button className="nav-btn-outline" onClick={() => onNavigate('welcome')}>
              <ArrowLeft size={17} />
              <span>Kembali ke Beranda</span>
            </button>
          ) : (
            <button className="nav-btn-primary" onClick={() => onNavigate('chat')}>
              <Sparkles size={16} />
              <span>Buka Ruang Belajar</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

// Halaman 1: Landing / Welcome Page
function WelcomePage({ onStart }) {
  const features = [
    {
      icon: <Zap size={20} className="feature-icon" />,
      title: "Penjelasan Interaktif",
      desc: "Ubah materi rumit jadi analogi sederhana yang gampang dipahami dalam sekejap."
    },
    {
      icon: <GraduationCap size={20} className="feature-icon" />,
      title: "Bantu Tugas & Latihan",
      desc: "Dapatkan bimbingan langkah demi langkah untuk soal sains, matematika, hingga bahasa."
    },
    {
      icon: <Sparkles size={20} className="feature-icon" />,
      title: "Ringkasan Cepat",
      desc: "Rangkum bab pelajaran panjang menjadi poin-poin penting siap review ujian."
    }
  ];

  return (
    <div className="welcome-page">
      <div className="welcome-hero-grid">
        {/* Kolom Kiri: Teks & CTA */}
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>AI Study Buddy 2.0 • Selalu Siap 24/7</span>
          </div>
          
          <h1 className="hero-title">
            Your Personal <br />
            <span className="gradient-text">AI Study Buddy</span>
          </h1>
          
          <p className="hero-subtitle">
            Belajar apa pun jadi lebih seru dan mudah dipahami. Tanyakan konsep pelajaran, bedah soal yang sulit, atau diskusikan topik baru setiap hari.
          </p>

          <div className="hero-cta-group">
            <button className="start-btn-primary" onClick={onStart}>
              <span>Let's start learning</span>
              <ArrowRight size={20} />
            </button>
            <div className="hero-stats">
              <span className="status-dot-pulse" />
              <span>Siap menemani sesi belajarmu hari ini</span>
            </div>
          </div>

          <div className="features-preview">
            {features.map((item, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-card-header">
                  {item.icon}
                  <h4>{item.title}</h4>
                </div>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Mascot Stage */}
        <div className="hero-mascot-wrapper">
          <div className="mascot-cosmic-card">
            <div className="stage-glow-bg" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <i className="planet planet-one" />
            <i className="planet planet-two" />
            <i className="planet planet-three" />
            
            <div className="robot-mascot-container">
              <Robot size="large" />
            </div>

            <div className="mascot-card-badge">
              <BookOpen size={16} />
              <span>StudyMate siap membantu kapan saja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Halaman 2: Chat Web Interface
function ChatPage({ onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      time: 'Baru saja',
      text: 'Hai! 👋 Aku StudyMate, teman belajarmu. Materi apa yang ingin kamu pahami atau diskusikan hari ini?'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const streamEndRef = useRef(null);

  // ── Session & Document State ─────────────────────────────────────────────
  const [sessionId, setSessionId] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const actualFileRef = useRef(null); // menyimpan File object asli untuk upload

  const API = import.meta.env.VITE_API_BASE_URL || '/api';

  // ── Buat session baru saat ChatPage pertama kali mount ───────────────────
  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch(`${API}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const json = await res.json();
        if (json.success) {
          setSessionId(json.data.sessionId);
        }
      } catch (err) {
        console.error('[StudyMate] Gagal membuat session:', err);
      }
    };
    createSession();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    actualFileRef.current = file; // simpan File object asli
    setAttachedFile({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.name.split('.').pop().toUpperCase()
    });
  };

  const removeFile = () => {
    setAttachedFile(null);
    actualFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, attachedFile]);

  // ── Upload dokumen ke backend ─────────────────────────────────────────────
  const uploadDocument = async (file) => {
    const form = new FormData();
    form.append('file', file);
    if (sessionId) form.append('sessionId', sessionId);

    const res = await fetch(`${API}/documents`, {
      method: 'POST',
      body: form
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal mengupload dokumen');
    return json.data.documentId;
  };

  // ── Kirim pesan chat ke backend ──────────────────────────────────────────
  const sendChat = async (message, currentSessionId) => {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId: currentSessionId
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal mendapatkan respons AI');
    return json.data.reply;
  };

  // ── Tanya dokumen yang sudah diupload ────────────────────────────────────
  const askDocument = async (question, docId, currentSessionId) => {
    const res = await fetch(`${API}/documents/${docId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        sessionId: currentSessionId
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Gagal menganalisis dokumen');
    return json.data.answer;
  };

  // ── Handler utama kirim pesan ────────────────────────────────────────────
  const handleSend = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    const currentFile = attachedFile;
    const actualFile = actualFileRef.current;

    if (!text && !currentFile) return;

    const userMsg = {
      id: Date.now(),
      from: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text || (currentFile ? `Menganalisis dokumen: ${currentFile.name}` : ''),
      file: currentFile ? { ...currentFile } : null
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setAttachedFile(null);
    actualFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsTyping(true);

    try {
      let botResponse = '';

      if (actualFile) {
        // Ada file baru → upload dulu ke backend
        const newDocId = await uploadDocument(actualFile);
        setDocumentId(newDocId);

        if (text) {
          // Ada pertanyaan bersamaan dengan file → tanya langsung ke dokumen
          botResponse = await askDocument(text, newDocId, sessionId);
        } else {
          // Hanya upload tanpa pertanyaan → beri konfirmasi
          botResponse = `📄 Dokumen "${currentFile.name}" berhasil diupload!\n\nAku sudah membaca isinya. Kamu bisa langsung bertanya tentang dokumen ini, misalnya:\n• "Buat rangkuman dari dokumen ini"\n• "Jelaskan poin utama dari file ini"\n• "Buatkan soal latihan dari materi ini"`;
        }
      } else if (text && documentId) {
        // Ada dokumen yang sudah diupload sebelumnya → tanya ke dokumen
        botResponse = await askDocument(text, documentId, sessionId);
      } else {
        // Chat biasa ke AI tutor
        botResponse = await sendChat(text, sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: botResponse
        }
      ]);
    } catch (err) {
      console.error('[StudyMate] Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ Maaf, terjadi kesalahan: ${err.message}. Pastikan backend sudah berjalan di localhost:5000.`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Reset chat: buat session baru ────────────────────────────────────────
  const clearChat = async () => {
    removeFile();
    setDocumentId(null);

    // Buat session baru agar AI tidak ingat percakapan lama
    try {
      const res = await fetch(`${API}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const json = await res.json();
      if (json.success) setSessionId(json.data.sessionId);
    } catch (err) {
      console.error('[StudyMate] Gagal membuat session baru:', err);
    }

    setMessages([
      {
        id: Date.now(),
        from: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Obrolan telah dibersihkan. Sesi baru dimulai! Apa yang ingin kamu diskusikan berikutnya?'
      }
    ]);
  };

  return (
    <div className="chat-page-layout">
      {/* Main Chat Workspace */}
      <main className="chat-main-area">
        {/* Chat Top Bar */}
        <div className="chat-topbar">
          <div className="topbar-left">
            <button className="back-btn" onClick={onBack} title="Kembali ke Beranda">
              <ArrowLeft size={18} />
              <span>Beranda</span>
            </button>
            
            <div className="divider-vert" />

            <div className="chat-partner-info">
              <div className="partner-avatar">
                <Robot size="small" />
              </div>
              <div className="partner-details">
                <strong>StudyMate AI</strong>
                <span className="online-badge">
                  <i /> {sessionId ? 'Online • Siap Membantu Belajarmu' : 'Menghubungkan...'}
                </span>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <button className="reset-chat-btn" onClick={clearChat} title="Mulai Obrolan Baru">
              <RotateCcw size={15} />
              <span>Reset Chat</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="chat-stream-container">
          <div className="chat-stream-content">
            <div className="chat-welcome-banner">
              <div className="welcome-banner-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h3>Ruang Belajar Interaktif StudyMate AI</h3>
                <p>Tanyakan materi apa pun, minta dibuatkan contoh soal, atau diskusikan ringkasan materi ujianmu di sini.</p>
              </div>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-row ${msg.from}`}>
                {msg.from === 'bot' && (
                  <div className="chat-avatar-bot" title="StudyMate AI">
                    <Robot size="small" />
                  </div>
                )}
                
                <div className="chat-bubble-wrapper">
                  <div className="chat-bubble">
                    {msg.file && (
                      <div className="chat-attached-file-badge">
                        <div className="attached-file-icon">
                          <FileText size={18} />
                        </div>
                        <div className="attached-file-info">
                          <span className="attached-file-name">{msg.file.name}</span>
                          <span className="attached-file-meta">{msg.file.type} • {msg.file.size}</span>
                        </div>
                      </div>
                    )}
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="chat-meta">
                    <span>{msg.time}</span>
                    {msg.from === 'user' && <CheckCheck size={14} className="check-icon" />}
                  </div>
                </div>

                {msg.from === 'user' && (
                  <div className="chat-avatar-user" title="Kamu">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="chat-message-row bot">
                <div className="chat-avatar-bot">
                  <Robot size="small" />
                </div>
                <div className="chat-bubble-wrapper">
                  <div className="chat-bubble typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={streamEndRef} />
          </div>
        </div>

        {/* Input Composer */}
        <div className="chat-composer-wrapper">
          {/* File Attachment Preview Chip */}
          {attachedFile && (
            <div className="composer-file-preview">
              <div className="preview-chip">
                <FileText size={15} className="preview-chip-icon" />
                <div className="preview-chip-info">
                  <span className="preview-chip-name">{attachedFile.name}</span>
                  <span className="preview-chip-size">({attachedFile.size})</span>
                </div>
                <button 
                  type="button" 
                  className="preview-chip-remove" 
                  onClick={removeFile}
                  title="Hapus lampiran"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <form 
            className="chat-composer-form" 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            {/* Hidden File Input — hanya PDF dan TXT (sesuai kemampuan backend) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              style={{ display: 'none' }}
            />

            <div className="composer-input-container">
              <button 
                type="button" 
                className={`composer-btn-icon upload-btn ${attachedFile ? 'active-upload' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                title="Unggah dokumen (PDF, TXT)"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={attachedFile ? `Tambahkan pertanyaan atau instruksi untuk ${attachedFile.name}...` : "Tanyakan materi, atau unggah file dokumen pdf atau txt... (Tekan Enter)"}
                className="composer-input"
                disabled={isTyping}
              />
            </div>
            
            <button 
              type="submit" 
              className="composer-send-btn" 
              disabled={(!inputVal.trim() && !attachedFile) || isTyping}
              title="Kirim pesan"
            >
              <Send size={19} />
            </button>
          </form>
          <div className="composer-disclaimer">
            Mendukung file PDF dan TXT. StudyMate AI akan membaca materi dan siap membantumu belajar.
          </div>
        </div>
      </main>
    </div>
  );
}

// Komponen Utama Aplikasi
function App() {
  const [currentPage, setCurrentPage] = useState('welcome');

  return (
    <div className="web-app-container">
      {/* Background Ambient Glow */}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      {/* Top Navbar */}
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Halaman Berdasarkan State */}
      <div className="app-main-content">
        {currentPage === 'welcome' ? (
          <WelcomePage onStart={() => setCurrentPage('chat')} />
        ) : (
          <ChatPage onBack={() => setCurrentPage('welcome')} />
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
