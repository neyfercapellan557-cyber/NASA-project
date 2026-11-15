import React from 'react'
import {
  Atom,
  ArrowLeftRight,
  BrainCircuit,
  Box,
  ChevronRight,
  Flame,
  FlaskConical,
  Globe2,
  LayoutDashboard,
  Microscope,
  Search,
  ShieldCheck
} from 'lucide-react'

import AssistantPage from './components/AssistantPage'
import CombustionExplorer from './components/CombustionExplorer'
import Dashboard from './components/Dashboard'
import EarthApplications from './components/EarthApplications'
import ExperimentsLab from './components/ExperimentsLab'
import HabitatSafety from './components/HabitatSafety'
import IgnisCompanion from './components/IgnisCompanion'
import NextGenSafety from './components/NextGenSafety'
import ResearchPage from './components/ResearchPage'
import './App.css'

const DigitalTwin = React.lazy(() => import('./components/ScientificExperiences').then((module) => ({ default: module.DigitalTwin })))
const MicrogravityLab = React.lazy(() => import('./components/ScientificExperiences').then((module) => ({ default: module.MicrogravityLab })))

const navigation = [
  { id: 'dashboard', name: 'Mission Dashboard', icon: LayoutDashboard },
  { id: 'digital-twin', name: 'IGNIS Digital Twin', icon: Box },
  { id: 'research', name: 'Research Intelligence', icon: Microscope },
  { id: 'experiments-lab', name: 'Experiments Lab', icon: FlaskConical },
  { id: 'microgravity-lab', name: 'Microgravity vs Earth', icon: ArrowLeftRight },
  { id: 'combustion', name: 'Combustion Explorer', icon: Flame },
  { id: 'habitat-safety', name: 'Habitat Safety', icon: ShieldCheck },
  { id: 'next-gen-safety', name: 'Next-Gen Safety', icon: Atom },
  { id: 'earth-applications', name: 'Earth Applications', icon: Globe2 },
  { id: 'assistant', name: 'IGNIS AI Assistant', icon: BrainCircuit }
]

const sections = {
  dashboard: Dashboard,
  'digital-twin': DigitalTwin,
  research: ResearchPage,
  'experiments-lab': ExperimentsLab,
  'microgravity-lab': MicrogravityLab,
  combustion: CombustionExplorer,
  'habitat-safety': HabitatSafety,
  'next-gen-safety': NextGenSafety,
  'earth-applications': EarthApplications,
  assistant: AssistantPage
}

function getSectionFromHash() {
  const sectionId = window.location.hash.slice(1)
  return sections[sectionId] ? sectionId : 'dashboard'
}

export default function App() {
  const [activeSection, setActiveSection] = React.useState(getSectionFromHash)
  const [assistantActive, setAssistantActive] = React.useState(false)
  const currentSection = navigation.find((item) => item.id === activeSection) ?? navigation[0]
  const ActivePage = sections[activeSection] ?? Dashboard

  React.useEffect(() => {
    const syncSection = () => setActiveSection(getSectionFromHash())
    window.addEventListener('hashchange', syncSection)
    return () => window.removeEventListener('hashchange', syncSection)
  }, [])

  function openAssistant() {
    if (activeSection === 'assistant') {
      document.getElementById('ignis-question')?.focus({ preventScroll: true })
      return
    }
    window.location.hash = '#assistant'
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="IGNIS home">
          <div className="brand-icon"><Flame size={25} /></div>
          <div>
            <h1>IGNIS</h1>
            <span>SCIENTIFIC INTELLIGENCE</span>
          </div>
        </a>

        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = item.id === activeSection
            return (
              <a
                className={`nav-item ${active ? 'active' : ''}`}
                key={item.id}
                href={`#${item.id}`}
                aria-current={active ? 'page' : undefined}
                title={item.name}
              >
                <Icon size={18} />
                <span>{item.name}</span>
                {active && <ChevronRight size={15} />}
              </a>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-caption">EVIDENCE-FIRST EXPLORATION</span>
          <span className="version">LOCAL RAG · CHROMADB</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <a className="breadcrumb-home" href="#dashboard">IGNIS</a>
            <span>/</span> {currentSection.name}
          </div>
          <div className="top-actions">
            <a className="icon-button" href="#research" aria-label="Open research library" title="Open research library">
              <Search size={19} />
            </a>
            <div className="user-avatar" aria-label="IGNIS Research">IC</div>
          </div>
        </header>

        <React.Suspense fallback={<div className="lab-simulation-loading" role="status">Loading IGNIS experience…</div>}>
          <div className="route-transition" key={activeSection}>
            <ActivePage
              {...(activeSection === 'assistant'
                ? { onAIActiveChange: setAssistantActive }
                : {})}
            />
          </div>
        </React.Suspense>
      </main>
      <IgnisCompanion
        active={activeSection === 'assistant' && assistantActive}
        onActivate={openAssistant}
      />
    </div>
  )
}
