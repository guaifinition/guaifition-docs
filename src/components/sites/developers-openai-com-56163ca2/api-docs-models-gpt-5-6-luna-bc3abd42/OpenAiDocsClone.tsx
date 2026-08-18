"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  FileImage,
  FileText,
  Lightbulb,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const assetRoot = "/sites/developers-openai-com-56163ca2/api-docs-models-gpt-5-6-luna-bc3abd42";
const apiSections = ["Overview", "Models", "Agents", "Tools", "Voice & Audio", "Production", "API reference"];
const sidebarGroups = [
  { title: "", links: ["Model catalog"] },
  { title: "Choose a model", links: ["Pricing", "Model selection"] },
  { title: "Text and code", links: ["Text generation", "Code generation", "Structured output"] },
  { title: "Prompting", links: ["Overview", "Prompt engineering", "Citation formatting", "Migration guide", "Prompt generation", "Frontend prompting"] },
  { title: "Reasoning", links: ["Reasoning models", "Reasoning best practices"] },
  { title: "Images and video", links: ["Images and vision", "Image generation", "Video generation"] },
  { title: "Realtime and audio", links: ["Audio and speech", "Overview", "Voice agents"] },
  { title: "Specialized models", links: ["Deep research", "Embeddings", "Moderation"] },
];
const suggestions = ["responses create", "reasoning_effort", "realtime", "prompt caching"];
const endpoints = [
  ["Chat Completions", "v1/chat/completions"], ["Responses", "v1/responses"], ["Realtime", "v1/realtime"],
  ["Realtime translation", "v1/realtime/translations"], ["Realtime transcription", "v1/realtime/transcription_sessions"],
  ["Assistants", "v1/assistants"], ["Batch", "v1/batch"], ["Fine-tuning", "v1/fine-tuning"], ["Embeddings", "v1/embeddings"],
  ["Image generation", "v1/images/generations"], ["Videos", "v1/videos"], ["Image edit", "v1/images/edits"],
  ["Speech generation", "v1/audio/speech"], ["Transcription", "v1/audio/transcriptions"], ["Translation", "v1/audio/translations"],
  ["Moderation", "v1/moderations"], ["Completions (legacy)", "v1/completions"],
];
const tools = ["Web search", "File search", "Image generation", "Code interpreter", "Hosted shell", "Apply patch", "Skills", "Computer use", "MCP", "Tool search"];
const rateLimits = [["Free", "Not supported", "", ""], ["Tier 1", "500", "500,000", "5,000,000"], ["Tier 2", "5,000", "2,000,000", "20,000,000"], ["Tier 3", "5,000", "4,000,000", "40,000,000"], ["Tier 4", "10,000", "10,000,000", "1,000,000,000"], ["Tier 5", "30,000", "180,000,000", "15,000,000,000"]];

function QuietLink({ href = "#", children, onClick }: { href?: string; children: ReactNode; onClick?: () => void }) {
  return <a className="quiet-link" href={href} onClick={onClick}>{children}</a>;
}

function Header({ onSearch, onMenu, onTheme }: { onSearch: () => void; onMenu: () => void; onTheme: () => void }) {
  return <header className="site-header"><div className="header-inner">
    <a href="#top" className="brand-link" aria-label="OpenAI Developers home"><Image src={`${assetRoot}/OpenAI_Developers.svg`} alt="OpenAI Developers" width={211} height={22} priority /></a>
    <nav className="primary-nav desktop-only" aria-label="Primary navigation"><QuietLink href="#top">Home</QuietLink><span className="nav-pill active">API</span><QuietLink>Codex <ChevronDown size={14} /></QuietLink><QuietLink>ChatGPT <ChevronDown size={14} /></QuietLink><QuietLink>Resources <ChevronDown size={14} /></QuietLink></nav>
    <div className="header-actions"><button className="search-trigger" type="button" onClick={onSearch}><span>Start searching</span><Search size={17} /></button><a className="dashboard-button desktop-only" href="#top">API Dashboard <ArrowUpRight size={16} /></a><button className="icon-button desktop-only" type="button" aria-label="Toggle light and dark theme" onClick={onTheme}><Sun className="light-icon" size={16} /><Moon className="dark-icon" size={16} /></button><button className="icon-button mobile-only" type="button" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button></div>
  </div></header>;
}

function ApiRail() { return <nav className="api-rail desktop-only" aria-label="API sections">{apiSections.map((item) => <a className={item === "Models" ? "active" : ""} href={item === "Models" ? "#top" : "#"} key={item}>{item}</a>)}</nav>; }

function Sidebar() { return <nav className="docs-sidebar desktop-only" aria-label="Documentation navigation"><div className="sidebar-scroll">{sidebarGroups.map((group, index) => <div className="sidebar-group" key={`${group.title}-${index}`}>{group.title && <h3>{group.title}</h3>}{group.links.map((link) => <QuietLink href={link === "Pricing" ? "#pricing" : "#top"} key={`${group.title}-${link}`}>{link}</QuietLink>)}</div>)}</div></nav>; }

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) { return <div className={`mobile-drawer mobile-only ${open ? "open" : ""}`} aria-hidden={!open}><div className="drawer-head"><span>Documentation</span><button className="icon-button" type="button" aria-label="Close navigation" onClick={onClose}><X size={20} /></button></div><div className="drawer-links">{apiSections.map((item) => <a href="#top" onClick={onClose} key={`rail-${item}`}>{item}</a>)}{sidebarGroups.flatMap((group) => group.links).map((item, index) => <a href={item === "Pricing" ? "#pricing" : "#top"} onClick={onClose} key={`drawer-${index}-${item}`}>{item}</a>)}</div></div>; }

function Metric({ label, children, icon }: { label: string; children: ReactNode; icon: ReactNode }) { return <div className="metric"><span className="metric-label">{label}</span><span className="metric-value">{icon}{children}</span></div>; }

function ModelOverview() {
  const [copied, setCopied] = useState(false);
  const copyModel = async () => { try { await navigator.clipboard.writeText("gpt-5.6-luna"); setCopied(true); window.setTimeout(() => setCopied(false), 1400); } catch { setCopied(false); } };
  return <>
    <a className="breadcrumb" href="#top"><ArrowLeft size={17} /> Models</a>
    <section className="model-heading" aria-labelledby="model-title"><div className="model-identity"><Image className="model-icon" src={`${assetRoot}/gpt-5.6-luna.png`} alt="gpt-5.6-luna" width={64} height={64} priority /><div><div className="title-line"><h1 id="model-title">GPT-5.6 Luna</h1><button className="model-select" type="button">Default <ChevronDown size={15} /></button><button className="copy-button" type="button" aria-label="Copy model name" onClick={copyModel}>{copied ? <Check size={17} /> : <Clipboard size={17} />}</button></div><p>GPT-5.6 model optimized for cost-sensitive workloads</p></div></div><div className="model-actions"><button className="secondary-button" type="button">Compare</button><button className="primary-button" type="button">Try in Playground</button></div></section>
    <section className="metrics" aria-label="Model metrics"><Metric label="Reasoning" icon={<span className="dots">● ● ●</span>}>High</Metric><Metric label="Speed" icon={<span className="bolt-row"><Zap size={18} fill="currentColor" /><Zap size={18} fill="currentColor" /><Zap size={18} fill="currentColor" /></span>}>Fast</Metric><Metric label="Price" icon={<span className="price-value">$0.2 · $1.2</span>}>Input · Output</Metric><Metric label="Input" icon={<span className="metric-icons"><FileText size={16} /><FileImage size={16} /><Code2 size={16} /></span>}>Text, image</Metric><Metric label="Output" icon={<span className="metric-icons"><FileText size={16} /><FileImage size={16} /><Code2 size={16} /></span>}>Text</Metric></section>
    <div className="intro-grid"><p className="intro-copy">GPT-5.6 Luna is designed for cost-sensitive, high-volume workloads. It roughly corresponds to the nano model tier used in earlier GPT-5 families. Reasoning.effort supports: none, low, medium (default), high, xhigh, and max.</p><div className="facts"><div><Sparkles size={18} /><span>1,050,000 context window</span></div><div><ArrowUpRight size={18} /><span>128,000 max output tokens</span></div><div><Clipboard size={18} /><span>Feb 16, 2026 knowledge cutoff</span></div><div><Lightbulb size={18} /><span>Reasoning token support</span></div></div></div>
  </>;
}

function DataSection({ id, title, children }: { id: string; title: string; children: ReactNode }) { return <section className="data-section" id={id}><h2>{title}</h2><div className="data-content">{children}</div></section>; }

function DataSections() {
  return <div className="data-sections">
    <DataSection id="pricing" title="Pricing"><p>Pricing is based on the number of tokens used, or other metrics based on the model type. For tool-specific models, like search and computer use, there’s a fee per tool call. See details in the <a href="#pricing">pricing page</a>.</p><div className="subheading">Text tokens <span>Per 1M tokens</span></div><div className="pricing-table"><div><span>Input</span><strong>$0.20</strong></div><div><span>Cached input</span><strong>$0.02</strong></div><div><span>Output</span><strong>$1.20</strong></div></div><div className="subheading">Quick comparison</div><div className="comparison-table"><div className="table-head"><span>Input</span><span>Cached input</span><span>Output</span></div><div><span>GPT-5.6 Terra</span><span>$2.00</span><span>$0.00</span></div><div><span>GPT-5.6 Luna</span><span>$0.20</span><span>$1.20</span></div><div><span>GPT-5.4 nano</span><span>$0.20</span><span>$0.80</span></div></div><p>Prompts with &gt;272K input tokens are priced at 2x input and 1.5x output for the full request.</p><p>Cache writes are billed at 1.25x the uncached input token rate.</p></DataSection>
    <DataSection id="modalities" title="Modalities"><div className="key-value-list"><div><span>Text</span><strong>Input and output</strong></div><div><span>Image</span><strong>Input only</strong></div><div><span>Audio</span><strong>Not supported</strong></div><div><span>Video</span><strong>Not supported</strong></div></div></DataSection>
    <DataSection id="endpoints" title="Endpoints"><div className="endpoint-list">{endpoints.map(([name, path]) => <div key={path}><span>{name}</span><code>{path}</code></div>)}</div></DataSection>
    <DataSection id="features" title="Features"><div className="key-value-list"><div><span>Streaming</span><strong>Supported</strong></div><div><span>Function calling</span><strong>Supported</strong></div><div><span>Structured outputs</span><strong>Supported</strong></div><div><span>Fine-tuning</span><strong>Not supported</strong></div></div></DataSection>
    <DataSection id="tools" title="Tools"><p>Tools supported by this model when using the Responses API.</p><div className="key-value-list">{tools.map((tool) => <div key={tool}><span>{tool}</span><strong>Supported</strong></div>)}</div></DataSection>
    <DataSection id="snapshots" title="Snapshots"><p>Snapshots let you lock in a specific version of the model so that performance and behavior remain consistent. Below is a list of all available snapshots and aliases for GPT-5.6 Luna.</p><div className="snapshot"><Image src={`${assetRoot}/gpt-5.6-luna.png`} alt="gpt-5.6-luna" width={48} height={48} /><div><strong>gpt-5.6-luna</strong><span>gpt-5.6-luna</span><span>gpt-5.6-luna</span></div></div></DataSection>
    <DataSection id="rate-limits" title="Rate limits"><p>Rate limits ensure fair and reliable access to the API by placing specific caps on requests, tokens, audio duration, or other usage within a given time period.</p><div className="table-scroll"><table><thead><tr><th>Tier</th><th>RPM</th><th>TPM</th><th>Batch queue limit</th></tr></thead><tbody>{rateLimits.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div></DataSection>
  </div>;
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  if (!open) return null;
  const filtered = suggestions.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  return <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search the API docs"><div className="search-panel"><div className="search-panel-head"><span>Search the API docs</span><button className="icon-button" type="button" aria-label="Close search" onClick={onClose}><X size={18} /></button></div><div className="search-field"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Escape" && onClose()} placeholder="Start searching" /></div><p>Suggested</p><div className="suggestions">{filtered.map((item) => <button key={item} type="button" onClick={onClose}>{item}</button>)}</div></div></div>;
}

export function OpenAiDocsClone() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, setLight] = useState(false);
  const toggleTheme = () => { setLight((current) => { const next = !current; document.documentElement.classList.toggle("dark", !next); return next; }); };
  return <div id="top" className="docs-app"><Header onSearch={() => setSearchOpen(true)} onMenu={() => setDrawerOpen(true)} onTheme={toggleTheme} /><ApiRail /><MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} /><div className="docs-shell"><Sidebar /><main className="docs-main"><article className="article"><ModelOverview /><DataSections /></article></main></div><button className="ask-ai" type="button">Ask AI</button><SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} /></div>;
}
