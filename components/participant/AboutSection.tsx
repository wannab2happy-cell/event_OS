interface AboutSectionProps {
  event: {
    title: string;
    location_detail?: string | null;
  };
}

export default function AboutSection({ event }: AboutSectionProps) {
  const aboutText = event.location_detail || '행사 상세 내용이 곧 업데이트 됩니다.';

  // location_detail을 여러 블록으로 나누기 (간단한 분할 로직)
  const splitIntoBlocks = (text: string): string[] => {
    // 문단 단위로 분할 (빈 줄 기준)
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    
    if (paragraphs.length > 0) {
      return paragraphs;
    }
    
    // 문단이 없으면 전체를 하나의 블록으로
    return [text];
  };

  const blocks = splitIntoBlocks(aboutText);

  // 블록을 2열 그리드로 배치
  const leftBlocks = blocks.filter((_, index) => index % 2 === 0);
  const rightBlocks = blocks.filter((_, index) => index % 2 === 1);

  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* 섹션 헤더 */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About Event
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
            {event.title}에 대한 상세 정보를 확인하세요.
          </p>
        </div>

        {/* 콘텐츠 블록 */}
        {blocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* 왼쪽 열 */}
            <div className="space-y-6">
              {leftBlocks.map((block, index) => (
                <div
                  key={`left-${index}`}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {block.trim()}
                  </p>
                </div>
              ))}
            </div>

            {/* 오른쪽 열 */}
            {rightBlocks.length > 0 && (
              <div className="space-y-6">
                {rightBlocks.map((block, index) => (
                  <div
                    key={`right-${index}`}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {block.trim()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">행사 상세 내용이 곧 업데이트 됩니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}

