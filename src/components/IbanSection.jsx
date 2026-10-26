import { useState } from 'react';
import PayeeForm, { PayeeBadge, shortIban } from './PayeeForm';
import { labelClass } from './ui/formStyles';

/** Shows IBANs found in a transaction and lets the user name one inline. */
export default function IbanSection({ ibans = [], payee, onNamed }) {
  const [naming, setNaming] = useState(null);
  const [named, setNamed] = useState(payee);
  if (!ibans.length) return null;
  return (
    <div>
      <span className={labelClass}>Bank account in this transaction</span>
      <div className="space-y-2">
        {ibans.map((iban) => {
          const isNamed = named && named.iban === iban;
          return (
            <div key={iban} className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-mono text-text-muted">{shortIban(iban)}</span>
              {isNamed ? (
                <PayeeBadge payee={named} />
              ) : naming !== iban && (
                <button type="button" onClick={() => setNaming(iban)} className="text-accent-deep underline hover:text-accent">
                  Name this account
                </button>
              )}
            </div>
          );
        })}
        {naming && (
          <PayeeForm compact iban={naming} onCancel={() => setNaming(null)}
            onSaved={(p) => { setNamed(p); setNaming(null); onNamed?.(p); }} />
        )}
      </div>
    </div>
  );
}
