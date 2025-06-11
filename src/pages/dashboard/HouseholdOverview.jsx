import React from 'react';

export default function HouseholdOverview({ household }) {
  if (!household) return null;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">🏠 Household Overview</h2>

      <div className="mb-2">
        <p><strong>Household Name:</strong> {household.name}</p>
        <p className="text-sm text-gray-500">Owner: {household.owner.username}</p>
      </div>

      <div>
        <p className="font-semibold mb-1">Members:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          {household.members.map((member) => (
            <li key={member.id}>
              {member.username} — <span className="text-gray-600">{member.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
