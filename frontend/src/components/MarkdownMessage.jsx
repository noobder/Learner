import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, "");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="group relative my-3 min-w-0 max-w-full overflow-hidden rounded-xl bg-[#0f172a] text-slate-100">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-white/70 opacity-0 transition group-hover:opacity-100 hover:bg-white/20 hover:text-white"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="max-w-full overflow-x-auto px-4 py-3 text-[13px] leading-relaxed">
        <code>{text}</code>
      </pre>
    </div>
  );
}

const components = {
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 font-display text-lg font-bold text-brand-900 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 font-display text-base font-bold text-brand-900 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-1.5 font-display text-sm font-bold text-brand-800 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-2.5 leading-relaxed last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-brand-900">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2.5 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2.5 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-brand-600 underline decoration-brand-300 hover:text-brand-700"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2.5 border-l-4 border-brand-200 pl-3 text-brand-800/80">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-brand-100" />,
  table: ({ children }) => (
    <div className="my-3 max-w-full min-w-0 overflow-x-auto rounded-lg border border-brand-100">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-brand-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-brand-100 px-3 py-2 font-semibold text-brand-900">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-brand-50 px-3 py-2 align-top">{children}</td>,
  code: ({ children }) => (
    <code className="rounded bg-brand-100 px-1.5 py-0.5 text-[13px] font-medium text-brand-800">
      {children}
    </code>
  ),
  pre: ({ children }) => {
    // Block code (```...```) is always wrapped in <pre><code>; inline code never is.
    // Pull the raw text back out of the inner <code> element instead of double-rendering it.
    const codeText = children?.props?.children ?? children;
    return <CodeBlock>{codeText}</CodeBlock>;
  },
};

export default function MarkdownMessage({ content }) {
  return (
    <div className="min-w-0 max-w-full break-words text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
