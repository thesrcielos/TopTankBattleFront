import './App.css'
import AppRoutes from './routes/AppRoutes';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/AuthContext';

function App() {
  return (
    <UserProvider>
        <Router>
          <Routes>          
              <Route path='/*' element={<AppRoutes/>}/>
          </Routes>
        </Router>
      </UserProvider>
  );
}

export default App;
