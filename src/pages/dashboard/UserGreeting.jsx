// src/pages/dashboard/UserGreeting.jsx
export default function UserGreeting({ user }) {
  return (
    <div className="text-xl font-semibold text-gray-800">
      Welcome back, {user?.first_name || user?.username} 👋
    </div>
  );
}
