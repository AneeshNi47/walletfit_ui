import React from 'react';

export default function HouseholdOverview({ household }) {
  if (!household) return null;

  return (
    <div className="bg-surface p-4 rounded shadow">
      <h2 className="text-lg font-semibold text-text-strong mb-3">🏠 Household Overview</h2>

      <div className="mb-2">
        <p><strong>Household Name:</strong> {household.name}</p>
        <p className="text-sm text-text-muted">Owner: {household.owner.username}</p>
      </div>

      <div>
        <p className="font-semibold mb-1">Members:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-strong">
          {household.members.map((member) => (
            <li key={member.id}>
              {member.username} — <span className="text-text-main">{member.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
