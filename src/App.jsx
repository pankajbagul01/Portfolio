import { useState, useEffect, useRef, useCallback } from "react";

// ─── Matrix Rain Canvas ───────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ{}[]<>/\\;:=+*#@";
    let cols, drops;
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / 18);
      drops = Array(cols).fill(1);
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      ctx.fillStyle = "rgba(6,6,14,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const brightness = Math.random();
        ctx.font = `${12 + Math.floor(brightness * 4)}px 'Courier New', monospace`;
        if (brightness > 0.97) {
          ctx.fillStyle = "#ffffff";
        } else if (brightness > 0.85) {
          ctx.fillStyle = "#a78bfa";
        } else {
          ctx.fillStyle = `rgba(124,106,255,${0.15 + brightness * 0.35})`;
        }
        ctx.fillText(ch, i * 18, y * 18);
        if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }
    const interval = setInterval(draw, 40);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.18, pointerEvents: "none" }} />;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(t); }
          else setCount(start);
        }, 20);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ texts }) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[idx];
    let timeout;
    if (!deleting) {
      if (display.length < current.length) {
        timeout = setTimeout(() => setDisplay(current.slice(0, display.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(display.slice(0, -1)), 40);
      } else {
        setDeleting(false);
        setIdx((idx + 1) % texts.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [display, deleting, idx, texts]);
  return (
    <span style={{ color: "#a78bfa", fontWeight: 700 }}>
      {display}<span style={{ animation: "blink 1s step-end infinite", borderRight: "2px solid #a78bfa", marginLeft: 2 }}>&nbsp;</span>
    </span>
  );
}

// ─── Skill Badge ──────────────────────────────────────────────────────────────
function SkillBadge({ icon, name, level, color = "#7c6aff" }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `rgba(${color === "#22d3a5" ? "34,211,165" : color === "#fbbf24" ? "251,191,36" : "124,106,255"},0.1)` : "#0f0f1a",
        border: `1px solid ${hov ? color : "rgba(255,255,255,0.08)"}`,
        borderRadius: 14, padding: "18px 12px", textAlign: "center",
        cursor: "default", transition: "all 0.25s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${color}22` : "none",
      }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, color: hov ? "#f0eeff" : "#8b84b0", fontWeight: 500, letterSpacing: 0.3 }}>{name}</div>
      {level && <div style={{ marginTop: 6, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: level + "%", background: color, borderRadius: 2, transition: "width 1s" }} />
      </div>}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{
      position: "relative", zIndex: 1, padding: "100px 60px",
      maxWidth: 1200, margin: "0 auto", ...style
    }}>
      {children}
    </section>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#a78bfa", fontWeight: 700, marginBottom: 12 }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 48, color: "#f0eeff" }}>{children}</h2>;
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ emoji, title, desc, tags, featured, links, gradient, features }) {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "#0d0d1a", border: `1px solid ${hov ? (featured ? "#7c6aff" : "rgba(124,106,255,0.4)") : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "all 0.3s", transform: hov ? "translateY(-6px)" : "none",
        boxShadow: hov ? "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,106,255,0.1)" : "none",
        position: "relative",
        ...(featured ? { gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 340 } : {})
      }}>
      {featured && <div style={{ position: "absolute", top: 16, right: 16, background: "linear-gradient(135deg,#7c6aff,#a78bfa)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: 1, zIndex: 2, textTransform: "uppercase" }}>⭐ Featured Project</div>}
      <div style={{
        background: gradient, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: featured ? 80 : 56, position: "relative", overflow: "hidden",
        minHeight: featured ? "auto" : 180, padding: featured ? 0 : 0
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,0.03) 24px,rgba(255,255,255,0.03) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,0.03) 24px,rgba(255,255,255,0.03) 25px)" }} />
        <span style={{ position: "relative", filter: "drop-shadow(0 0 30px rgba(255,255,255,0.25))" }}>{emoji}</span>
      </div>
      <div style={{ padding: featured ? "40px 36px" : "24px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: featured ? 26 : 18, fontWeight: 800, color: "#f0eeff", letterSpacing: -0.5 }}>{title}</div>
        <p style={{ color: "#8b84b0", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{desc}</p>
        {featured && features && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "8px 0" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#c3bde8" }}>
                <span style={{ color: "#22d3a5", marginTop: 2 }}>✓</span>{f}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tags.map(t => (
            <span key={t.name} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: t.bg || "rgba(124,106,255,0.1)", color: t.color || "#a78bfa", border: `1px solid ${t.border || "rgba(124,106,255,0.2)"}` }}>{t.name}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
          {links?.github && <a href={links.github} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8b84b0", textDecoration: "none", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 30, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#a78bfa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#8b84b0"; }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
            GitHub
          </a>}
          {links?.live && <a href={links.live} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#22d3a5", textDecoration: "none", padding: "8px 16px", background: "rgba(34,211,165,0.08)", border: "1px solid rgba(34,211,165,0.2)", borderRadius: 30 }}>
            ↗ Live Demo
          </a>}
        </div>
      </div>
    </div>
  );
}

// ─── Resume Page ──────────────────────────────────────────────────────────────
function ResumePage({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#06060e", color: "#f0eeff", padding: "80px 40px 60px", position: "relative", zIndex: 1 }}>
      <MatrixRain />
      <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#8b84b0", padding: "10px 24px", borderRadius: 30, cursor: "pointer", marginBottom: 48, fontSize: 14, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#a78bfa"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#8b84b0"; }}>
          ← Back to Portfolio
        </button>

        {/* Resume Card */}
        <div style={{ background: "#0d0d1a", border: "1px solid rgba(124,106,255,0.2)", borderRadius: 24, padding: "48px 52px", boxShadow: "0 0 80px rgba(124,106,255,0.08)" }}>
          {/* Header */}
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 32, marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: -2, color: "#f0eeff", margin: 0 }}>Pankaj Bagul</h1>
                <div style={{ color: "#a78bfa", fontWeight: 600, fontSize: 16, marginTop: 6 }}>Full Stack Developer · CS (AI &amp; ML) @ VIT Pune</div>
                <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
                  {[
                    { icon: "✉", text: "pankajbagul01@gmail.com" },
                    { icon: "🔗", text: "github.com/pankajbagul01" },
                    { icon: "💼", text: "linkedin.com/in/pankajbagul01" },
                    { icon: "📍", text: "Pune, Maharashtra" },
                  ].map(c => <span key={c.text} style={{ fontSize: 13, color: "#8b84b0", display: "flex", alignItems: "center", gap: 5 }}><span>{c.icon}</span>{c.text}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.3)", color: "#22d3a5", fontSize: 12, fontWeight: 700, padding: "6px 16px", borderRadius: 20, letterSpacing: 1 }}>OPEN TO INTERNSHIPS</div>
              </div>
            </div>
          </div>

          <ResumeSection title="OBJECTIVE">
            <p style={{ color: "#c3bde8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              Passionate 2nd-year B.Tech student in Computer Science (AI &amp; ML) at VIT Pune, with hands-on experience building full-stack web applications using the MERN stack. Actively solving DSA problems in Java on LeetCode (50+ solved). Seeking internship opportunities to apply my skills, collaborate on real-world problems, and grow as a software engineer.
            </p>
          </ResumeSection>

          <ResumeSection title="EDUCATION">
            <ResumeEntry
              title="B.Tech — Computer Science Engineering (AI &amp; ML)"
              sub="Vishwakarma Institute of Technology, Pune"
              right="2024 – 2028 · 2nd Year"
              bullets={["Relevant coursework: Data Structures, OOP, Web Technologies, Database Management, Discrete Mathematics", "Actively building projects & participating in college tech clubs"]}
            />
          </ResumeSection>

          <ResumeSection title="TECHNICAL SKILLS">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 40px", fontSize: 13 }}>
              {[
                ["Languages", "Java, JavaScript, Python, HTML5, CSS3"],
                ["Frontend", "React.js, Tailwind CSS, Bootstrap"],
                ["Backend", "Node.js, Express.js, REST APIs"],
                ["Database", "MongoDB, MySQL"],
                ["Tools", "Git, GitHub, VS Code, Postman"],
                ["Concepts", "DSA (Java), OOP, MVC Architecture, Responsive Design"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: "#a78bfa", fontWeight: 700, minWidth: 90 }}>{k}</span>
                  <span style={{ color: "#c3bde8" }}>{v}</span>
                </div>
              ))}
            </div>
          </ResumeSection>

          <ResumeSection title="PROJECTS">
            <ResumeEntry
              title="MessMate — Full Stack Mess Management System ⭐"
              sub="MERN Stack · MongoDB · Express.js · React.js · Node.js · JWT"
              right="Featured Project"
              highlight
              bullets={[
                "Built a comprehensive hostel mess management platform from scratch using the full MERN stack",
                "Implemented JWT-based authentication with role-based access control (student, mess manager, admin)",
                "Developed meal booking system, menu management, real-time attendance tracking, and feedback portal",
                "Designed and built 15+ REST API endpoints; integrated MongoDB Atlas with Mongoose ODM",
                "Deployed responsive React frontend with intuitive dashboard UI for all user roles",
              ]}
            />
            <ResumeEntry
              title="Smart Waste Management System"
              sub="React.js · Node.js · MongoDB · Maps API"
              right=""
              bullets={[
                "Location-based waste pickup request system with real-time tracking and route optimization",
                "Admin dashboard for managing pickup agents and viewing analytics",
              ]}
            />
            <ResumeEntry
              title="Smart Learning Platform"
              sub="HTML · CSS · JavaScript · Streamlit · Python"
              right=""
              bullets={[
                "Adaptive learning platform with personalized content delivery and progress tracking",
                "Quiz engine with dynamic question bank and performance analytics",
              ]}
            />
            <ResumeEntry
              title="Voting System"
              sub="Java · HTML · CSS · JavaScript"
              right=""
              bullets={[
                "Secure role-based digital voting with real-time vote counting and fraud prevention",
                "Admin panel for candidate management and result visualization",
              ]}
            />
          </ResumeSection>

          <ResumeSection title="DSA & PROBLEM SOLVING">
            <div style={{ background: "rgba(124,106,255,0.06)", border: "1px solid rgba(124,106,255,0.15)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div><div style={{ color: "#a78bfa", fontWeight: 800, fontSize: 28, fontFamily: "'Space Grotesk',sans-serif" }}>50+</div><div style={{ color: "#8b84b0", fontSize: 12 }}>LeetCode Problems</div></div>
                <div><div style={{ color: "#22d3a5", fontWeight: 800, fontSize: 28, fontFamily: "'Space Grotesk',sans-serif" }}>Java</div><div style={{ color: "#8b84b0", fontSize: 12 }}>Primary Language</div></div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ color: "#c3bde8", fontSize: 13, lineHeight: 1.8 }}>
                    Topics covered: Arrays, Strings, Linked Lists, Stacks, Queues, Recursion, Sorting Algorithms, Binary Search, HashMaps, Trees (ongoing). Consistent daily practice to build problem-solving fundamentals.
                  </div>
                </div>
              </div>
            </div>
          </ResumeSection>

          <ResumeSection title="CERTIFICATIONS & LEARNING" last>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Full Stack Web Development (MERN Stack) — Self-taught & project-based",
                "Data Structures & Algorithms in Java — Active LeetCode practitioner",
                "React.js & Node.js — Hands-on project development",
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#c3bde8", padding: "6px 0" }}>
                  <span style={{ color: "#a78bfa" }}>▸</span>{c}
                </div>
              ))}
            </div>
          </ResumeSection>
        </div>

        <div style={{ textAlign: "center", marginTop: 32, color: "#8b84b0", fontSize: 13 }}>
          <button onClick={() => window.print()} style={{ background: "linear-gradient(135deg,#7c6aff,#a78bfa)", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 30, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            🖨 Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumeSection({ title, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 36, paddingBottom: last ? 0 : 36, borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#a78bfa", fontWeight: 800, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function ResumeEntry({ title, sub, right, bullets, highlight }) {
  return (
    <div style={{ marginBottom: 20, padding: highlight ? "16px 20px" : 0, background: highlight ? "rgba(124,106,255,0.05)" : "transparent", borderRadius: highlight ? 12 : 0, border: highlight ? "1px solid rgba(124,106,255,0.2)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: highlight ? "#a78bfa" : "#f0eeff" }}>{title}</div>
        {right && <div style={{ fontSize: 12, color: "#8b84b0", whiteSpace: "nowrap" }}>{right}</div>}
      </div>
      <div style={{ fontSize: 12, color: "#7c6aff", marginBottom: 8, marginTop: 2 }}>{sub}</div>
      {bullets && <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        {bullets.map((b, i) => <li key={i} style={{ fontSize: 13, color: "#c3bde8", lineHeight: 1.7 }}>{b}</li>)}
      </ul>}
    </div>
  );
}

// ─── LeetCode Stats ───────────────────────────────────────────────────────────
function LeetCodeWidget() {
  return (
    <div style={{ background: "linear-gradient(135deg,#0f0f1a,#1a1030)", border: "1px solid rgba(124,106,255,0.25)", borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,106,255,0.2),transparent)", filter: "blur(30px)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>⚡</div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: "#f0eeff" }}>LeetCode Progress</div>
          <div style={{ fontSize: 12, color: "#8b84b0" }}>DSA in Java · Active Practitioner</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Solved", val: "50+", color: "#a78bfa" },
          { label: "Easy", val: "25+", color: "#22d3a5" },
          { label: "Medium", val: "20+", color: "#fbbf24" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#8b84b0", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "#8b84b0", lineHeight: 1.7, marginBottom: 16 }}>
        Topics mastered: <span style={{ color: "#c3bde8" }}>Arrays · Strings · Linked Lists · Stacks · Queues · Recursion · Sorting · Binary Search · HashMaps · Trees</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Problem Solving", pct: 65, color: "#7c6aff" },
          { label: "Consistency", pct: 80, color: "#22d3a5" },
          { label: "Java Proficiency", pct: 75, color: "#fbbf24" },
        ].map(b => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8b84b0", marginBottom: 4 }}>
              <span>{b.label}</span><span style={{ color: b.color }}>{b.pct}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
              <div style={{ height: "100%", width: b.pct + "%", background: b.color, borderRadius: 4, boxShadow: `0 0 8px ${b.color}88` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [page, setPage] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ["hero", "about", "skills", "projects", "dsa", "education", "contact"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) { setActiveNav(id); break; }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (page === "resume") return <ResumePage onBack={() => setPage("home")} />;

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#skills", label: "Skills" },
    { href: "#projects", label: "Projects" },
    { href: "#dsa", label: "DSA" },
    { href: "#education", label: "Education" },
    { href: "#contact", label: "Contact" },
  ];

  const skills = [
    { icon: "⚛️", name: "React.js", level: 78, color: "#61dafb" },
    { icon: "🟨", name: "JavaScript", level: 80, color: "#fbbf24" },
    { icon: "☕", name: "Java", level: 82, color: "#f87171" },
    { icon: "🟢", name: "Node.js", level: 72, color: "#22d3a5" },
    { icon: "🍃", name: "MongoDB", level: 70, color: "#22d3a5" },
    { icon: "🚂", name: "Express.js", level: 68, color: "#a78bfa" },
    { icon: "🐍", name: "Python", level: 60, color: "#fbbf24" },
    { icon: "🌐", name: "HTML5", level: 92, color: "#f97316" },
    { icon: "🎨", name: "CSS3", level: 88, color: "#38bdf8" },
    { icon: "💄", name: "Tailwind", level: 75, color: "#38bdf8" },
    { icon: "🗄️", name: "MySQL", level: 62, color: "#7c6aff" },
    { icon: "🐙", name: "Git/GitHub", level: 78, color: "#f0eeff" },
  ];

  const projects = [
    {
      emoji: "🍽️", title: "MessMate", featured: true,
      gradient: "linear-gradient(135deg,#1a1a3e 0%,#2d1b4e 50%,#1a0d3e 100%)",
      desc: "A full-stack hostel mess management platform built with the MERN stack. MessMate solves the chaos of hostel mess bookings — from meal scheduling and attendance tracking to feedback collection and menu management, all in one unified system.",
      features: [
        "JWT Auth with Role-based Access (Student / Manager / Admin)",
        "Real-time Meal Booking & Menu Management",
        "Attendance Tracking & Analytics Dashboard",
        "Student Feedback Portal with ratings",
        "15+ REST APIs built with Express.js",
        "MongoDB Atlas with Mongoose ODM",
        "Responsive React UI with role-specific dashboards",
        "Full CRUD for meals, students, and schedules",
      ],
      tags: [
        { name: "MongoDB", bg: "rgba(34,211,165,0.1)", color: "#22d3a5", border: "rgba(34,211,165,0.2)" },
        { name: "Express.js", bg: "rgba(124,106,255,0.1)", color: "#a78bfa", border: "rgba(124,106,255,0.2)" },
        { name: "React.js", bg: "rgba(97,218,251,0.1)", color: "#61dafb", border: "rgba(97,218,251,0.2)" },
        { name: "Node.js", bg: "rgba(34,211,165,0.1)", color: "#22d3a5", border: "rgba(34,211,165,0.2)" },
        { name: "JWT Auth", bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" },
        { name: "REST APIs", bg: "rgba(248,113,113,0.1)", color: "#f87171", border: "rgba(248,113,113,0.2)" },
      ],
      links: { github: "https://github.com/pankajbagul01" },
    },
    {
      emoji: "♻️", title: "Smart Waste Management",
      gradient: "linear-gradient(135deg,#0d2818,#143825)",
      desc: "Location-based waste pickup request system with real-time tracking for residents, admin dashboard for pickup agents, and route optimization for efficient waste collection.",
      tags: [
        { name: "React.js", bg: "rgba(97,218,251,0.1)", color: "#61dafb", border: "rgba(97,218,251,0.2)" },
        { name: "Node.js", bg: "rgba(34,211,165,0.1)", color: "#22d3a5", border: "rgba(34,211,165,0.2)" },
        { name: "MongoDB", bg: "rgba(34,211,165,0.1)", color: "#22d3a5", border: "rgba(34,211,165,0.2)" },
      ],
      links: { github: "https://github.com/pankajbagul01" },
    },
    {
      emoji: "📚", title: "Smart Learning Platform",
      gradient: "linear-gradient(135deg,#1a0d2e,#2e1a4e)",
      desc: "Adaptive learning platform featuring personalized content delivery, progress tracking, interactive quiz engine with a dynamic question bank, and performance analytics.",
      tags: [
        { name: "HTML", bg: "rgba(249,115,22,0.1)", color: "#f97316", border: "rgba(249,115,22,0.2)" },
        { name: "CSS", bg: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "rgba(56,189,248,0.2)" },
        { name: "JavaScript", bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" },
        { name: "Python", bg: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "rgba(96,165,250,0.2)" },
      ],
      links: { github: "https://github.com/pankajbagul01" },
    },
    {
      emoji: "🏫", title: "College Club Website",
      gradient: "linear-gradient(135deg,#0d1e2e,#1a2e48)",
      desc: "Responsive college club website with home page, about section, event gallery, and student registration form. Built with HTML/CSS and Streamlit backend integration.",
      tags: [
        { name: "HTML", bg: "rgba(249,115,22,0.1)", color: "#f97316", border: "rgba(249,115,22,0.2)" },
        { name: "CSS", bg: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "rgba(56,189,248,0.2)" },
        { name: "Streamlit", bg: "rgba(255,75,75,0.1)", color: "#ff4b4b", border: "rgba(255,75,75,0.2)" },
        { name: "Python", bg: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "rgba(96,165,250,0.2)" },
      ],
      links: { github: "https://github.com/pankajbagul01" },
    },
    {
      emoji: "❓", title: "Quiz Platform",
      gradient: "linear-gradient(135deg,#2e1a0d,#4e2a0d)",
      desc: "Interactive web-based quiz app with timed quizzes, multiple topics, score tracking, result summaries, and a clean responsive interface for an engaging user experience.",
      tags: [
        { name: "HTML", bg: "rgba(249,115,22,0.1)", color: "#f97316", border: "rgba(249,115,22,0.2)" },
        { name: "CSS", bg: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "rgba(56,189,248,0.2)" },
        { name: "JavaScript", bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" },
      ],
      links: { github: "https://github.com/pankajbagul01" },
    },
    {
      emoji: "🗳️", title: "Voting System",
      gradient: "linear-gradient(135deg,#0d1a0d,#0d2e1a)",
      desc: "Secure digital voting application with role-based access for admins and voters, real-time vote counting, candidate management, and fraud prevention mechanisms.",
      tags: [
        { name: "Java", bg: "rgba(248,113,113,0.1)", color: "#f87171", border: "rgba(248,113,113,0.2)" },
        { name: "HTML", bg: "rgba(249,115,22,0.1)", color: "#f97316", border: "rgba(249,115,22,0.2)" },
        { name: "CSS", bg: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "rgba(56,189,248,0.2)" },
        { name: "JavaScript", bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" },
      ],
      links: { github: "https://github.com/pankajbagul01" },
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#06060e", color: "#f0eeff", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-24px)} }
        @keyframes floatR { 0%,100%{transform:translateY(0)}50%{transform:translateY(24px)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(124,106,255,0.3)}50%{box-shadow:0 0 40px rgba(124,106,255,0.6)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes scanline { 0%{transform:translateY(-100%)}100%{transform:translateY(100vh)} }
        .hero-animate { animation: slideUp 0.8s ease forwards; }
        .hero-animate-2 { animation: slideUp 0.8s 0.15s ease both; }
        .hero-animate-3 { animation: slideUp 0.8s 0.3s ease both; }
        .hero-animate-4 { animation: slideUp 0.8s 0.45s ease both; }
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .hero-section { padding: 120px 24px 80px !important; }
          nav { padding: 16px 24px !important; }
          .section-inner { padding: 80px 24px !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .featured-project { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <MatrixRain />

      {/* Ambient blobs */}
      <div style={{ position: "fixed", width: 700, height: 700, borderRadius: "50%", filter: "blur(140px)", opacity: 0.12, top: -200, right: -200, background: "radial-gradient(circle,#7c6aff,#4f3ff0,transparent)", animation: "float 10s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", filter: "blur(120px)", opacity: 0.08, bottom: 0, left: -150, background: "radial-gradient(circle,#22d3a5,transparent)", animation: "floatR 12s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "18px 60px", display: "flex", justifyContent: "space-between", alignItems: "center",
        backdropFilter: "blur(24px)", background: scrolled ? "rgba(6,6,14,0.9)" : "rgba(6,6,14,0.5)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        transition: "all 0.3s",
      }}>
        <a href="#hero" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: "#f0eeff", textDecoration: "none", letterSpacing: -0.5 }}>
          Pankaj<span style={{ color: "#a78bfa" }}>.</span>
        </a>
        <div style={{ display: "flex", gap: 32, listStyle: "none", alignItems: "center" }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} style={{ color: activeNav === l.href.slice(1) ? "#f0eeff" : "#8b84b0", textDecoration: "none", fontSize: 13, fontWeight: 500, letterSpacing: 0.3, transition: "color 0.2s", borderBottom: activeNav === l.href.slice(1) ? "2px solid #7c6aff" : "2px solid transparent", paddingBottom: 2 }}>{l.label}</a>
          ))}
          <button onClick={() => setPage("resume")} style={{ background: "linear-gradient(135deg,#7c6aff,#a78bfa)", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.3 }}>Resume</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="hero-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px 60px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 820 }}>
          <div className="hero-animate" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,106,255,0.1)", border: "1px solid rgba(124,106,255,0.25)", borderRadius: 30, padding: "6px 16px", fontSize: 12, color: "#c4b5fd", marginBottom: 28, letterSpacing: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22d3a5", display: "inline-block", animation: "pulse 2s infinite", boxShadow: "0 0 8px #22d3a5" }} />
            Available for Internships · VIT Pune 2024–28
          </div>
          <h1 className="hero-animate-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(54px,9vw,96px)", fontWeight: 800, lineHeight: 0.92, letterSpacing: -4, marginBottom: 20 }}>
            <span style={{ display: "block", color: "#f0eeff" }}>Pankaj</span>
            <span style={{ display: "block", background: "linear-gradient(135deg,#7c6aff,#a78bfa,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Bagul</span>
          </h1>
          <div className="hero-animate-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, marginBottom: 24, minHeight: 30, color: "#a78bfa" }}>
            <span style={{ color: "#8b84b0" }}>&gt;&nbsp;</span>
            <Typewriter texts={["Full Stack Developer", "MERN Stack Builder", "DSA Problem Solver (Java)", "CS (AI & ML) Student", "Open Source Enthusiast"]} />
          </div>
          <p className="hero-animate-3" style={{ fontSize: 17, color: "#8b84b0", maxWidth: 580, lineHeight: 1.8, marginBottom: 44 }}>
            3rd-year B.Tech student at <strong style={{ color: "#c3bde8" }}>VIT Pune</strong> building real-world applications with the MERN stack. I turn ideas into production-ready products — from messy hostel systems to intelligent platforms. Currently cracking <strong style={{ color: "#c3bde8" }}>DSA problems in Java</strong> on LeetCode.
          </p>
          <div className="hero-animate-4" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
            <a href="#projects" style={{ padding: "14px 32px", background: "linear-gradient(135deg,#7c6aff,#6251f0)", color: "#fff", borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 0.25s", boxShadow: "0 8px 30px rgba(124,106,255,0.35)" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              View Projects →
            </a>
            <button onClick={() => setPage("resume")} style={{ padding: "13px 30px", border: "1px solid rgba(255,255,255,0.12)", color: "#c3bde8", borderRadius: 50, fontSize: 14, fontWeight: 500, background: "transparent", cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#c3bde8"; }}>
              📄 View Resume
            </button>
            <a href="https://github.com/pankajbagul01" target="_blank" rel="noreferrer" style={{ padding: "13px 30px", border: "1px solid rgba(255,255,255,0.12)", color: "#c3bde8", borderRadius: 50, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#c3bde8"; }}>
              GitHub ↗
            </a>
          </div>

          {/* Quick stats */}
          <div className="hero-animate-4" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { num: 6, suf: "+", label: "Projects Built" },
              { num: 50, suf: "+", label: "LeetCode Solved" },
              { num: 2, suf: "nd", label: "Year B.Tech" },
              { num: 1, suf: "", label: "MERN App Live" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 800, color: "#a78bfa", lineHeight: 1 }}>
                  <Counter target={s.num} suffix={s.suf} />
                </div>
                <div style={{ fontSize: 12, color: "#8b84b0", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating code snippet */}
        <div style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, opacity: 0.6, animation: "float 6s ease-in-out infinite" }}>
          {["const dev = {", "  name: 'Pankaj',", "  stack: 'MERN',", "  dsa: 'Java',", "  status: 'learning'", "};"].map((line, i) => (
            <div key={i} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: i === 0 || i === 5 ? "#a78bfa" : i === 2 || i === 3 || i === 4 ? "#22d3a5" : "#8b84b0", whiteSpace: "nowrap" }}>{line}</div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <div style={{ background: "rgba(15,15,26,0.7)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Section id="about" className="section-inner">
          <SectionLabel>Who I Am</SectionLabel>
          <SectionTitle>About <span style={{ color: "#a78bfa" }}>Me</span></SectionTitle>
          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
            <div>
              <p style={{ color: "#8b84b0", fontSize: 15, lineHeight: 1.9, marginBottom: 20 }}>
                Hey! I'm <strong style={{ color: "#f0eeff" }}>Pankaj Bagul</strong> — a 2nd-year B.Tech student pursuing <strong style={{ color: "#a78bfa" }}>Computer Science (AI & ML)</strong> at Vishwakarma Institute of Technology, Pune. I'm passionate about building things that actually work and solve real problems.
              </p>
              <p style={{ color: "#8b84b0", fontSize: 15, lineHeight: 1.9, marginBottom: 20 }}>
                My biggest project so far — <strong style={{ color: "#f0eeff" }}>MessMate</strong> — is a full-stack MERN application that completely digitizes hostel mess management. From JWT auth to MongoDB Atlas, I built every layer of it myself.
              </p>
              <p style={{ color: "#8b84b0", fontSize: 15, lineHeight: 1.9, marginBottom: 28 }}>
                Outside of building projects, I'm grinding <strong style={{ color: "#fbbf24" }}>DSA in Java</strong> on LeetCode (50+ problems and counting), sharpening my problem-solving fundamentals every single day. I believe the best engineers write clean code AND understand the algorithms underneath.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["🏙 VIT Pune", "🤖 AI & ML Branch", "🍽 MERN Developer", "⚡ LeetCode Java", "🌱 Always Learning", "🔭 Open to Internships"].map(chip => (
                  <span key={chip} style={{ padding: "6px 16px", border: "1px solid rgba(124,106,255,0.2)", borderRadius: 30, fontSize: 13, color: "#c3bde8", background: "rgba(124,106,255,0.06)" }}>{chip}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {[
                  { num: 6, suf: "+", label: "Projects\nCompleted", color: "#a78bfa" },
                  { num: 50, suf: "+", label: "LeetCode\nProblems", color: "#22d3a5" },
                  { num: 1, suf: "", label: "Full-Stack\nMERN App", color: "#fbbf24" },
                  { num: 4, suf: "yr", label: "B.Tech\nDuration", color: "#f87171" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px 20px" }}>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                      <Counter target={s.num} suffix={s.suf} />
                    </div>
                    <div style={{ fontSize: 12, color: "#8b84b0", whiteSpace: "pre-line", lineHeight: 1.5 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0d0d1a", border: "1px solid rgba(34,211,165,0.15)", borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ fontSize: 12, color: "#22d3a5", fontWeight: 700, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Current Focus</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "Building production-grade MERN applications",
                    "Solving DSA problems daily in Java",
                    "Learning System Design fundamentals",
                    "Exploring AI/ML integrations in web apps",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#c3bde8" }}>
                      <span style={{ color: "#22d3a5", marginTop: 2 }}>→</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* SKILLS */}
      <Section id="skills" className="section-inner">
        <SectionLabel>My Toolkit</SectionLabel>
        <SectionTitle>Skills & <span style={{ color: "#a78bfa" }}>Technologies</span></SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 14 }}>
          {skills.map(s => <SkillBadge key={s.name} {...s} />)}
        </div>
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
          {[
            { label: "Frontend Development", pct: 85, color: "#61dafb" },
            { label: "Backend Development", pct: 72, color: "#22d3a5" },
            { label: "Database Design", pct: 68, color: "#a78bfa" },
            { label: "Problem Solving (DSA)", pct: 70, color: "#fbbf24" },
          ].map(b => (
            <div key={b.label} style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: "#c3bde8", fontWeight: 500 }}>{b.label}</span>
                <span style={{ color: b.color, fontWeight: 700 }}>{b.pct}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
                <div style={{ height: "100%", width: b.pct + "%", background: b.color, borderRadius: 6, boxShadow: `0 0 10px ${b.color}66` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PROJECTS */}
      <div style={{ background: "rgba(15,15,26,0.7)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Section id="projects" className="section-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 16 }}>
            <div>
              <SectionLabel>What I've Built</SectionLabel>
              <SectionTitle style={{ marginBottom: 0 }}>Featured <span style={{ color: "#a78bfa" }}>Projects</span></SectionTitle>
            </div>
            <a href="https://github.com/pankajbagul01" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#8b84b0", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 30 }}>All on GitHub ↗</a>
          </div>
          <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 24 }}>
            {projects.map(p => <ProjectCard key={p.title} {...p} />)}
          </div>
        </Section>
      </div>

      {/* DSA */}
      <Section id="dsa" className="section-inner">
        <SectionLabel>Problem Solving</SectionLabel>
        <SectionTitle>DSA & <span style={{ color: "#a78bfa" }}>LeetCode</span></SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <LeetCodeWidget />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: "#f0eeff", marginBottom: 16 }}>Topics I've Mastered</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Recursion", "Sorting", "Binary Search", "HashMaps", "Two Pointers", "Sliding Window", "Trees (ongoing)"].map(t => (
                  <span key={t} style={{ padding: "5px 12px", background: "rgba(124,106,255,0.07)", border: "1px solid rgba(124,106,255,0.15)", borderRadius: 20, fontSize: 12, color: "#c3bde8" }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "#0d0d1a", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 16, padding: 24 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: "#f0eeff", marginBottom: 12 }}>Why Java for DSA?</div>
              <p style={{ color: "#8b84b0", fontSize: 13, lineHeight: 1.8 }}>
                Java's strong typing and OOP fundamentals make it excellent for DSA practice. From ArrayList to HashMap, PriorityQueue to TreeMap — Java's rich Collections framework aligns perfectly with algorithmic thinking. It also prepares me for enterprise-level backend development.
              </p>
            </div>
            <div style={{ background: "linear-gradient(135deg,rgba(34,211,165,0.06),rgba(124,106,255,0.06))", border: "1px solid rgba(34,211,165,0.15)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🎯</span>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: "#22d3a5" }}>Current Goal</div>
              </div>
              <p style={{ color: "#8b84b0", fontSize: 13, lineHeight: 1.8 }}>
                Reaching <strong style={{ color: "#f0eeff" }}>100+ problems solved</strong> by end of semester, covering all major data structures and moving into Graphs and Dynamic Programming. Consistent daily practice is the key.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* EDUCATION */}
      <div style={{ background: "rgba(15,15,26,0.7)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Section id="education" className="section-inner">
          <SectionLabel>Where I'm Learning</SectionLabel>
          <SectionTitle>Education</SectionTitle>
          <div style={{ background: "#0d0d1a", border: "1px solid rgba(124,106,255,0.2)", borderRadius: 20, padding: "36px 40px", display: "flex", gap: 28, alignItems: "flex-start", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,106,255,0.12),transparent)", filter: "blur(50px)" }} />
            <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#7c6aff,#a78bfa)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🎓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: "#f0eeff", marginBottom: 6 }}>B.Tech — Computer Science Engineering (AI &amp; ML)</div>
              <div style={{ fontSize: 16, color: "#a78bfa", marginBottom: 12, fontWeight: 500 }}>Vishwakarma Institute of Technology, Pune</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "#8b84b0" }}>📅 2024 – 2028</span>
                <span style={{ fontSize: 13, color: "#8b84b0" }}>📚 2nd Year</span>
                <span style={{ padding: "3px 12px", background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.25)", borderRadius: 20, fontSize: 12, color: "#22d3a5", fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                {["Data Structures & Algorithms", "Object-Oriented Programming", "Database Management Systems", "Web Technologies", "Discrete Mathematics", "Machine Learning Fundamentals"].map(c => (
                  <div key={c} style={{ display: "flex", gap: 8, fontSize: 13, color: "#c3bde8" }}>
                    <span style={{ color: "#7c6aff" }}>▸</span>{c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* CONTACT */}
      <Section id="contact" className="section-inner">
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <SectionLabel>Let's Connect</SectionLabel>
          <SectionTitle>Got an <span style={{ color: "#a78bfa" }}>Opportunity?</span></SectionTitle>
          <p style={{ color: "#8b84b0", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>
            I'm actively looking for <strong style={{ color: "#c3bde8" }}>internship opportunities</strong>. Whether it's a MERN project, open-source collaboration, or just a developer chat — I'm always open!
          </p>
          <a href="mailto:pankajbagul01@gmail.com" style={{ display: "inline-block", fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: "#a78bfa", textDecoration: "none", border: "1px solid rgba(124,106,255,0.3)", padding: "16px 36px", borderRadius: 60, marginBottom: 40, transition: "all 0.25s", background: "rgba(124,106,255,0.05)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,106,255,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(124,106,255,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,106,255,0.05)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            pankajbagul01@gmail.com
          </a>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {[
              { href: "https://github.com/pankajbagul01", label: "GitHub", icon: <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg> },
              { href: "https://www.linkedin.com/in/pankajbagul01/", label: "LinkedIn", icon: <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
              { href: "https://www.instagram.com/pankajbagul01", label: "Instagram", icon: <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg> },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                style={{ width: 46, height: 46, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b84b0", textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#a78bfa"; e.currentTarget.style.background = "rgba(124,106,255,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#8b84b0"; e.currentTarget.style.background = "transparent"; }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 1 }}>
        <span style={{ color: "#8b84b0", fontSize: 13 }}>© 2025 Pankaj Bagul — Built with React & passion 🚀</span>
        <span style={{ color: "#a78bfa", fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>VIT Pune · CS (AI & ML)</span>
      </footer>
    </div>
  );
}