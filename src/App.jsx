import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './pages/dashboard/Home'
import AddTransactionForm from './pages/expenses/AddTransactionForm';
import ListExpenses from './pages/expenses/ListExpenses';
import AccountsPage from './pages/accounts/AccountsPage';
import Household from './pages/households/Household';
import Profile from './pages/profile/Profile';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import ReportPage from './pages/reports/ReportPage';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Landing />} />
            </Route>
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<ListExpenses />} />
              <Route path="/expenses/add" element={<AddTransactionForm />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/household" element={<Household />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
