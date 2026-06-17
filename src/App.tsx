import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { SongsProvider } from './context/SongsContext'
import { EditorPage } from './pages/EditorPage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { PlayerPage } from './pages/PlayerPage'
import { DEFAULT_FONT, loadGoogleFont } from './utils/fonts'

loadGoogleFont(DEFAULT_FONT)

export default function App() {
  return (
    <SongsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="play/:id" element={<PlayerPage />} />
            <Route path="editor" element={<EditorPage />} />
            <Route path="editor/:id" element={<EditorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SongsProvider>
  )
}
