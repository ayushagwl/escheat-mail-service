import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateLetter from './pages/CreateLetter';
import OrderHistory from './pages/OrderHistory';
import JobTracking from './pages/JobTracking';
import Templates from './pages/Templates';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 bg-gray-50 p-6">
              <Routes>
                                     <Route path="/" element={<Home />} />
                     <Route path="/create-letter" element={<CreateLetter />} />
                     <Route path="/order-history" element={<OrderHistory />} />
                     <Route path="/job-tracking" element={<JobTracking />} />
                     <Route path="/templates" element={<Templates />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  );
};

export default App;
