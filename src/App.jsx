import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './pages/dashboard/Home'
import AddTransactionForm from './pages/expenses/AddTransactionForm';
import ListExpenses from './pages/expenses/ListExpenses';
import Accounts from './pages/accounts/Accounts';
import Household from './pages/households/Household';
import Profile from './pages/profile/Profile';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/household" element={<Household />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
