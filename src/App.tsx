import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import { Almanac } from './pages/Almanac.tsx'
import { Coins } from './pages/Coins.tsx'
import { HexDetail } from './pages/HexDetail.tsx'
import { HexList } from './pages/HexList.tsx'
import { Home } from './pages/Home.tsx'
import { Meihua } from './pages/Meihua.tsx'
import { Missing } from './pages/Missing.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/almanac" element={<Almanac />} />
          <Route path="/meihua" element={<Meihua />} />
          <Route path="/coins" element={<Coins />} />
          <Route path="/hexagrams" element={<HexList />} />
          <Route path="/hexagrams/:id" element={<HexDetail />} />
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
