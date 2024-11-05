package com.linguagen.backend.controller;

import com.linguagen.backend.dto.CommentDTO;
import com.linguagen.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService service;

    // 댓글 목록 조회
    @GetMapping("/{communityIdx}")
    public ResponseEntity<List<CommentDTO>> getCommentsByCommunityIdx(@PathVariable("communityIdx") Long communityIdx) {
        List<CommentDTO> comments = service.getCommentsByCommunityIdx(communityIdx);
        return ResponseEntity.ok(comments);
    }

    // 댓글 작성
    @PostMapping
    public ResponseEntity<CommentDTO> addComment(@RequestBody CommentDTO commentDTO) {
        CommentDTO createdComment = service.addComment(commentDTO);
        return ResponseEntity.ok(createdComment);
    }

    // 댓글 수정
    @PutMapping("/{commentIdx}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable("commentIdx") Long commentIdx, @RequestBody CommentDTO commentDTO) {
        CommentDTO updatedComment = service.updateComment(commentIdx, commentDTO);
        return ResponseEntity.ok(updatedComment);
    }

    // 댓글 삭제
    @DeleteMapping("/{commentIdx}")
    public ResponseEntity<Void> deleteComment(@PathVariable("commentIdx") Long commentIdx) {
        service.deleteComment(commentIdx);
        return ResponseEntity.noContent().build();
    }
}
