import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/Home/HomePage';
import ReportPage from './pages/Report/ReportPage';
import SearchPage from './pages/Search/SearchPage';
import NewsPage from './pages/News/NewsPage';
import AidPointsPage from './pages/AidPoints/AidPointsPage';
import ReportDetailPage from './pages/ReportDetail/ReportDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen flex flex-col bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reportar" element={<ReportPage />} />
              <Route path="/buscar" element={<SearchPage />} />
              <Route path="/noticias" element={<NewsPage />} />
              <Route path="/puntos-de-ayuda" element={<AidPointsPage />} />
              <Route path="/reporte/:id" element={<ReportDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1E2538',
              color: '#F1F5F9',
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#CF142B',
                secondary: '#fff',
              },
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  );
}
