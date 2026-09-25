import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Shelf from './components/Shelf'
import BookOverlay from './components/BookOverlay'
import ProjectWindow from './components/ProjectWindow'
import { ShelfLookProvider } from './hooks/useShelfLook'
import { SectionLooksProvider } from './hooks/useSectionLooks.jsx'

function PressShell() {
  return (
    <ShelfLookProvider>
      <SectionLooksProvider>
        <div className="press">
          <Header />
          <Shelf />
          <Routes>
            <Route path="/" element={null} />
            <Route path="/project/:slug" element={<ProjectWindow />} />
            <Route path="/:slug" element={<BookOverlay />} />
          </Routes>
        </div>
      </SectionLooksProvider>
    </ShelfLookProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PressShell />
    </BrowserRouter>
  )
}
