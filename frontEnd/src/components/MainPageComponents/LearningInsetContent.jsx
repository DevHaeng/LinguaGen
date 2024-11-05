
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const LearningInsetContent = ({
                                scrollContainerRef,
                                overscrollShadow,
                                visibleCards,
                                wrongWords,
                                loading
                              }) => {
  return (
      <div
          ref={scrollContainerRef}
          className="w-full h-[calc(100vh-200px)] pb-20 overflow-y-auto flex justify-center border-t-2 pt-12 relative custom-scrollbar"
          style={{
            boxShadow: `inset 0 ${overscrollShadow}px ${overscrollShadow}px -${overscrollShadow / 2}px rgba(0, 0, 0, 0.1), inset 0 ${overscrollShadow / 2}px ${overscrollShadow / 2}px -${overscrollShadow / 4}px rgba(0, 0, 0, 0.05)`,
          }}
      >
        <div className="w-1/2 grid grid-cols-1 gap-8 pb-8">
          {visibleCards.map((card, index) => (
              <Card key={index} className="w-full" style={{ userSelect: 'none' }}>
                <CardHeader>
                  <CardTitle>{card.date}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row">
                  <div className="flex flex-col w-1/2 text-center">
                    <p className="mb-2">{card.category}</p>
                    <p className="mb-2">{card.level}</p>
                    <p className="mb-2">{card.score}</p>
                    <p className="mb-2">{card.rank}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                          className="btnAnimation btnPush btnLightBlue w-full h-26 mt-2 p-4 flex items-center justify-center ml-12 rounded-md text-black font-bold"
                          style={{ backgroundColor: '#e3eef1', border: 'none', outline: 'none' }}
                      >
                        틀린 단어 보기
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] h-[600px] overflow-y-auto">
                      <DialogHeader className="h-20">
                        <DialogTitle>틀린 단어 노트</DialogTitle>
                        <DialogDescription>틀린 단어를 확인하세요~</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 mb-16 text-center">
                        {wrongWords.map((word, index) => (
                            <React.Fragment key={index}>
                              <div className="bg-gray-100 p-2 rounded">{word.english}</div>
                              <div className="bg-gray-100 p-2 rounded">{word.korean}</div>
                            </React.Fragment>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
          ))}
          {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="loader"></div>
              </div>
          )}
        </div>
      </div>
  );
};

export default LearningInsetContent;