import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight as ArrowRight,
  Plus,
  Sparkles,
  BarChart3,
  AlertTriangle,
  Users,
  Settings as Cog,
  User,
  ChevronDown,
  ChevronLeft,
  LogOut,
  History,
  Mic,
  FileText
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";
import { COLORS, RECENT_INITIAL, TIPS } from "../constants";
import {
  AnalysisHistoryEntry,
  DECISION_TYPES,
  DecisionType,
  RecentItem,
  RecentItemStatus
} from "../types";

const MAX_Q = 5;

function getQuestionText(type: DecisionType | null, idx: number, answers: string[]): string {
  if (type === "Family") {
    const a1 = answers[0] || "";
    const a2 = answers[1] || "";
    const a3 = answers[2] || "";
    switch (idx) {
      case 0:
        return "What is your primary goal in this situation?";
      case 1:
        return a1
          ? `To clarify your goal ("${a1.slice(0, 80)}"), what would success look like in 3–6 months?`
          : "What would success look like in 3–6 months?";
      case 2:
        return a2
          ? `Given that success means "${a2.slice(0, 80)}", what trade-offs are you willing to accept (time, money, harmony)?`
          : "What trade-offs are you willing to accept (time, money, harmony)?";
      case 3:
        return (a2 || a3)
          ? `Which dependencies or parallel factors could affect this (e.g., childcare, schedules, commitments) relative to "${(a2 || a3).slice(0, 80)}"?`
          : "Which dependencies or parallel factors could affect this (e.g., childcare, schedules, commitments)?";
      case 4:
        return "Any additional details I should know to give the best advice?";
      default:
        return "One last detail—what short-term outcome do you want next week?";
    }
  }
  if (idx === 0) return "What outcome are you hoping to achieve?";
  if (idx === 1) return "List the options you are considering (include doing nothing).";
  if (idx === 2) return "What constraints or risks do you see?";
  if (idx === 3) return "What would make this a success in 6–12 months?";
  if (idx === 4) return "Who else is impacted and how?";
  return "Is there anything else that would help me advise you better?";
}

const STATUS_INITIAL: Record<RecentItemStatus, number> = {
  Done: 0,
  "In progress": 0,
  "No Decision": 0
};

export function Dashboard() {
  const plan = "Silver";
  const used = 12;
  const quota = 30;
  const remaining = quota - used;
  const totalQueries = 68;

  const [recentList, setRecentList] = useState<RecentItem[]>(RECENT_INITIAL);

  const statusCounts = useMemo(() => {
    return recentList.reduce((acc, item) => {
      acc[item.status] += 1;
      return acc;
    }, { ...STATUS_INITIAL });
  }, [recentList]);

  const statusData = useMemo(
    () => [
      { name: "Done", value: statusCounts.Done },
      { name: "In progress", value: statusCounts["In progress"] },
      { name: "No Decision", value: statusCounts["No Decision"] }
    ],
    [statusCounts]
  );

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null);
  const [contextMode, setContextMode] = useState<"audio" | "text">("text");
  const [contextText, setContextText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [versionIndex, setVersionIndex] = useState(0);
  const [chosenFramework, setChosenFramework] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [qaIndex, setQaIndex] = useState(0);
  const [qaAnswers, setQaAnswers] = useState<string[]>([]);
  const [askedSixth, setAskedSixth] = useState(false);
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetNewDecision = useCallback(() => {
    setStep(1);
    setDecisionType(null);
    setContextMode("text");
    setContextText("");
    setAnalyzing(false);
    setAnalysis([]);
    setAnalysisHistory([]);
    setVersionIndex(0);
    setChosenFramework("");
    setOptions([]);
    setSelectedOption(null);
    setQaIndex(0);
    setQaAnswers([]);
    setAskedSixth(false);
  }, []);

  const runAnalysis = useCallback(() => {
    setAnalyzing(true);
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
    }
    const hint = (qaAnswers.join(" ") + " " + contextText).toLowerCase();
    const chosen =
      decisionType === "Family"
        ? "Emotional vs Rational + Descartes Quadrant"
        : decisionType === "Work/Career"
        ? hint.includes("multiple") || hint.includes("compare")
          ? "Weighted Matrix"
          : "Decision Tree"
        : "Pre-Mortem + Second-Order Thinking";

    analysisTimerRef.current = setTimeout(() => {
      const lines = [
        `Chosen approach: ${chosen}`,
        "Key constraints identified: time, budget, uncertainty",
        "Primary trade-off: speed vs quality",
        "Risks: hiring delay, overcommitment"
      ];
      setChosenFramework(chosen);
      setAnalysis(lines);
      setAnalysisHistory((prev) => {
        const next = [...prev, { ts: Date.now(), lines }];
        setVersionIndex(next.length - 1);
        return next;
      });
      setOptions([
        "Option A — Proceed with small pilot (Feasible)",
        "Option B — Defer until resources free (Conservative)",
        "Option C — Hire contractor for 6 weeks (Risky)"
      ]);
      setSelectedOption(null);
      setAnalyzing(false);
      analysisTimerRef.current = null;
    }, 700);
  }, [analysisTimerRef, contextText, decisionType, qaAnswers]);

  const addDecision = useCallback(
    (status: RecentItemStatus) => {
      const title = qaAnswers[0]?.trim()
        ? qaAnswers[0].trim().slice(0, 80)
        : `${decisionType || "Decision"} — ${new Date().toLocaleDateString()}`;
      const id = `DEC-${Math.floor(Math.random() * 9000 + 1000)}`;
      const selectedOptionText = selectedOption !== null ? options[selectedOption] : undefined;
      setRecentList((prev) => [
        { id, title, framework: chosenFramework || "Auto", status, selectedOptionText },
        ...prev
      ]);
    },
    [chosenFramework, decisionType, options, qaAnswers, selectedOption]
  );

  const handleAnalyze = useCallback(() => {
    setStep(3);
    runAnalysis();
  }, [runAnalysis]);

  useEffect(() => {
    return () => {
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div aria-hidden className="h-8 w-8 rounded-xl bg-slate-900 grid place-content-center text-white font-bold">
              CC
            </div>
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-lg md:text-xl font-semibold">Clarity Compass Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            <Badge variant="secondary" className="rounded-full">
              Plan: {plan}
            </Badge>
            <Badge className="rounded-full" aria-label={`Remaining credits: ${remaining} of ${quota}`}>
              Credits: {remaining}/{quota}
            </Badge>
            <Button
              className="hidden md:inline-flex"
              aria-label="New decision"
              onClick={() => {
                setShowNewDecision(true);
                resetNewDecision();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Decision
            </Button>
            <button
              onClick={() => setUserMenuOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              className="inline-flex items-center gap-2 rounded-full border px-2 py-1 hover:bg-slate-50"
            >
              <img src="https://i.pravatar.cc/24" alt="User avatar" className="h-6 w-6 rounded-full" />
              <span className="text-sm">Alex Ivanov</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {userMenuOpen && (
              <div role="menu" className="absolute right-0 top-10 w-44 rounded-xl border bg-white shadow-lg z-40">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                  <Cog className="h-4 w-4" />
                  Settings
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3">
          <Card className="border-slate-200">
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-600">Suggested next:</p>
                <p className="text-sm text-slate-700">
                  You’ve been postponing <span className="font-medium">"Newsletter"</span> for 2 weeks. Try a
                  <span className="font-medium"> Premortem</span> to de-risk.
                </p>
              </div>
              <Button variant="outline" aria-label="Open suggested flow">
                <Sparkles className="mr-2 h-4 w-4" />
                Open
              </Button>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 space-y-6">
        <section aria-labelledby="kpis" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle id="kpis" className="text-base">
                Total number of queries
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <p className="text-7xl md:text-8xl font-extrabold tracking-tight leading-tight mt-2">{totalQueries}</p>
              <p className="text-sm text-slate-600 mt-1">Lifetime</p>
              <div className="w-full mt-4">
                <Button variant="outline" onClick={() => setShowRecentModal(true)} aria-label="View all decisions">
                  <History className="mr-2 h-4 w-4" />
                  View all
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Statuses overview</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="left" wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 flex items-center justify-between gap-2">
              <button
                aria-label="Previous tip"
                className="p-2 rounded hover:bg-slate-50"
                onClick={() => setTipIndex((i) => (i - 1 + TIPS.length) % TIPS.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="flex-1 text-center">{TIPS[tipIndex]}</p>
              <button
                aria-label="Next tip"
                className="p-2 rounded hover:bg-slate-50"
                onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly insights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex gap-2">
                <BarChart3 className="h-4 w-4 text-slate-500 mt-0.5" />
                <p>
                  <span className="font-medium">Momentum:</span> 4 new decisions (↑2 vs last week); average time-to-choice 2.1 days.
                </p>
              </div>
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p>
                  <span className="font-medium">Risks:</span> Budget uncertainty appears in 3 decisions; consider a premortem.
                </p>
              </div>
              <div className="flex gap-2">
                <Users className="h-4 w-4 text-slate-500 mt-0.5" />
                <p>
                  <span className="font-medium">Collaboration:</span> 2 invite activations; share complex choices for feedback.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {showRecentModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRecentModal(false)} />
          <div className="relative mx-auto mt-20 w-full max-w-3xl rounded-2xl bg-white shadow-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent activities</h2>
              <Button variant="ghost" onClick={() => setShowRecentModal(false)}>
                <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                Close
              </Button>
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-12 text-sm font-medium text-slate-500 px-3">
              <div className="col-span-5 py-2">Title</div>
              <div className="col-span-3 py-2">Framework</div>
              <div className="col-span-2 py-2">Status</div>
              <div className="col-span-2 py-2 text-right">Open</div>
            </div>
            <Separator className="my-2" />
            <div className="space-y-1 max-h-96 overflow-auto">
              {recentList.map((item) => (
                <div key={item.id} className="grid grid-cols-12 items-center rounded-lg px-3 py-2 hover:bg-slate-50">
                  <div className="col-span-5 truncate" title={item.title}>
                    <div className="truncate">{item.title}</div>
                    {item.selectedOptionText && (
                      <div className="text-xs text-slate-500 truncate">Choice: {item.selectedOptionText}</div>
                    )}
                  </div>
                  <div className="col-span-3">{item.framework}</div>
                  <div className="col-span-2">
                    <span className="sr-only">Status:</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="col-span-2 text-right">
                    <Button size="sm" variant="ghost" aria-label={`Open ${item.title}`}>
                      <ArrowRight className="mr-1 h-4 w-4" />
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewDecision && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNewDecision(false)} />
          <div className="relative mx-auto mt-16 w-full max-w-2xl rounded-2xl bg-white shadow-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Decision</h2>
              <Button variant="ghost" onClick={() => setShowNewDecision(false)}>
                <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                Close
              </Button>
            </div>
            <Separator className="my-3" />

            <div className="mb-3">
              <div className="relative h-2 bg-slate-100 rounded">
                <div
                  className="absolute left-0 top-0 h-2 rounded bg-emerald-500"
                  style={{ width: `${(Math.max(step - 1, 0) / 4) * 100}%` }}
                />
              </div>
              <div className="mt-2 grid grid-cols-5 text-[11px] font-medium">
                {[
                  { i: 1, label: "Type" },
                  { i: 2, label: "Context" },
                  { i: 3, label: "Analyze" },
                  { i: 4, label: "Options" },
                  { i: 5, label: "Saved" }
                ].map((milestone) => {
                  const state = milestone.i < step ? "done" : milestone.i === step ? "current" : "next";
                  const color =
                    state === "done"
                      ? "text-emerald-700"
                      : state === "current"
                      ? "text-amber-600"
                      : "text-slate-400";
                  const dot =
                    state === "done"
                      ? "bg-emerald-500"
                      : state === "current"
                      ? "bg-amber-500"
                      : "bg-slate-300";
                  return (
                    <div key={milestone.i} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
                      <span className={color}>{milestone.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {step === 1 && (
              <div className="grid md:grid-cols-3 gap-3">
                {DECISION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setDecisionType(type);
                      setStep(2);
                    }}
                    className="rounded-xl border p-4 text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <p className="font-medium">{type}</p>
                    <p className="text-xs text-slate-600 mt-1">Start with tailored questions</p>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && decisionType && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Decision type</p>
                    <p className="text-base font-medium">{decisionType}</p>
                    <div className="text-xs text-slate-600">
                      <span className="font-medium">Suggested:</span>{" "}
                      {decisionType === "Family"
                        ? "Emotional vs Rational + Descartes Quadrant"
                        : decisionType === "Work/Career"
                        ? "Weighted Matrix + Decision Tree"
                        : "Pre-Mortem + Second-Order Thinking"}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                    Back
                  </Button>
                </div>
                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Question {qaIndex + 1}{qaIndex + 1 > MAX_Q ? " (optional)" : ""}</p>
                  <div className="rounded-xl border-2 border-indigo-200 p-4 bg-indigo-50">
                    <p className="text-base font-semibold text-slate-800">
                      {getQuestionText(decisionType, qaIndex, qaAnswers)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">Input mode:</span>
                    <Button
                      variant={contextMode === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setContextMode("text")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Text
                    </Button>
                    <Button
                      variant={contextMode === "audio" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setContextMode("audio")}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Audio
                    </Button>
                  </div>

                  {contextMode === "text" ? (
                    <div>
                      <label className="text-sm font-medium">Your answer</label>
                      <textarea
                        value={qaAnswers[qaIndex] || ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setQaAnswers((prev) => {
                            const next = [...prev];
                            next[qaIndex] = value;
                            return next;
                          });
                        }}
                        className="mt-1 w-full border rounded p-3"
                        rows={5}
                        placeholder="Type your answer here"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border p-4 text-sm text-slate-600">
                      <p className="mb-2">Record up to 3 minutes.</p>
                      <Button>
                        <Mic className="mr-2 h-4 w-4" />
                        Start recording
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-slate-600">
                    <p className="font-medium mb-1">Tips</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Be concrete; add numbers where possible.</li>
                      <li>
                        If unsure, use <em>Skip</em> — I’ll refine the next question.
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button variant="outline" onClick={() => setQaIndex((current) => Math.max(0, current - 1))}>
                      <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                      Back
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setQaAnswers((prev) => {
                            const next = [...prev];
                            next[qaIndex] = next[qaIndex] || "";
                            return next;
                          });
                          if (qaIndex + 1 < MAX_Q) {
                            setQaIndex(qaIndex + 1);
                          } else {
                            setAskedSixth(true);
                            setQaIndex(qaIndex + 1);
                          }
                        }}
                      >
                        Skip
                      </Button>
                      <Button
                        onClick={() => {
                          if (!qaAnswers[qaIndex]) {
                            return;
                          }
                          if (qaIndex + 1 < MAX_Q) {
                            setQaIndex(qaIndex + 1);
                          } else {
                            setAskedSixth(true);
                            setQaIndex(qaIndex + 1);
                          }
                        }}
                      >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {askedSixth && qaIndex === MAX_Q && (
                    <div className="mt-3 border rounded-xl p-3 bg-slate-50">
                      <p className="text-sm font-medium mb-2">One last thing — what does a good outcome look like next week?</p>
                      <textarea
                        value={qaAnswers[qaIndex] || ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setQaAnswers((prev) => {
                            const next = [...prev];
                            next[qaIndex] = value;
                            return next;
                          });
                        }}
                        className="w-full border rounded p-3"
                        rows={3}
                        placeholder="e.g., Make a decision, run a pilot, align with partner"
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <Button variant="outline" onClick={() => setAskedSixth(false)}>
                          <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                          Back
                        </Button>
                        <Button onClick={handleAnalyze}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                  )}

                  {!askedSixth && qaIndex >= MAX_Q && (
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setQaIndex(MAX_Q - 1)}>
                        <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={handleAnalyze}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">AI is analyzing your inputs…</p>
                {analyzing ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 rounded bg-slate-100" />
                    <div className="h-3 rounded bg-slate-100" />
                    <div className="h-3 rounded bg-slate-100 w-3/5" />
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-slate-700 space-y-2">
                      {analysis.map((line) => (
                        <p key={line}>• {line}</p>
                      ))}
                    </div>
                    {analysisHistory.length > 0 && (
                      <div className="mt-3 border rounded p-2 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Analysis versions</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={versionIndex <= 0}
                              onClick={() => setVersionIndex((value) => Math.max(0, value - 1))}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs">V{versionIndex + 1} / V{analysisHistory.length}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={versionIndex >= analysisHistory.length - 1}
                              onClick={() =>
                                setVersionIndex((value) => Math.min(analysisHistory.length - 1, value + 1))
                              }
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <ol className="text-xs space-y-1 max-h-28 overflow-auto">
                          {analysisHistory[versionIndex]?.lines.map((line, index) => (
                            <li key={`${analysisHistory[versionIndex]?.ts}-${index}`}>
                              <span className="text-slate-500 mr-2">
                                {new Date(analysisHistory[versionIndex].ts).toLocaleTimeString()}
                              </span>
                              {line}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button disabled={analyzing} onClick={() => setStep(4)}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm font-medium">Possible options</p>
                <div className="grid gap-2">
                  {options.map((option, index) => (
                    <label
                      key={option}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-slate-50 ${
                        selectedOption === index ? "ring-2 ring-indigo-300 bg-indigo-50" : ""
                      }`}
                    >
                      <div className="text-sm text-slate-800">
                        <input
                          type="radio"
                          name="choice"
                          className="mr-2"
                          checked={selectedOption === index}
                          onChange={() => setSelectedOption(index)}
                        />
                        {option}
                        <div className="text-xs text-slate-600 mt-1">
                          Risks: scope creep · Advantages: quick feedback · Status: {" "}
                          {option.includes("Risky") ? "Risky" : option.includes("Conservative") ? "Conservative" : "Recommended"}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {option.includes("Risky") ? "Risky" : option.includes("Conservative") ? "Conservative" : "Recommended"}
                      </Badge>
                    </label>
                  ))}
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium">Add more context (optional)</p>
                  <textarea
                    className="mt-1 w-full border rounded p-3"
                    rows={3}
                    placeholder="Add new info to refine the recommendation"
                    onChange={(event) => setContextText(event.target.value)}
                  />
                  <div className="flex items-center justify-end mt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(3);
                        runAnalysis();
                      }}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Re-analyze
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        addDecision("In progress");
                        setStep(5);
                      }}
                    >
                      <History className="mr-2 h-4 w-4" />
                      Postpone decision
                    </Button>
                    <Button
                      onClick={() => {
                        addDecision("Done");
                        setStep(5);
                      }}
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Mark as done
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                <p className="text-sm">
                  ✅ <span className="font-medium">Recent Decision is updated.</span> You can review the full history anytime in your log.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewDecision(false);
                    }}
                  >
                    <ArrowRight className="mr-2 rotate-180 h-4 w-4" />
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewDecision(false);
                      setShowRecentModal(true);
                    }}
                  >
                    <History className="mr-2 h-4 w-4" />
                    View recent
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
