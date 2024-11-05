package com.linguagen.backend.controller;

import com.linguagen.backend.entity.DailyWord;
import com.linguagen.backend.service.DailyWordService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/words")
public class DailyWordController {

    private final DailyWordService wordService;

    public DailyWordController(DailyWordService wordService) {
        this.wordService = wordService;
    }

    @GetMapping
    public List<DailyWord> getWords() {
        return wordService.getAllWords();
    }
}
