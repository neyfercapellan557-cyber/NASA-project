import React from 'react'
import {
  Activity,
  Atom,
  BrainCircuit,
  ChartNoAxesCombined,
  Flame,
  FlaskConical,
  Globe2,
  LayoutDashboard,
  Microscope,
  Search,
  Bell,
  ChevronRight,
  FileText,
  ShieldCheck
} from 'lucide-react'

import './App.css'

const navigation = [
  { name: 'Mission Dashboard', icon: LayoutDashboard },
  { name: 'Research Intelligence', icon: Microscope },
  { name: 'Combustion Explorer', icon: Flame },
  { name: 'Habitat Safety', icon: ShieldCheck },
  { name: 'Next-Gen Safety', icon: Atom },
  { name: 'Earth Applications', icon: Globe2 },
  { name: 'IGNIS AI Assistant', icon: BrainCircuit }
]

const research = [
  {
    title: 'Combustion in Reduced Gravity',
    category: 'MICROGRAVITY',
    source: 'NASA Research',
    status: 'Indexed'
  },
  {
    title: 'Cool Diffusion Flames',
    category: 'FLAME DYNAMICS',
    source: 'Scientific Publication',
    status: 'Indexed'
  },
  {
    title: 'Fire Safety in Spacecraft',
    category: 'SPACE SAFETY',
    source: 'NASA Technical Report',
    status: 'Indexed'
  }
]

function App() {
  const [activeSection, setActiveSection] = React.useState('Mission Dashboard')
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Flame size={25} />
          </div>
          <div>
            <h1>IGNIS</h1>
            <span>SCIENTIFIC INTELLIGENCE</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item, index) => {
            const Icon = item.icon

            return (
              <button
                className={`nav-item ${index === 0 ? 'active' : ''}`}
                key={item.name}
              >
                <Icon size={18} />
                <span>{item.name}</span>
                {index === 0 && <ChevronRight size={15} />}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            ALL SYSTEMS OPERATIONAL
          </div>
          <span className="version">IGNIS // VERSION 1.0</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            IGNIS <span>/</span> Mission Dashboard
          </div>

          <div className="top-actions">
            <button className="icon-button"><Search size={19} /></button>
            <button className="icon-button"><Bell size={19} /></button>
            <div className="user-avatar">IC</div>
          </div>
        </header>

        <section className="dashboard">
          <div className="welcome">
            <div>
              <div className="eyebrow">
                <span className="status-dot" />
                MISSION CONTROL
              </div>

              <h2>Scientific Intelligence Dashboard</h2>

              <p>
                Understanding combustion. Advancing fire safety.
                Protecting future space missions.
              </p>
            </div>

            <div className="hero-visual">
              <div className="hero-grid" />
              <div className="hero-orbit hero-orbit-a" />
              <div className="hero-orbit hero-orbit-b" />

              <div className="hero-core">
                <Flame size={66} strokeWidth={1.2} />
              </div>

              <span className="hero-coordinate coordinate-one">
                microgravity // 01
              </span>

              <span className="hero-coordinate coordinate-two">
                COMBUSTION ANALYSIS
              </span>

              <span className="hero-coordinate coordinate-three">
                IGNIS SYSTEM
              </span>
            </div>
          </div>

          <div className="section-heading">
            <div>
              <h3>Research Overview</h3>
              <p>Scientific knowledge base status</p>
            </div>

            <span className="live-label">
              <span className="status-dot" />
              SYSTEM ONLINE
            </span>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-top">
                <span>SCIENTIFIC DOCUMENTS</span>
                <FileText size={19} />
              </div>
              <strong>16</strong>
              <small>Documents indexed</small>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <span>RESEARCH FRAGMENTS</span>
                <ChartNoAxesCombined size={19} />
              </div>
              <strong>3,089</strong>
              <small>Knowledge fragments</small>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <span>RESEARCH DOMAINS</span>
                <FlaskConical size={19} />
              </div>
              <strong>06</strong>
              <small>Scientific categories</small>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <span>AI SYSTEM</span>
                <BrainCircuit size={19} />
              </div>
              <strong className="online-text">ONLINE</strong>
              <small>Local intelligence system</small>
            </div>
          </div>

          <div className="content-grid">
            <section className="panel research-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent Research</h3>
                  <p>Scientific knowledge base</p>
                </div>

                <button className="text-button">
                  VIEW ALL <ChevronRight size={15} />
                </button>
              </div>

              <div className="research-list">
                {research.map((item) => (
                  <div className="research-item" key={item.title}>
                    <div className="document-icon">
                      <FileText size={20} />
                    </div>

                    <div className="research-info">
                      <h4>{item.title}</h4>
                      <span>{item.category} · {item.source}</span>
                    </div>

                    <span className="indexed">{item.status}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel safety-panel">
              <div className="panel-heading">
                <div>
                  <h3>Fire Safety in Space</h3>
                  <p>Core research mission</p>
                </div>
                <Activity size={20} />
              </div>

              <div className="space-graphic">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="planet">
                  <Flame size={43} />
                </div>
              </div>

              <div className="safety-caption">
                <span>RESEARCH OBJECTIVE</span>
                <p>
                  Transform combustion research into scientific
                  insights for safer crewed space habitats.
                </p>
              </div>
            </section>
          </div>

          <footer className="dashboard-footer">
            <span>IGNIS SCIENTIFIC INTELLIGENCE</span>
            <span>FLAME IN FREEFALL · NASA SPACE APPS 2026</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
