import React, { useState } from 'react';
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
  const [theme, setTheme] = useState('');

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Create Custom Question</h2>
        <p className="text-gray-500">Select a theme and write your prompt to create a custom question.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <Select onValueChange={setTheme}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movie">영화</SelectItem>
              <SelectItem value="dailySpeech">일상회화</SelectItem>
              <SelectItem value="travel">여행</SelectItem>
              <SelectItem value="business">비지니스</SelectItem>
              <SelectItem value="drama">드라마</SelectItem>
              <SelectItem value="anime">애니</SelectItem>
              <SelectItem value="normal">일반</SelectItem>
              <SelectItem value="literature">문학</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Prompt</label>
          <Textarea 
            placeholder="Write your prompt here..."
            className="min-h-[200px]"
          />
        </div>

        <Button className="w-full">
          Generate Question
        </Button>
      </div>
    </div>
  );
};

export default CreateCustom; 