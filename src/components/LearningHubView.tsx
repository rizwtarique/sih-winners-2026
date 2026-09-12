import React, { useState } from 'react';
import { LEARNING_TOPICS } from '../data/mockData';
import { LearningTopic } from '../types';
import {
  BookOpen,
  Search,
  CheckCircle2,
  FileCode,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Link,
  Shield,
  Smartphone,
  Server,
  Zap,
} from 'lucide-react';

export function LearningHubView() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('explain');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Overview',
    'Engineering',
    'Hardware & IoT',
    'AI & Analytics',
    'Quality & Security',
    'Process',
  ];

  const filteredTopics = LEARNING_TOPICS.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentTopic = LEARNING_TOPICS.find((t) => t.id === selectedTopicId) || LEARNING_TOPICS[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 rounded-2xl shadow-sm border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Complete Beginner Curriculum
            </span>
            <span className="text-xs text-indigo-300">15 Prompts Master Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Honey Chain Architecture & Explainer
          </h1>
          <p className="text-sm text-indigo-200 font-medium max-w-2xl mt-0.5">
            Every part of the Honey Chain system broken down into 5 simple beginner questions: What is it, Why we need it, How it works, Everyday analogy, and How it connects to the project.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-950/60 p-2 rounded-xl border border-indigo-800/80">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-200">15 Modular Topics</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search topics (e.g. iot, blockchain)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filteredTopics.map((topic) => {
            const isSelected = topic.id === currentTopic.id;
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                      prompts/{topic.filename}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{topic.title}</h3>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {topic.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{topic.summary}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: 5-Question Detailed Explainer */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Topic Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                prompts/{currentTopic.filename}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {currentTopic.badge}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900">{currentTopic.title}</h2>
            <p className="text-sm text-slate-600 font-medium">{currentTopic.summary}</p>
          </div>

          {/* 5 Beginner Questions Cards */}
          <div className="space-y-3">
            {/* 1. What is it? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">What is it?</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                {currentTopic.q1What}
              </p>
            </div>

            {/* 2. Why do we need it? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Why do we need it?</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                {currentTopic.q2Why}
              </p>
            </div>

            {/* 3. How does it work? */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">How does it work?</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
                {currentTopic.q3How}
              </p>
            </div>

            {/* 4. Simple everyday analogy */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  4
                </span>
                <h4 className="font-bold text-amber-950 text-sm">A Simple Everyday Analogy</h4>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed pl-8 font-medium">
                {currentTopic.q4Analogy}
              </p>
            </div>

            {/* 5. How it connects to Honey Chain */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  5
                </span>
                <h4 className="font-bold text-emerald-950 text-sm">
                  How it connects to Honey Chain
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed pl-8 font-medium">
                {currentTopic.q5Connection}
              </p>
            </div>
          </div>

          {/* Technical Code / Architecture Snippet if available */}
          {currentTopic.codeSnippet && (
            <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  {currentTopic.codeSnippet.description}
                </span>
                <span className="text-[10px] uppercase text-slate-500 font-mono">
                  {currentTopic.codeSnippet.language}
                </span>
              </div>
              <pre className="overflow-x-auto text-[11px] text-slate-300 leading-relaxed p-2">
                <code>{currentTopic.codeSnippet.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
