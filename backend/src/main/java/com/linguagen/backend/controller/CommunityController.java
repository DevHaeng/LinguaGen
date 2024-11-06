package com.linguagen.backend.controller;

import com.linguagen.backend.dto.CommunityDTO;
import com.linguagen.backend.entity.User;
import com.linguagen.backend.service.CommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    @Autowired
    private CommunityService service;

    // 게시글 작성
    @PostMapping
    public ResponseEntity<CommunityDTO> createCommunityPost(@RequestBody CommunityDTO communityDTO) {
        CommunityDTO createdCommunityPost = service.createCommunityPost(communityDTO);
        return ResponseEntity.ok(createdCommunityPost);
    }

    // 게시글 수정
    @PutMapping("/{idx}")
    public ResponseEntity<CommunityDTO> updateCommunityPost(@PathVariable("idx") Long idx, @RequestBody CommunityDTO updateCommunity, @RequestParam("userId") String userId) {
        Optional<CommunityDTO> updated = service.updateCommunityPost(idx, updateCommunity, userId);
        return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 게시글 삭제
    @DeleteMapping("/{idx}")
    public ResponseEntity<Void> deleteCommunityPost(@PathVariable("idx") Long idx, @RequestParam("userId") String userId) {
        boolean deleted = service.deleteCommunityPost(idx, userId);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // 게시글 조회 (단일)
    @GetMapping("/post/{idx}")
    public ResponseEntity<CommunityDTO> getCommunityByIdx(@PathVariable("idx") Long idx) {
        Optional<CommunityDTO> community = service.getCommunityByIdx(idx);
        return community.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 게시글 조회 (전체)
    @GetMapping
    public ResponseEntity<List<CommunityDTO>> getAllCommunityPosts() {
        List<CommunityDTO> communities = service.getAllCommunityPosts();
        return ResponseEntity.ok(communities);
    }

    // 카테고리별 게시글 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<List<CommunityDTO>> getPostsByCategory(@PathVariable("category") String category) {
        List<CommunityDTO> communities = service.getPostsByCategory(category);
        return ResponseEntity.ok(communities);
    }

    // 게시글 검색 (제목, 글 작성자)
    @GetMapping("/search")
    public ResponseEntity<List<CommunityDTO>> searchCommunity(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String nickname) {

        List<CommunityDTO> communities;
        if (title != null) {
            communities = service.searchPostsByTitle(title);
        } else if (userId != null) {
            communities = service.searchPostsByUserId(userId);
        } else if (nickname != null) {
            communities = service.searchPostsByNickname(nickname);
        } else {
            communities = service.getAllCommunityPosts(); // 기본적으로 모든 게시글 반환
        }
        return ResponseEntity.ok(communities);
    }

    // 카테고리별로 최신 글 4개 가져오기
    @GetMapping("/latest/{category}")
    public List<CommunityDTO> getLatestPostsByCategory(@PathVariable("category") String category) {
        return service.getLatestPostsByCategory(category);
    }

    // 사용자가 작성한 게시글 확인
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<CommunityDTO>> getUserCommunityPosts(
            @PathVariable("userId") String userId,
            @PageableDefault(size = 12) Pageable pageable) {
        Page<CommunityDTO> communities = service.getUserCommunityPosts(userId, pageable);
        return ResponseEntity.ok(communities);
    }

    // 게시글 좋아요 기능
    @PostMapping("/post/{idx}/like")
    public ResponseEntity<String> addLike(@PathVariable("idx") Long communityIdx, @RequestParam String userId) {
        try {
            service.addLike(communityIdx, userId);
            return ResponseEntity.ok("좋아요가 성공적으로 추가되었습니다.");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }
}