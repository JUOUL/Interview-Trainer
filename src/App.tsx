import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import DailyPracticePage from './pages/DailyPracticePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/practice/:bankId" element={<PracticePage />} />
        <Route path="/daily" element={<DailyPracticePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
