import React, { useState, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const CreateCustom = () => {
  const [formData, setFormData] = useState({
    topic: '',
    grade: '',
    tier: '',
    questionType: '',
    detailType: '',
    count: '1',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableDetailTypes, setAvailableDetailTypes] = useState([]);

  const grades = [
    { value: "브론즈", label: "브론즈" },
    { value: "실버", label: "실버" },
    { value: "골드", label: "골드" },
    { value: "플래티넘", label: "플래티넘" },
    { value: "다이아몬드", label: "다이아몬드" },
    { value: "챌린저", label: "챌린저" }
  ];

  const tiers = [
    { value: "4", label: "4티어" },
    { value: "3", label: "3티어" },
    { value: "2", label: "2티어" },
    { value: "1", label: "1티어" }
  ];

  const questionTypes = [
    { value: "리딩", label: "리딩" },
    { value: "리스닝", label: "리스닝" },
    { value: "기타", label: "기타" }
  ];

  const detailTypesByQuestionType = {
    "리딩": [
      { value: "주제/제목 찾기", label: "주제/제목 찾기" },
      { value: "요지 파악", label: "요지 파악" },
      { value: "세부 정보 찾기", label: "세부 정보 찾기" },
      { value: "지칭 추론", label: "지칭 추론" },
      { value: "어휘 추론", label: "어휘 추론" }
    ],
    "리스닝": [
      { value: "주제/목적 파악", label: "주제/목적 파악" },
      { value: "세부 정보 듣기", label: "세부 정보 듣기" },
      { value: "화자의 태도/의견 추론", label: "화자의 태도/의견 추론" },
      { value: "대화/강의 구조 파악", label: "대화/강의 구조 파악" },
      { value: "함축적 의미 추론", label: "함축적 의미 추론" }
    ],
    "기타": [
      { value: "문법 문제", label: "문법 문제" },
      { value: "어휘 문제", label: "어휘 문제" },
      { value: "말하기 문제", label: "말하기 문제" },
      { value: "쓰기 문제", label: "쓰기 문제" }
    ]
  };

  const counts = [
    { value: "1", label: "1문제" },
    { value: "5", label: "5문제" },
    { value: "10", label: "10문제" },
    { value: "15", label: "15문제" }

  ];

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // 등급이 변경되었을 때
      if (field === 'grade') {
        if (value === '챌린저') {
          newData.tier = '0';
        } else {
          newData.tier = '';
        }
      }

      // 문제 유형이 변경되었을 때
      if (field === 'questionType') {
        setAvailableDetailTypes(detailTypesByQuestionType[value] || []);
        newData.detailType = '';
      }

      return newData;
    });
  }, []);

  const handleSubmit = async () => {
    const requiredFields = formData.grade === '챌린저'
        ? ['topic', 'grade', 'questionType', 'detailType', 'count']
        : ['topic', 'grade', 'tier', 'questionType', 'detailType', 'count'];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8085/api/user-questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          grade: formData.grade,
          tier: formData.grade === '챌린저' ? 0 : parseInt(formData.tier),
          questionType: formData.questionType,
          detailType: formData.detailType,
          count: parseInt(formData.count)
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'API 요청이 실패했습니다.');
      }

      const data = await response.json();
      console.log('생성된 질문:', data);
      alert('질문이 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('에러:', error);
      alert(`질문 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Create Custom Question</h2>
          <p className="text-gray-500">문제 생성을 위한 정보를 입력해주세요.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">관심사</label>
            <Textarea
                placeholder="관심사를 입력해주세요..."
                value={formData.topic}
                onChange={(e) => handleFormChange('topic', e.target.value)}
                className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">등급</label>
              <Select
                  value={formData.grade}
                  onValueChange={(value) => handleFormChange('grade', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="등급 선택" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">문제 수</label>
              <Select
                  value={formData.count}
                  onValueChange={(value) => handleFormChange('count', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="문제 수 선택" />
                </SelectTrigger>
                <SelectContent>
                  {counts.map(count => (
                      <SelectItem key={count.value} value={count.value}>
                        {count.label}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.grade && formData.grade !== '챌린저' && (
              <div>
                <label className="block text-sm font-medium mb-2">티어</label>
                <Select
                    value={formData.tier}
                    onValueChange={(value) => handleFormChange('tier', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="티어 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map(tier => (
                        <SelectItem key={tier.value} value={tier.value}>
                          {tier.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">문제 유형</label>
            <Select
                value={formData.questionType}
                onValueChange={(value) => handleFormChange('questionType', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="문제 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.questionType && (
              <div>
                <label className="block text-sm font-medium mb-2">세부 유형</label>
                <Select
                    value={formData.detailType}
                    onValueChange={(value) => handleFormChange('detailType', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="세부 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDetailTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          )}

          <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '문제 생성하기'}
          </Button>
        </div>
      </div>
  );
};

export default CreateCustom;