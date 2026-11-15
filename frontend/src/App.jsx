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
  { id: 'dashboard', name: 'Panel de misión', icon: LayoutDashboard },
  { id: 'digital-twin', name: 'Gemelo digital IGNIS', icon: Box },
  { id: 'research', name: 'Inteligencia de investigación', icon: Microscope },
  { id: 'experiments-lab', name: 'Laboratorio de experimentos', icon: FlaskConical },
  { id: 'microgravity-lab', name: 'Laboratorio de gravedad', icon: ArrowLeftRight },
  { id: 'combustion', name: 'Explorador de combustión', icon: Flame },
  { id: 'habitat-safety', name: 'Seguridad del hábitat', icon: ShieldCheck },
  { id: 'next-gen-safety', name: 'Seguridad de nueva generación', icon: Atom },
  { id: 'earth-applications', name: 'Aplicaciones terrestres', icon: Globe2 },
  { id: 'assistant', name: 'Asistente de IA IGNIS', icon: BrainCircuit }
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
        <a className="brand" href="#dashboard" aria-label="Inicio de IGNIS">
          <div className="brand-icon"><Flame size={25} /></div>
          <div>
            <h1>IGNIS</h1>
            <span>INTELIGENCIA CIENTÍFICA</span>
          </div>
        </a>

        <div className="nav-label">ESPACIO DE TRABAJO</div>
        <nav className="navigation" aria-label="Navegación principal">
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
          <span className="sidebar-caption">EXPLORACIÓN BASADA EN EVIDENCIA</span>
          <span className="version">RAG LOCAL · CHROMADB</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <a className="breadcrumb-home" href="#dashboard">IGNIS</a>
            <span>/</span> {currentSection.name}
          </div>
          <div className="top-actions">
            <a className="icon-button" href="#research" aria-label="Abrir biblioteca científica" title="Abrir biblioteca científica">
              <Search size={19} />
            </a>
            <div className="user-avatar" aria-label="Investigación IGNIS">IG</div>
          </div>
        </header>

        <React.Suspense fallback={<div className="lab-simulation-loading" role="status">Cargando la experiencia IGNIS…</div>}>
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
