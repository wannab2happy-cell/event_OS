interface ParticipantFooterProps {
  eventId: string;
}

export default function ParticipantFooter({ eventId }: ParticipantFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          {/* 왼쪽 */}
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-gray-700">ANDERS Event OS</span>
          </div>

          {/* 오른쪽 */}
          <div className="flex items-center gap-4">
            <span>© {currentYear} ANDERS. All rights reserved.</span>
            <a
              href="mailto:support@anders.kr"
              className="hover:text-gray-700 transition"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

