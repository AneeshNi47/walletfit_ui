import { useNavigate } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpIcon, ArrowsRightLeftIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export default function QuickActions({ onAddAccount, onAddExpense, onTopUp, onTransfer }) {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Account',
      onClick: onAddAccount,
      icon: <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-100',
      text: 'text-blue-700',
      ring: 'hover:ring-blue-200',
    },
    {
      label: 'Add Expense',
      onClick: onAddExpense,
      icon: <ArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      bg: 'bg-red-50',
      hover: 'hover:bg-red-100',
      text: 'text-red-700',
      ring: 'hover:ring-red-200',
    },
    {
      label: 'Top Up',
      onClick: onTopUp,
      icon: <ArrowDownIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      bg: 'bg-green-50',
      hover: 'hover:bg-green-100',
      text: 'text-green-700',
      ring: 'hover:ring-green-200',
    },
    {
      label: 'Transfer',
      onClick: onTransfer,
      icon: <ArrowsRightLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      bg: 'bg-indigo-50',
      hover: 'hover:bg-indigo-100',
      text: 'text-indigo-700',
      ring: 'hover:ring-indigo-200',
    },
    {
      label: 'View Report',
      onClick: () => navigate('/reports'),
      icon: <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
      bg: 'bg-gray-50',
      hover: 'hover:bg-gray-100',
      text: 'text-gray-700',
      ring: 'hover:ring-gray-200',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md hover:ring-2 ${action.bg} ${action.hover} ${action.text} ${action.ring}`}
          >
            {action.icon}
            <span className="whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}