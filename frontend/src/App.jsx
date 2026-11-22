
import { useState } from "react";
import {
  Sparkles,
  ArrowUp,
  Globe,
  Zap,
  WandSparkles,
  GraduationCap,
  LoaderCircle,
  AlertCircle,
  Monitor,
} from "lucide-react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [generatedProvider, setGeneratedProvider] = useState("");
  const [error, setError] = useState("");

  // Uses the deployed API URL in production.
  // Falls back to localhost during local development.
  const API_URL = (
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const examples = [
    "Create a premium clothing brand website",
    "Build a modern restaurant landing page",
    "Create an AI startup landing page",
    "Design a professional gym website",
  ];

  // Generate website using FastAPI backend
  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError("");
    setGeneratedHTML("");
    setGeneratedProvider("");

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.detail === "string"
            ? data.detail
            : data.detail?.message || "Website generation failed.";

        throw new Error(message);
      }

      if (!data.html) {
        throw new Error("The AI returned an empty website.");
      }

      setGeneratedHTML(data.html);
      setGeneratedProvider(data.provider || "AI");
    } catch (err) {
      console.error("LaunchAI error:", err);

      setError(
        err.message ||
          "Could not connect to the backend. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-white">

      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-5 border-b border-white/10">

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Developed by
          </p>

          <h1 className="text-2xl font-extrabold">
            Afnan <span className="text-violet-400">Bhura</span>
          </h1>
        </div>

        <div className="flex items-center gap-5 text-sm text-gray-400">
          <a href="#features" className="hover:text-white">
            Features
          </a>

          <a href="#examples" className="hover:text-white">
            Examples
          </a>

          <div className="hidden sm:flex items-center gap-2 border border-violet-400/30 bg-violet-400/10 px-4 py-2 rounded-full text-violet-300">
            <GraduationCap size={16} />
            College Project
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="max-w-5xl mx-auto px-6 pt-24 md:pt-32 text-center">

        {/* Creator Identity */}
        <div className="mb-12">

          <p className="text-violet-300 text-sm md:text-base font-semibold tracking-[0.35em] mb-5">
            PRESENTED BY
          </p>

          <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-tight">
            AFNAN
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
              BHURA
            </span>
          </h2>

          <p className="text-gray-400 mt-5 text-lg">
            Introducing my project
          </p>

          <div className="w-24 h-1 bg-violet-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Product Identity */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300 text-sm mb-8">
          <Sparkles size={16} />
          AI-Powered Website Generation Platform
        </div>

        <h3 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Turn your ideas into
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            beautiful websites.
          </span>
        </h3>

        <p className="text-gray-400 text-base md:text-lg mt-7 max-w-2xl mx-auto leading-relaxed">
          Describe your vision in simple words. Let artificial
          intelligence transform your ideas into beautiful,
          professional and responsive landing pages.
        </p>

        {/* Prompt Generator */}
        <div className="mt-12 bg-[#15151f] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl text-left">

          <div className="flex items-center gap-2 mb-4 text-sm text-violet-300">
            <WandSparkles size={17} />
            Describe your website
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a premium coffee brand landing page with a dark theme, product showcase, pricing and contact section..."
            className="w-full h-36 bg-transparent outline-none resize-none text-base md:text-lg placeholder:text-gray-600"
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-white/10 pt-4">

            <span className="text-xs text-gray-500">
              Describe your idea. We'll handle the design.
            </span>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  Generate Website
                  <ArrowUp size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 text-center">
            <LoaderCircle
              size={32}
              className="animate-spin text-violet-400 mx-auto mb-4"
            />

            <p className="text-violet-300 font-semibold">
              LaunchAI is building your website...
            </p>

            <p className="text-gray-500 text-sm mt-2">
              AI is designing and writing your website.
              This may take a little time.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-left">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <AlertCircle size={20} />
              Generation Failed
            </div>

            <p className="text-red-300 text-sm mt-2">
              {error}
            </p>
          </div>
        )}

        {/* Example Prompts */}
        <div id="examples" className="mt-10">

          <p className="text-gray-500 text-sm mb-5">
            Need inspiration? Try these examples.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="border border-white/10 bg-white/5 hover:bg-violet-500/10 hover:border-violet-400/40 px-4 py-3 rounded-full text-sm text-gray-300 transition"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Website Preview */}
        {generatedHTML && (
          <section className="mt-20 pb-16 text-left">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

              <div>
                <div className="flex items-center gap-2 text-violet-300 mb-2">
                  <Monitor size={20} />
                  <span className="text-sm font-semibold">
                    YOUR GENERATED WEBSITE
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold">
                  Website Preview
                </h3>

                <p className="text-gray-500 text-sm mt-2">
                  Generated by LaunchAI using {generatedProvider}.
                </p>
              </div>

              <button
                onClick={() => {
                  setGeneratedHTML("");
                  setGeneratedProvider("");
                  setError("");
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="border border-violet-400/40 text-violet-300 hover:bg-violet-500/10 px-5 py-3 rounded-xl text-sm transition"
              >
                Create Another Website
              </button>
            </div>

            <div className="border border-violet-400/30 rounded-2xl overflow-hidden bg-white shadow-2xl">

              <div className="bg-[#15151f] px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>

                <span className="text-xs text-gray-400 ml-3">
                  LaunchAI Website Preview
                </span>
              </div>

              <iframe
                title="Generated Website Preview"
                srcDoc={generatedHTML}
                sandbox="allow-scripts"
                className="w-full h-[750px] bg-white"
              />
            </div>
          </section>
        )}

        {/* Features */}
        <section
          id="features"
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-28 pb-24"
        >

          <div className="bg-[#12121b] border border-white/10 rounded-2xl p-7">
            <WandSparkles
              className="mx-auto mb-4 text-violet-400"
              size={28}
            />

            <h4 className="font-semibold text-lg">
              AI Generation
            </h4>

            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Transform simple text prompts into professionally
              designed landing pages.
            </p>
          </div>

          <div className="bg-[#12121b] border border-white/10 rounded-2xl p-7">
            <Globe
              className="mx-auto mb-4 text-violet-400"
              size={28}
            />

            <h4 className="font-semibold text-lg">
              Responsive Design
            </h4>

            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Generate modern layouts for desktop,
              tablets and mobile devices.
            </p>
          </div>

          <div className="bg-[#12121b] border border-white/10 rounded-2xl p-7">
            <Zap
              className="mx-auto mb-4 text-violet-400"
              size={28}
            />

            <h4 className="font-semibold text-lg">
              Fast Creation
            </h4>

            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Reduce the time and effort needed to create
              attractive landing pages.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 md:px-12 py-8">

        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

          <div>
            <p className="font-bold text-xl">
              Launch<span className="text-violet-400">AI</span>
            </p>

            <p className="text-xs text-gray-500 mt-1">
              AI-Powered Landing Page Generator
            </p>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-sm text-gray-400">
              Designed & Developed by
            </p>

            <p className="text-lg font-bold text-violet-300 mt-1">
              Afnan Bhura
            </p>

            <p className="text-xs text-gray-600 mt-1">
              Academic Project · 2026
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
