import { Eyebrow } from '../../components/ui/Eyebrow';

export default function UserGreeting({ user }) {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dateLabel = new Date()
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();

  const name = user?.first_name || user?.username || '';

  return (
    <div className="flex flex-col gap-2">
      <Eyebrow size="lg">
        Today · {dateLabel}
      </Eyebrow>
      <h1 className="font-serif font-normal text-[32px] md:text-[40px] leading-tight tracking-[-0.02em] text-text-strong">
        {timeGreeting}
        {name && <>, {name}</>}
        {' '}
        <span className="italic text-accent-deep">— your hive is humming</span>
      </h1>
    </div>
  );
}
