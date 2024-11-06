import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const ListCustom = () => {
  // 더미 데이터
  const customQuestions = [
    {
      id: 1,
      theme: 'Grammar',
      title: 'Past Perfect Tense Practice',
      date: '2024-03-20',
      difficulty: 'Medium'
    },
    {
      id: 2,
      theme: 'Vocabulary',
      title: 'Business Terms Quiz',
      date: '2024-03-19',
      difficulty: 'Hard'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">My Custom Questions</h2>
        <p className="text-gray-500">View and manage your custom-generated questions.</p>
      </div>

      <div className="grid gap-4">
        {customQuestions.map((question) => (
          <Card key={question.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{question.title}</CardTitle>
                  <CardDescription>Created on {question.date}</CardDescription>
                </div>
                <Badge variant="outline">{question.theme}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge variant="secondary">{question.difficulty}</Badge>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ListCustom; 