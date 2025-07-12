import './App.css'
import AppRoutes from './routes/AppRoutes';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner"

function App() {
   return (
    <UserProvider>
        <Router>
          <Routes>          
              <Route path='/*' element={<AppRoutes/>}/>
          </Routes>
        </Router>
        <Toaster position='top-right'/>
    </UserProvider>
  );
}

export default App;
