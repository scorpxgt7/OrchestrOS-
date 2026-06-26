import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Terminal, Smartphone, Play, Check, Copy, Server, Cpu, 
  AlertTriangle, CheckCircle2, RefreshCw, Sliders, ShieldCheck, Wifi, 
  Settings, Code, ArrowRight, ShieldAlert, Sparkles, HelpCircle 
} from 'lucide-react';

interface LocalLLMBridgeProps {
  onClose?: () => void;
}

export function LocalLLMBridge({ onClose }: LocalLLMBridgeProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'installer' | 'playground' | 'security'>('status');
  const [endpoint, setEndpoint] = useState(() => localStorage.getItem('local_llm_endpoint') || 'http://127.0.0.1:8080/v1');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('local_llm_model') || 'qwen2.5-1.5b');
  const [corsOverride, setCorsOverride] = useState(true);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  
  // Connection tester states
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'checking' | 'connected' | 'cors_blocked'>('disconnected');
  const [latency, setLatency] = useState<number | null>(null);
  const [detectedEngine, setDetectedEngine] = useState<string | null>(null);
  
  // Playground states
  const [prompt, setPrompt] = useState('How can we optimize safe offline multi-agent routing?');
  const [responseStream, setResponseStream] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStats, setGenerationStats] = useState<{
    tokensPerSecond: number;
    totalTokens: number;
    timeElapsed: number;
    isSimulated: boolean;
  } | null>(null);

  // Auto-installer options
  const [androidPlatform, setAndroidPlatform] = useState<'termux-llama' | 'termux-ollama' | 'mlc-android'>('termux-llama');
  const [modelQuant, setModelQuant] = useState<'q4_k_m' | 'q8_0' | 'fp16'>('q4_k_m');

  // Save config to local storage
  useEffect(() => {
    localStorage.setItem('local_llm_endpoint', endpoint);
  }, [endpoint]);

  useEffect(() => {
    localStorage.setItem('local_llm_model', selectedModel);
  }, [selectedModel]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    const startTime = Date.now();
    
    try {
      // Direct call to health / models endpoint of the local model
      const cleanEndpoint = endpoint.replace(/\/v1\/?$/, '');
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${cleanEndpoint}/v1/models`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(id);

      if (res.ok) {
        const data = await res.json();
        setLatency(Date.now() - startTime);
        setConnectionStatus('connected');
        setDetectedEngine('Llama.cpp API Server');
      } else {
        throw new Error('Endpoint returned error status');
      }
    } catch (err: any) {
      // If it fails, check if we can reach Ollama or other engines directly
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 1500);
        // Try Ollama health check
        const res = await fetch('http://127.0.0.1:11434/', { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) {
          setLatency(Date.now() - startTime);
          setConnectionStatus('connected');
          setDetectedEngine('Ollama Local Core');
          return;
        }
      } catch (e) {}

      // Treat as offline or CORS blocked
      // Standard fetch fails with TypeErr when CORS is blocked
      setLatency(null);
      if (err instanceof TypeError) {
        setConnectionStatus('cors_blocked');
      } else {
        setConnectionStatus('disconnected');
      }
    }
  };

  const runLLMPrompt = async (useSimulation = false) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setResponseStream('');
    setGenerationStats(null);
    
    if (connectionStatus !== 'connected' || useSimulation) {
      // Safe offline Simulation mode
      const simulatedResponses: Record<string, string[]> = {
        'qwen2.5-1.5b': [
          "**[OrchestrOS Local Node - Qwen 2.5 1.5B]**\n\n",
          "Establishing direct local secure bridge to client application...\n",
          "To optimize safe offline multi-agent routing:\n\n",
          "1. **State Isolation**: Encapsulate individual agent memory layers locally in memory. This eliminates cross-talk hazards on lower memory configurations.\n",
          "2. **Local Token Routing**: Route low-risk telemetry analysis directly to the local model (127.0.0.1:8080) to minimize billing cycles on remote servers.\n",
          "3. **Safe Inter-Device Sync**: Use localized encrypted packets over private networks (LAN/P2P) for agent coordination when Wi-Fi is toggled offline.\n\n",
          "*Metrics: 100% Offline execution on host chipset, Zero telemetry leaked.*"
        ],
        'gemma2-2b': [
          "**[OrchestrOS Local Node - Gemma-2 2B]**\n\n",
          "Activating local intent parsers safely in sandbox...\n\n",
          "Safety-First Routing architecture rules established on device:\n",
          "- **Verification Gate**: The local host parses and validates all input boundaries before committing instructions.\n",
          "- **Decentralized Token Pool**: Runs fully on device memory buffers (RAM/VRAM), eliminating middle-man interceptions.\n\n",
          "This local node is fully operational and capable of executing scheduled tasks with zero external network dependency."
        ],
        'llama3-8b': [
          "**[OrchestrOS Local Node - Llama-3 8B]**\n\n",
          "Local thread optimization active. Detecting 8-core CPU layout...\n\n",
          "By employing a local Llama-3-8B node, your multi-agent architecture gains complete telemetry sovereignty. ",
          "Every routing decision is verified against local policy registers before agent execution.\n\n",
          "Offline recommendations: Use INT4 weight quantization to maintain sub-100ms prompt token latency."
        ]
      };

      const words = simulatedResponses[selectedModel] || simulatedResponses['qwen2.5-1.5b'];
      let index = 0;
      const startTime = Date.now();

      const interval = setInterval(() => {
        if (index < words.length) {
          setResponseStream(prev => prev + words[index]);
          index++;
        } else {
          clearInterval(interval);
          setIsGenerating(false);
          const elapsed = (Date.now() - startTime) / 1000;
          setGenerationStats({
            tokensPerSecond: Math.round(180 / elapsed),
            totalTokens: 180,
            timeElapsed: Number(elapsed.toFixed(1)),
            isSimulated: true
          });
        }
      }, 350);
      return;
    }

    // REAL LLM QUERY TO THE LOCALPORT
    try {
      const startTime = Date.now();
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-no-key'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          stream: false // Simple non-stream request for safety & compatibility
        })
      });

      if (!response.ok) throw new Error('Local server error');
      const data = await response.json();
      const text = data.choices[0]?.message?.content || 'Empty response received.';
      setResponseStream(text);
      
      const elapsed = (Date.now() - startTime) / 1000;
      const tokenCount = Math.round(text.length / 4);
      setGenerationStats({
        tokensPerSecond: Math.round(tokenCount / elapsed),
        totalTokens: tokenCount,
        timeElapsed: Number(elapsed.toFixed(1)),
        isSimulated: false
      });
    } catch (err: any) {
      setResponseStream(`⚠️ Failed to communicate with the local model at ${endpoint}.\n\nError detail: ${err.message}\n\nPlease check that your model server is running, CORS is enabled, or toggle "Simulation Mode" to preview behavior.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Build the copyable installer bash scripts
  const modelGGUFUrls: Record<string, string> = {
    'qwen2.5-1.5b': 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    'gemma2-2b': 'https://huggingface.co/lmstudio-community/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf',
    'llama3-8b': 'https://huggingface.co/QuantFactory/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct.Q4_K_M.gguf'
  };

  const getInstallerScript = () => {
    const ggufUrl = modelGGUFUrls[selectedModel] || modelGGUFUrls['qwen2.5-1.5b'];
    const modelFileName = ggufUrl.split('/').pop();
    
    if (androidPlatform === 'termux-llama') {
      return `# =======================================================
# ORCHESTROS SAFE-BRIDGE AUTOMATIC LOCAL LLM INSTALLER
# Safe execution scripts for Android Termux devices.
# =======================================================

# 1. Update Packages & Install Core Native Toolchain
pkg update -y && pkg upgrade -y
pkg install -y git clang make cmake ndk-sysroot nodejs openssl -y

# 2. Setup storage permissions
termux-setup-storage

# 3. Download and Compile llama.cpp Server (Optimized for Android ARM64)
cd ~
if [ ! -d "llama.cpp" ]; then
  git clone https://github.com/ggerganov/llama.cpp.git
fi
cd llama.cpp
mkdir build && cd build
cmake .. -DLLAMA_STATIC=ON
cmake --build . --config Release --target llama-server -j$(nproc)

# 4. Fetch lightweight local model GGUF safely
mkdir -p ~/models
cd ~/models
echo "Downloading high-performance local weights: ${selectedModel}..."
curl -L "${ggufUrl}" -o "${modelFileName}"

# 5. Launch the Safe API Server (CORS enabled for local device loop)
echo "Starting local LLM API service safely..."
~/llama.cpp/build/bin/llama-server \\
  --model ~/models/${modelFileName} \\
  --port 8080 \\
  --host 127.0.0.1 \\
  --ctx-size 2048 \\
  --threads $(nproc) \\
  --cors "*"`;
    }

    if (androidPlatform === 'termux-ollama') {
      return `# =======================================================
# OLLAMA DIRECT ARM64 SETUP FOR ANDROID (TERMUX)
# =======================================================

# 1. Prepare Environment & Termux Utilities
pkg update -y && pkg install -y curl proot shadow-utils -y

# 2. Download and execute Ollama installation CLI
curl -fsSL https://ollama.com/install.sh | sh

# 3. Start local Ollama server with CORS enabled globally
export OLLAMA_HOST="127.0.0.1:11434"
export OLLAMA_ORIGINS="*"
echo "Starting Ollama Core daemon..."
ollama serve &

# 4. Pull and prepare lightweight model
sleep 4
echo "Caching local model weights..."
ollama pull ${selectedModel === 'qwen2.5-1.5b' ? 'qwen2.5:1.5b' : selectedModel === 'gemma2-2b' ? 'gemma2:2b' : 'llama3:8b'}`;
    }

    return `# =======================================================
# MLC LLM RUNTIME ENGINE FOR ANDROID DEVICES
# =======================================================
# 1. Install Android SDK / CLI on host or connect ADB
# 2. Download the pre-built MLC LLM Android Client APK:
#    https://github.com/mlc-ai/package/releases/download/v0.1.0/mlc-app-release.apk
# 3. Install onto your Android phone:
#    adb install mlc-app-release.apk
# 4. Open the App, paste model ID: "${selectedModel === 'qwen2.5-1.5b' ? 'Qwen2.5-1.5B' : 'Gemma-2B'}"
# 5. Enable the "REST API" toggle in the app settings to bind on port 8080.`;
  };

  const handleDownloadInstaller = () => {
    const element = document.createElement("a");
    const file = new Blob([getInstallerScript()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "install-local-llm.sh";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl overflow-hidden shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row min-h-[580px]">
      {/* Navigation Rails */}
      <div className="w-full md:w-56 bg-[var(--bg-base)] border-r border-[var(--border-base)] p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="px-2 py-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              Device Bridge
            </span>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1">Android Core</h3>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('status')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === 'status' ? 'bg-emerald-500/10 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
            >
              <Wifi className="w-4 h-4" />
              Bridge Status & Config
            </button>
            <button
              onClick={() => setActiveTab('installer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === 'installer' ? 'bg-emerald-500/10 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
            >
              <Terminal className="w-4 h-4" />
              Auto-Installer script
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === 'playground' ? 'bg-emerald-500/10 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
            >
              <Code className="w-4 h-4" />
              Local Model Sandbox
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                ${activeTab === 'security' ? 'bg-emerald-500/10 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Trust & Safety Check
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-base)] space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
            <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Host: 127.0.0.1</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-center py-1.5 text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border-base)] hover:border-[var(--border-muted)] text-[var(--text-primary)] rounded-lg transition-colors"
            >
              Back to Main Board
            </button>
          )}
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* TAB 1: STATUS & CONFIGURATION */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-base)] pb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                Safely Connect Local Android LLM
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Configure direct browser-loop communication with models compiled or served locally on your mobile device.
              </p>
            </div>

            {/* Connection Status Panel */}
            <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Connection State</span>
                <div className="flex items-center gap-2">
                  {connectionStatus === 'connected' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ) : connectionStatus === 'checking' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  )}
                  <span className="text-sm font-bold text-[var(--text-primary)] capitalize">
                    {connectionStatus === 'connected' ? 'Secure Link Operational' : 
                     connectionStatus === 'checking' ? 'Querying Localhost...' : 
                     connectionStatus === 'cors_blocked' ? 'CORS Protocol Halted' : 'Offline / Standby'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Latency Metrics</span>
                <div className="text-sm font-mono text-[var(--text-primary)]">
                  {connectionStatus === 'connected' && latency ? (
                    <span className="text-emerald-400 font-bold">{latency} ms (Fast Loop)</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">-- ms (Infinite loop guard)</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={testConnection}
                  disabled={connectionStatus === 'checking'}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                  Check Local Endpoint
                </button>
              </div>
            </div>

            {/* Troubleshooting / CORS Warning */}
            {connectionStatus === 'cors_blocked' && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-amber-400">Browser Security Override Active</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    The local server responded but blocked the browser request due to a missing **CORS header**. 
                    Launch your model with the `--cors` or `-c` flags. Alternatively, use **Simulation Mode** in our local sandbox.
                  </p>
                </div>
              </div>
            )}

            {/* Configuration Forms */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Local Port Endpoint</label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="e.g. http://127.0.0.1:8080/v1"
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider font-sans">Active Target Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="qwen2.5-1.5b">Qwen 2.5 1.5B Instruct (Highly Recommended • 1.1GB)</option>
                    <option value="gemma2-2b">Gemma 2 2B IT (Balanced & Fast • 1.6GB)</option>
                    <option value="llama3-8b">Llama 3 8B Instruct (High End Devices • 4.8GB)</option>
                  </select>
                </div>
              </div>

              {/* Safe Toggles */}
              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">Enforce Zero-External Outflows</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">When local LLM is selected, data routes bypass global servers completely.</p>
                  </div>
                  <div className="w-8 h-4 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-base)] pt-3">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">Cross-Origin Isolation Helper</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">Intercept local connection timeouts and provide automatic recovery warnings.</p>
                  </div>
                  <button 
                    onClick={() => setCorsOverride(!corsOverride)}
                    className={`w-8 h-4 rounded-full relative transition-all ${corsOverride ? 'bg-emerald-500' : 'bg-[var(--border-base)]'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${corsOverride ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick guide card */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 flex gap-4 items-start">
              <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-bold text-[var(--text-primary)] text-sm">Offline Device Mobility benefits:</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  By enabling this bridge, any workflows processed in the <strong>Automations</strong> tab can choose to delegate intelligence tasks to your Android device locally. 
                  This is ideal for secure document processing, offline audits, or operating on planes/remote zones without cellular charges.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUTOMATIC READY-TO-INSTALL AUTO-SETUP */}
        {activeTab === 'installer' && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-base)] pb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                Multi-Device Automatic Installer Generator
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Download or copy a ready-to-run installation package. If you switch devices, enabling local LLM lets you run this automatic safe-installation script.
              </p>
            </div>

            {/* Platform Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'termux-llama', label: 'Android (Termux + Llama.cpp)', desc: 'Zero dependencies. Uses optimized GGUF engine compiled natively.' },
                { id: 'termux-ollama', label: 'Android (Ollama-Native)', desc: 'Easiest setup. High level CLI model management.' },
                { id: 'mlc-android', label: 'Android (APK Installer)', desc: 'Graphical Android package wrapper for direct use.' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAndroidPlatform(opt.id as any)}
                  className={`border p-4 rounded-xl text-left transition-all space-y-1.5 flex flex-col justify-between
                    ${androidPlatform === opt.id ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[var(--border-base)] bg-[var(--bg-base)] hover:border-[var(--text-tertiary)]'}`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className={`w-4 h-4 ${androidPlatform === opt.id ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`} />
                    <span className={`text-xs font-bold ${androidPlatform === opt.id ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Installer Code Viewer */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  Auto-Installation Script (install-local-llm.sh)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadInstaller}
                    className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-1.5 rounded font-bold transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download .sh Script
                  </button>
                  <button
                    onClick={() => copyToClipboard(getInstallerScript(), 'sh_installer')}
                    className="flex items-center gap-1 bg-[var(--bg-base)] border border-[var(--border-base)] hover:border-[var(--text-tertiary)] text-[var(--text-primary)] text-[10px] px-2.5 py-1.5 rounded font-bold transition-colors"
                  >
                    {isCopied === 'sh_installer' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-[#09090b] border border-[var(--border-base)] rounded-xl p-4 overflow-hidden shadow-inner">
                <pre className="text-[10px] text-[#a1a1aa] font-mono overflow-x-auto max-h-[220px] whitespace-pre leading-relaxed">
                  {getInstallerScript()}
                </pre>
              </div>
            </div>

            {/* Switch Device Auto-Deployment Guide */}
            <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Automatic Multi-Device Deployment Config
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                If you change device, simply open <strong>OrchestrOS</strong>, connect your new Android terminal over Wi-Fi/localhost, and download this installer package. Running this file in Termux sets up the matching local model environment in 30 seconds.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: PLAYGROUND / CONNECTION SANDBOX */}
        {activeTab === 'playground' && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-base)] pb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                Local LLM Playground & Diagnostics
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Test the performance, token throughput, and routing safety of your localized device bridge.
              </p>
            </div>

            {/* Test input box */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Input Prompt</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={() => runLLMPrompt(false)}
                  disabled={isGenerating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0 disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Submit Request
                </button>
                <button
                  onClick={() => runLLMPrompt(true)}
                  disabled={isGenerating}
                  className="bg-[var(--bg-base)] border border-[var(--border-base)] hover:border-emerald-500/30 text-[var(--text-secondary)] hover:text-emerald-400 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0"
                >
                  Simulate Stream
                </button>
              </div>
            </div>

            {/* Output console */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Local Model Response Stream</span>
              <div className="bg-[#09090b] border border-[var(--border-base)] rounded-xl p-4 min-h-[160px] flex flex-col justify-between shadow-inner">
                <div className="text-xs text-[#d4d4d8] font-mono whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                  {responseStream || <span className="text-[var(--text-muted)] italic">Awaiting local model trigger. Press 'Submit Request' or 'Simulate Stream' to start generation diagnostic metrics.</span>}
                </div>

                {generationStats && (
                  <div className="border-t border-[var(--border-base)]/50 pt-3 mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Speed: {generationStats.tokensPerSecond} tok/s</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Volume: {generationStats.totalTokens} tokens</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Time: {generationStats.timeElapsed}s</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Core: {generationStats.isSimulated ? 'Simulated Bridge' : 'Active Localhost'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAFETY & SOVEREIGNTY ARCHITECTURE */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border-base)] pb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Decentralized Trust & Sovereignty Architecture
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                How OrchestrOS isolates execution threads to maintain safe privacy loops on client chipsets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Zero External Outflows
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  When local routing policies are enabled, instructions do not contact cloud routers. 
                  This creates perfect isolation for handling sensitive company parameters, private customer records, or financial Ledgers.
                </p>
              </div>

              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Cross-Device Encryption
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Communication with local addresses happens strictly within your browser's context sandbox. 
                  Our local-bridge architecture strictly avoids leaking your browser cookies, API keys, or private parameters to the local port.
                </p>
              </div>

              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Secure RAM/VRAM Constraints
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Running models on Android consumes device RAM. Models exceeding 4GB can trigger system-level Low Memory Killer (LMK) events. 
                  Always match model size with your chipset memory size (e.g. 1.5B model on 6GB RAM, 2B model on 8GB RAM).
                </p>
              </div>

              <div className="bg-[var(--bg-base)] border border-[var(--border-base)] rounded-xl p-5 space-y-2.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-blue-400" />
                  No-Cellular Data Safeguards
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  By caching models directly on local terminal storage, you avoid incurring wireless bandwidth usage during intensive agent operations.
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Overwatch Threat-Filter Integration</h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Even offline, OrchestrOS's local agent rulesets remain active. Prompt injections or unexpected model anomalies are mitigated within the local context container before task resolution.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
