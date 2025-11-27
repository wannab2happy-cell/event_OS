export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--primary)]/5">
      <div className="text-center space-y-4 px-6 py-10">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          event_OS v1.0
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          Anders Event Operating System
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          관리자(Admin)와 참가자(Participant)를 위한 안전한 멀티테넌트 구조를
          제공하며, Supabase · Resend 무료 티어 한도를 고려한 설계를 따릅니다.
        </p>
      </div>
    </main>
  );
}

