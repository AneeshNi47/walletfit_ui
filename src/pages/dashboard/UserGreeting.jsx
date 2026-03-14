// src/pages/dashboard/UserGreeting.jsx
export default function UserGreeting({ user }) {
  const hour = new Date().getHours();
  let timeGreeting = 'Good evening';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-1">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
        {timeGreeting}, {user?.first_name || user?.username}
      </h1>
      <p className="text-sm text-gray-500">{today}</p>
    </div>
  );
}
