import React, { useState, useRef, useEffect } from 'react';
import { 
  Youtube, Cpu, Layers, Lock, RefreshCw, Sliders, Database, Eye, Check, 
  CheckSquare, Square, ExternalLink, FileText, Video, Award, TrendingUp, 
  ThumbsUp, ChevronDown, ChevronUp, Send, Terminal, Activity, ArrowRight, 
  Shield, ShieldAlert, CheckCircle2, AlertTriangle, Play, X, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';

interface ToolDefinition {
  name: string;
  purpose: string;
  type: 'Read-Only' | 'Write / Protected';
  scope: string;
  params: { name: string; type: string; desc: string; defaultValue: string }[];
  mockResponse: any;
}

const YOUTUBE_TOOLS: ToolDefinition[] = [
  {
    name: "youtube_get_channel_stats",
    purpose: "Fetches overview metrics of the connected channel including subscribers, total views, and video counts.",
    type: "Read-Only",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    params: [
      { name: "part", type: "string", desc: "The properties to include in the stats response (e.g., statistics, snippet)", defaultValue: "statistics" }
    ],
    mockResponse: {
      kind: "youtube#channelListResponse",
      etag: "e7Xz9-RkWn6W-e-g-D8_9m3-r",
      items: [{
        kind: "youtube#channel",
        id: "UC_x5XG1OV2P6uYZ5Xq_m2A",
        snippet: {
          title: "SaaS Builders Lab",
          description: "Building production-ready software in public.",
          customUrl: "@saasbuilderslab",
          publishedAt: "2024-01-15T08:30:00Z"
        },
        statistics: {
          viewCount: "342500",
          subscriberCount: "14820",
          hiddenSubscriberCount: false,
          videoCount: "48"
        }
      }]
    }
  },
  {
    name: "youtube_list_videos",
    purpose: "Lists videos uploaded to the channel with optional sorting, filtering, and limit constraints.",
    type: "Read-Only",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    params: [
      { name: "maxResults", type: "number", desc: "Maximum number of items to return in the result set", defaultValue: "5" },
      { name: "chart", type: "string", desc: "The chart type to return (e.g., mostPopular)", defaultValue: "mostPopular" }
    ],
    mockResponse: {
      kind: "youtube#videoListResponse",
      etag: "Vz_1-L7X3-rkWn6W-pX_9m3",
      items: [
        { id: "v101", snippet: { title: "How We Scaled Our Database to 1M Users", publishedAt: "2026-06-10T12:00:00Z" }, statistics: { viewCount: "45000", likeCount: "2340", commentCount: "389" } },
        { id: "v102", snippet: { title: "Local LLMs with llama.cpp: The Complete Guide", publishedAt: "2026-06-05T15:30:00Z" }, statistics: { viewCount: "82100", likeCount: "5120", commentCount: "642" } },
        { id: "v103", snippet: { title: "Building a Production Model Context Protocol (MCP) Server", publishedAt: "2026-05-28T14:15:00Z" }, statistics: { viewCount: "29800", likeCount: "1850", commentCount: "254" } }
      ]
    }
  },
  {
    name: "youtube_get_video_stats",
    purpose: "Retrieves granular performance metrics, likes, retention summaries, and watch times for a specific video.",
    type: "Read-Only",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    params: [
      { name: "videoId", type: "string", desc: "The unique YouTube ID of the video to query statistics for", defaultValue: "v102" }
    ],
    mockResponse: {
      kind: "youtube#videoStatsResponse",
      items: [{
        id: "v102",
        title: "Local LLMs with llama.cpp: The Complete Guide",
        metrics: {
          views: "82100",
          likes: "5120",
          dislikes: "24",
          comments: "642",
          averageViewDuration: "14m 32s",
          retentionRate: "64.2%"
        }
      }]
    }
  },
  {
    name: "youtube_list_comments",
    purpose: "Polls comment threads on channel videos to evaluate viewer feedback, sentiment, and complaints.",
    type: "Read-Only",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    params: [
      { name: "maxResults", type: "number", desc: "The maximum number of comment threads to retrieve", defaultValue: "10" },
      { name: "order", type: "string", desc: "Sorting order (e.g. time, relevance)", defaultValue: "relevance" }
    ],
    mockResponse: {
      kind: "youtube#commentThreadListResponse",
      items: [
        { id: "c1", snippet: { topLevelComment: { snippet: { authorDisplayName: "DevAlex", textDisplay: "This tutorial was awesome! However, the audio on the left channel is a bit low in the middle.", videoId: "v102" } } } },
        { id: "c2", snippet: { topLevelComment: { snippet: { authorDisplayName: "SarahK", textDisplay: "Does this MCP server architecture support streaming responses? Highly interested in trying it out.", videoId: "v103" } } } },
        { id: "c3", snippet: { topLevelComment: { snippet: { authorDisplayName: "TechGeek", textDisplay: "Amazing guide. Subscribed!", videoId: "v101" } } } }
      ]
    }
  },
  {
    name: "youtube_draft_comment_replies",
    purpose: "Uses the Local LLM to analyze comment context and draft contextual, helpful response recommendations.",
    type: "Read-Only",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    params: [
      { name: "commentId", type: "string", desc: "The ID of the comment to reply to", defaultValue: "c1" },
      { name: "tone", type: "string", desc: "Vibe of the response (e.g., helpful, tech-focused, professional)", defaultValue: "helpful" }
    ],
    mockResponse: {
      success: true,
      commentId: "c1",
      author: "DevAlex",
      originalComment: "This tutorial was awesome! However, the audio on the left channel is a bit low in the middle.",
      suggestedReply: "Thanks so much for pointing that out, Alex! I will check the master stereo channel mix and ensure our future videos maintain balanced leveling. Appreciate your support!"
    }
  },
  {
    name: "youtube_reply_to_comment",
    purpose: "Publishes an approved comment reply directly to YouTube. REQUIRES manual OAuth gate signature.",
    type: "Write / Protected",
    scope: "https://www.googleapis.com/auth/youtube.force-ssl",
    params: [
      { name: "commentId", type: "string", desc: "The ID of the parent comment to reply to", defaultValue: "c1" },
      { name: "text", type: "string", desc: "The plain-text content of the response to post", defaultValue: "Thank you for the support!" }
    ],
    mockResponse: {
      kind: "youtube#commentReply",
      id: "cr_987213",
      snippet: {
        parentId: "c1",
        textDisplay: "Thanks so much for pointing that out, Alex! I will check the master stereo channel mix and ensure our future videos maintain balanced leveling. Appreciate your support!",
        authorDisplayName: "SaaS Builders Lab (Channel Owner)",
        publishedAt: "2026-06-25T15:45:00Z"
      }
    }
  },
  {
    name: "youtube_update_video_metadata",
    purpose: "Updates the title, description, tags, or playlist configuration of a video. REQUIRES manual OAuth gate signature.",
    type: "Write / Protected",
    scope: "https://www.googleapis.com/auth/youtube.force-ssl",
    params: [
      { name: "videoId", type: "string", desc: "The ID of the video to update", defaultValue: "v102" },
      { name: "title", type: "string", desc: "The optimized title to set", defaultValue: "Local LLMs with llama.cpp: Run 7B Models Offline (2026 Guide)" }
    ],
    mockResponse: {
      kind: "youtube#videoUpdateResponse",
      id: "v102",
      snippet: {
        title: "Local LLMs with llama.cpp: Run 7B Models Offline (2026 Guide)",
        description: "Optimized description with updated MCP and llama.cpp configurations.",
        tags: ["llama.cpp", "local llm", "mcp", "google-genai"]
      }
    }
  },
  {
    name: "youtube_upload_video",
    purpose: "Initiates video file streaming to YouTube server as draft or public video. REQUIRES manual OAuth gate signature.",
    type: "Write / Protected",
    scope: "https://www.googleapis.com/auth/youtube.force-ssl",
    params: [
      { name: "title", type: "string", desc: "The title of the video", defaultValue: "New Project Showcase" },
      { name: "privacyStatus", type: "string", desc: "The video privacy (private, public, unlisted)", defaultValue: "unlisted" }
    ],
    mockResponse: {
      kind: "youtube#video",
      id: "v104",
      status: {
        uploadStatus: "uploaded",
        privacyStatus: "unlisted",
        license: "youtube"
      }
    }
  },
  {
    name: "youtube_schedule_video",
    purpose: "Sets or updates the publication schedule for a draft video. REQUIRES manual OAuth gate signature.",
    type: "Write / Protected",
    scope: "https://www.googleapis.com/auth/youtube.force-ssl",
    params: [
      { name: "videoId", type: "string", desc: "Video ID to schedule", defaultValue: "v104" },
      { name: "publishAt", type: "string", desc: "ISO 8601 timestamp representing the future publish date/time", defaultValue: "2026-07-01T18:00:00Z" }
    ],
    mockResponse: {
      success: true,
      videoId: "v104",
      publishAt: "2026-07-01T18:00:00Z",
      status: "scheduled"
    }
  },
  {
    name: "youtube_generate_report",
    purpose: "Compiles aggregate video performance metrics and audience retention stats into a comprehensive performance report.",
    type: "Read-Only",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    params: [
      { name: "days", type: "number", desc: "The time range duration in days for the compiled analytics", defaultValue: "30" }
    ],
    mockResponse: {
      reportId: "rep_832190",
      generatedAt: "2026-06-25T15:50:00Z",
      daysRange: 30,
      summary: {
        totalNewViews: "156900",
        subscriberGrowth: "+890",
        topVideo: "v102",
        engagementRate: "8.4%"
      }
    }
  }
];

interface ApprovalItem {
  id: string;
  type: 'reply' | 'metadata' | 'schedule';
  title: string;
  desc: string;
  details: string;
  toolToExecute: string;
  params: any;
  status: 'pending' | 'approved' | 'rejected';
}

export function YouTubeAutomationComponent() {
  const { showToast } = useToast();
  const [selectedTool, setSelectedTool] = useState<ToolDefinition>(YOUTUBE_TOOLS[0]);
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTestingTool, setIsTestingTool] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'gemma'; content: string; steps?: string[] }[]>([
    {
      sender: 'gemma',
      content: "Hello! I am your local Gemma (7B) assistant connected via Model Context Protocol (MCP) to your secure YouTube server. Type a request or select a tool definition above to test our offline-first YouTube management architecture."
    }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  
  // High-fidelity Human-in-the-loop approval queue state
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: "app-1",
      type: "reply",
      title: "Publish Comment Reply",
      desc: "Replying to DevAlex about left-audio balance issues in 'Local LLMs with llama.cpp'",
      details: "Thanks so much for pointing that out, Alex! I will check the master stereo channel mix and ensure our future videos maintain balanced leveling. Appreciate your support!",
      toolToExecute: "youtube_reply_to_comment",
      params: { commentId: "c1", text: "Thanks so much for pointing that out, Alex! I will check the master stereo channel mix..." },
      status: 'pending'
    },
    {
      id: "app-2",
      type: "metadata",
      title: "Optimize Video Title",
      desc: "Updating the title of 'v102' to enhance click-through rates.",
      details: "Local LLMs with llama.cpp: Run 7B Models Offline (2026 Guide)",
      toolToExecute: "youtube_update_video_metadata",
      params: { videoId: "v102", title: "Local LLMs with llama.cpp: Run 7B Models Offline (2026 Guide)" },
      status: 'pending'
    }
  ]);

  const [activeMcpStats, setActiveMcpStats] = useState({
    totalCalls: 34,
    readOnlyCount: 28,
    writeGatedCount: 6,
    mcpLatency: "82ms",
    quotaRemaining: "9,965 / 10,000 units"
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Populate default params for testing
    const defaults: Record<string, string> = {};
    selectedTool.params.forEach(p => {
      defaults[p.name] = p.defaultValue;
    });
    setTestInputs(defaults);
  }, [selectedTool]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalOutput]);

  const handleTestTool = () => {
    setIsTestingTool(true);
    const timestamp = new Date().toLocaleTimeString();
    
    // Add initiating logs to terminal
    setTerminalOutput(prev => [
      ...prev,
      `[${timestamp}] ─── INITIATING TOOL CLIENT REQUEST ───`,
      `[${timestamp}] [MCP Client] Resolving endpoint to secure Local Tool Server...`,
      `[${timestamp}] [MCP Protocol] Preparing JSON-RPC 2.0 schema for method "${selectedTool.name}"...`,
      `[${timestamp}] [MCP Core] Parameters: ${JSON.stringify(testInputs)}`
    ]);

    setTimeout(() => {
      const finishTime = new Date().toLocaleTimeString();
      const mockResultString = JSON.stringify(selectedTool.mockResponse, null, 2);
      
      // Update stats
      setActiveMcpStats(prev => ({
        ...prev,
        totalCalls: prev.totalCalls + 1,
        readOnlyCount: selectedTool.type === 'Read-Only' ? prev.readOnlyCount + 1 : prev.readOnlyCount,
        writeGatedCount: selectedTool.type === 'Write / Protected' ? prev.writeGatedCount + 1 : prev.writeGatedCount
      }));

      setTerminalOutput(prev => [
        ...prev,
        `[${finishTime}] [MCP Host] Request authorized under OAuth boundary.`,
        `[${finishTime}] [MCP Server] Directing query to YouTube Data API v3...`,
        `[${finishTime}] [YouTube API] Status 200 OK (380 bytes, resolved in 142ms)`,
        `[${finishTime}] [MCP Output] Response payload received successfully:`,
        mockResultString,
        `[${finishTime}] ─── EXECUTION FINISHED ───\n`
      ]);
      
      setIsTestingTool(false);
      showToast(`MCP execution of "${selectedTool.name}" completed!`, "success");
    }, 1200);
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    const userMsg = customPrompt;
    setChatLog(prev => [...prev, { sender: 'user', content: userMsg }]);
    setCustomPrompt('');
    setIsChatTyping(true);

    // Simulate Agent Chain of Thought
    setTimeout(() => {
      let gemmaResponse = "";
      let steps: string[] = [];

      if (userMsg.toLowerCase().includes("comment") || userMsg.toLowerCase().includes("reply")) {
        steps = [
          "Thought: The user wants to analyze YouTube comments and prepare response drafts.",
          "MCP Call: Invoking 'youtube_list_comments(maxResults=5)' to inspect incoming discussions...",
          "MCP Output: Received list of comments. Analyzing sentiment...",
          "Thought: Flagged 1 complaint regarding audio balance in 'v102'. Draft response recommended.",
          "MCP Call: Invoking 'youtube_draft_comment_replies(commentId=\"c1\", tone=\"helpful\")'...",
          "MCP Output: Suggestion drafted. Storing in queue."
        ];
        gemmaResponse = "I have fetched your recent video comments via the MCP server and found 1 comment from @DevAlex raising audio balancing issues on video v102. I've drafted a polite, helpful response and queued it in the human manual signature board below for your review before posting.";
        
        // Add a mock item to approval list
        const newItem: ApprovalItem = {
          id: `app-${Date.now()}`,
          type: "reply",
          title: "Publish Comment Reply",
          desc: "Replying to @DevAlex regarding audio levels on 'Local LLMs'",
          details: "Hey Alex! Thanks for noting the left channel balance. I've tweaked the stereos for future uploads. Cheers!",
          toolToExecute: "youtube_reply_to_comment",
          params: { commentId: "c1", text: "Hey Alex! Thanks for noting the left channel balance..." },
          status: 'pending'
        };
        setApprovals(prev => [newItem, ...prev]);
      } else if (userMsg.toLowerCase().includes("optimize") || userMsg.toLowerCase().includes("title") || userMsg.toLowerCase().includes("metadata")) {
        steps = [
          "Thought: The user wants to optimize video metadata to boost organic CTR.",
          "MCP Call: Invoking 'youtube_get_video_stats(videoId=\"v102\")' to inspect retention rate...",
          "MCP Output: Video retention is 64.2%. Performance is high but click rate has flatlined.",
          "Thought: Formulating eye-catching title matching Gemma training weights...",
          "Draft Proposed: 'Local LLMs with llama.cpp: Run 7B Models Offline (2026 Guide)'"
        ];
        gemmaResponse = "I analyzed 'Local LLMs with llama.cpp' retention metrics. While viewer engagement is stellar (64.2%), CTR dropped. I suggest updating the title to 'Local LLMs with llama.cpp: Run 7B Models Offline (2026 Guide)' and have queued this title change in your Approval board.";
      } else {
        steps = [
          "Thought: The user provided custom parameters. Analyzing query guidelines.",
          "MCP Call: Invoking 'youtube_get_channel_stats(part=\"statistics\")' to check system state...",
          "MCP Output: Stats received. SaaS Builders Lab currently has 14,820 subscribers.",
          "Thought: Drafting comprehensive, general channel summary for user request."
        ];
        gemmaResponse = `I have queried your channel stats using our MCP server. You currently have 14,820 active subscribers (+890 this month) across 48 published videos. Let me know if you would like me to compile a specific weekly digest or schedule any uploads!`;
      }

      setChatLog(prev => [...prev, { sender: 'gemma', content: gemmaResponse, steps }]);
      setIsChatTyping(false);
      showToast("Gemma local model finished execution loop", "info");
    }, 2000);
  };

  const handleApprove = (id: string, tool: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    showToast(`OAuth signature signed! Executing write-action tool "${tool}"`, "success");
    
    // Simulate logging execution to terminal
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [
      ...prev,
      `[${timestamp}] ─── SECURE OAUTH APPROVAL GATE REACHED ───`,
      `[${timestamp}] [Gate] User authenticated via Google OAuth with required scopes.`,
      `[${timestamp}] [MCP Client] Forwarding certified manual signature for node "${id}"...`,
      `[${timestamp}] [YouTube API] Executed write payload securely on behalf of Channel Owner. Status 200 SUCCESS.`,
      `[${timestamp}] ──────────────────────────────────────\n`
    ]);
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
    showToast("Action rejected. Closed write pipeline.", "info");
  };

  return (
    <div id="youtube-mcp-studio" className="space-y-6 md:space-y-8 pb-12">
      {/* Visual Identity Header */}
      <div className="bg-gradient-to-r from-red-600/10 via-red-950/20 to-[var(--bg-surface)] border border-red-500/10 rounded-2xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 p-6 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
          <Youtube className="w-48 h-48 text-red-500" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
                <Youtube className="w-3.5 h-3.5" />
                YouTube Channel Automator
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
              <span className="text-xs text-[var(--text-muted)] font-mono">v1.2-mcp-live</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Local LLM & Model Context Protocol (MCP) Control Center</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Experience the absolute privacy of local intelligence paired with standardized tool execution. Model boundaries remain strictly within your device, relying on secure manual OAuth approval gates for all write operations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[var(--bg-base)] border border-[var(--border-base)] px-4 py-3 rounded-xl shadow-inner text-center">
              <span className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Local LLM</span>
              <span className="text-xs font-mono font-bold text-purple-400">Gemma-7B-it</span>
            </div>
            <div className="bg-[var(--bg-base)] border border-[var(--border-base)] px-4 py-3 rounded-xl shadow-inner text-center">
              <span className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Secure Host</span>
              <span className="text-xs font-mono font-bold text-rose-400">MCP (Localhost)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: Architecture Overview & Tool list */}
        <div className="xl:col-span-1 space-y-6">
          {/* Architecture Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-2 border-b border-[var(--border-base)] pb-3">
              <Layers className="w-4 h-4 text-rose-500" />
              Standardized MCP Architecture
            </h4>
            
            {/* Visual Node Flow chart in miniature */}
            <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border-base)] space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">Gemma 7B (Brain)</span>
                </div>
                <span className="text-[10px] text-purple-400 font-mono bg-purple-500/5 border border-purple-500/10 px-1.5 py-0.5 rounded">Local</span>
              </div>
              
              <div className="flex justify-center py-1">
                <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] rotate-90" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">MCP Server</span>
                </div>
                <span className="text-[10px] text-rose-400 font-mono bg-rose-500/5 border border-rose-500/10 px-1.5 py-0.5 rounded">Secure Core</span>
              </div>

              <div className="flex justify-center py-1">
                <div className="relative flex items-center justify-center w-full">
                  <div className="w-full h-px border-t border-dashed border-[var(--border-base)]"></div>
                  <div className="absolute px-2.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-full text-[9px] font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    OAuth Manual Signature Gate
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded">
                    <Youtube className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">YouTube API API v3</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">HTTPS</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              The Model Context Protocol (MCP) defines a unified standard for AI models to request actions from safe, external tool repositories. Your private credentials never leave the localhost server boundaries.
            </p>
          </div>

          {/* MCP Tools Catalog Accordion style */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 space-y-4 flex-1">
            <div>
              <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest flex items-center justify-between">
                <span>YouTube MCP Tools Catalog</span>
                <span className="text-[10px] font-mono font-normal text-rose-400 bg-rose-500/5 border border-rose-500/15 px-2 py-0.5 rounded-full">
                  10 Tools Declared
                </span>
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">Select a standardized tool definition to configure test parameters and preview payload schemas.</p>
            </div>

            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {YOUTUBE_TOOLS.map(t => {
                const isSelected = selectedTool.name === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTool(t)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all relative ${isSelected ? 'border-red-500/50 bg-red-500/5 shadow-sm' : 'border-[var(--border-base)] hover:border-[var(--text-tertiary)] bg-[var(--bg-base)]/50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono font-semibold ${isSelected ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                        {t.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.25 rounded font-medium border ${t.type === 'Read-Only' ? 'text-blue-400 bg-blue-500/5 border-blue-500/15' : 'text-amber-400 bg-amber-500/5 border-amber-500/15'}`}>
                        {t.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {t.purpose}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle column: Model Prompt playbox & Manual signature list */}
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          
          {/* Top of middle: Split prompt playbox & parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Playbox: Talk to Local LLM with MCP tool calls */}
            <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 flex flex-col h-[480px]">
              <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Local Gemma Model Playbox</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold tracking-widest uppercase">
                  llama.cpp Live
                </span>
              </div>

              {/* Chat log section */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs mb-4 scrollbar-thin">
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`space-y-2 ${msg.sender === 'user' ? 'text-right pl-12' : 'text-left pr-12'}`}>
                    <div className={`inline-block p-3.5 rounded-xl leading-relaxed text-left ${msg.sender === 'user' ? 'bg-blue-600/15 text-blue-300 border border-blue-500/20 rounded-tr-none' : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-base)] rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="text-[10px] text-left font-mono bg-black/40 border border-[var(--border-base)] rounded-lg p-3 space-y-1 mt-1 leading-relaxed">
                        <div className="text-[9px] uppercase tracking-wider text-purple-400 font-bold mb-1.5 flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-purple-400 animate-pulse" />
                          Local execution telemetry:
                        </div>
                        {msg.steps.map((st, sIdx) => (
                          <div key={sIdx} className={st.includes("Call:") ? "text-yellow-400/90" : st.includes("Output:") ? "text-emerald-400/90" : "text-[var(--text-tertiary)]"}>
                            {st}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isChatTyping && (
                  <div className="text-left pr-12 space-y-2">
                    <div className="inline-block bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-base)] rounded-xl rounded-tl-none p-3">
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendPrompt} className="relative shrink-0">
                <input 
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Request action (e.g. 'draft a response to comments' or 'optimize video title')..."
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] focus:border-blue-500/50 rounded-xl pl-4 pr-12 py-3.5 text-xs text-[var(--text-primary)] focus:outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Right: Parameter Testing & Terminal */}
            <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 flex flex-col h-[480px]">
              <div className="flex items-center gap-2 border-b border-[var(--border-base)] pb-3 mb-4 shrink-0">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Tool Emulator Settings</span>
              </div>

              {/* Tool Parameters edit */}
              <div className="space-y-3.5 mb-4 overflow-y-auto flex-1 pr-1">
                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-base)] rounded-lg">
                  <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Target tool method</div>
                  <div className="font-mono text-xs font-semibold text-rose-400 break-all">{selectedTool.name}</div>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Method Inputs (JSON Params)</div>
                  {selectedTool.params.map(p => (
                    <div key={p.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-semibold text-[var(--text-primary)]">{p.name}</span>
                        <span className="text-[var(--text-tertiary)] font-mono">({p.type})</span>
                      </div>
                      <input 
                        type="text" 
                        value={testInputs[p.name] || ''}
                        onChange={(e) => setTestInputs(prev => ({ ...prev, [p.name]: e.target.value }))}
                        className="w-full bg-[var(--bg-base)] border border-[var(--border-base)] focus:border-red-500/50 rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none transition-colors"
                      />
                      <div className="text-[10px] text-[var(--text-muted)] italic leading-relaxed">{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execute Tool CTA */}
              <button
                onClick={handleTestTool}
                disabled={isTestingTool}
                className="w-full shrink-0 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/40 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/10"
              >
                {isTestingTool ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing via Localhost MCP...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Tool on MCP Host
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Bottom of middle: Real-time Terminal Log & Human OAuth Approval Gate */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* Terminal console output */}
            <div className="lg:col-span-6 bg-black border border-[var(--border-base)] rounded-xl p-4 flex flex-col h-[340px] shadow-2xl relative overflow-hidden">
              <div className="absolute right-3 top-3 opacity-15 pointer-events-none">
                <Terminal className="w-16 h-16 text-rose-500" />
              </div>
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">MCP Server Terminal Console</span>
                </div>
                <button 
                  onClick={() => setTerminalOutput([])}
                  className="text-[9px] hover:text-white text-zinc-500 underline font-mono transition-colors"
                >
                  Clear Console
                </button>
              </div>

              {/* Log stream */}
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-zinc-300 space-y-2 pr-1 select-text selection:bg-rose-500/30">
                {terminalOutput.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
                    <Terminal className="w-8 h-8 text-zinc-700 mb-2" />
                    <p>No active MCP sessions logs.</p>
                    <p className="text-[9px] mt-1 text-zinc-600">Trigger a tool call to view real-time RPC messages.</p>
                  </div>
                ) : (
                  terminalOutput.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-relaxed border-l border-zinc-800 pl-2">
                      {log}
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>

            {/* Secure Manual OAuth Signature Gate */}
            <div className="lg:col-span-6 bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-xl p-5 flex flex-col h-[340px] shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">OAuth human-in-the-loop gate</span>
                </div>
                <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase tracking-widest">
                  WRITE GATED
                </span>
              </div>

              {/* Items queue list */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {approvals.filter(a => a.status === 'pending').length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-tertiary)] py-8">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400/50 mb-2" />
                    <p className="text-xs font-semibold text-[var(--text-primary)]">Write Pipeline Clear</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 max-w-xs">No pending write actions are awaiting OAuth manual signature. Autonomous read logs are tracking cleanly.</p>
                  </div>
                ) : (
                  approvals.map(item => (
                    <div key={item.id} className={`p-4 bg-[var(--bg-base)] border rounded-xl space-y-3 transition-all ${item.status === 'pending' ? 'border-amber-500/30' : 'opacity-40'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold">
                            OAuth Scope: YouTube.force-ssl
                          </span>
                          <h5 className="text-xs font-bold text-[var(--text-primary)] mt-1.5">{item.title}</h5>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="p-2.5 bg-zinc-950 border border-[var(--border-base)] rounded-lg font-mono text-[10px] text-zinc-300 break-all leading-normal">
                        {item.details}
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex items-center gap-2 justify-end pt-1">
                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] hover:text-rose-400 border border-[var(--border-base)] hover:border-rose-500/20 rounded-lg transition-colors bg-[var(--bg-surface)]"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(item.id, item.toolToExecute)}
                            className="px-3.5 py-1.5 text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-md shadow-emerald-600/10 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Sign & Post via YouTube API
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
