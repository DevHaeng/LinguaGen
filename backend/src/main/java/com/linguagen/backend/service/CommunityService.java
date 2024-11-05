package com.linguagen.backend.service;

import com.linguagen.backend.dto.CommunityDTO;
import com.linguagen.backend.entity.Community;
import com.linguagen.backend.entity.User;
import com.linguagen.backend.repository.CommentRepository;
import com.linguagen.backend.repository.CommunityRepository;
import com.linguagen.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    @Autowired
    private CommunityRepository repository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private UserRepository userRepository;

    // 게시글 생성
    public CommunityDTO createCommunityPost(CommunityDTO communityDTO) {
        try {
            Community community = convertToEntity(communityDTO);
            Community savedCommunity = repository.save(community);
            return convertToDTO(savedCommunity);
        } catch (Exception e) {
            // 예외 로그 출력
            System.err.println("Error in createCommunityPost: " + e.getMessage());
            throw e; // 예외 재발생
        }
    }

    // 단일 게시글 조회 (삭제되지 않은 게시글만 + 조회수 증가)
    @Transactional
    public Optional<CommunityDTO> getCommunityByIdx(Long idx) {
        return repository.findByIdxAndIsDeletedFalse(idx).map(community -> {
            int currentViewCount = community.getViewCount();
            community.setViewCount(currentViewCount + 1); // 조회수 증가
            repository.save(community); // 변경 사항 저장
            return convertToDTO(community);
        });
    }

    // 모든 게시글 조회 (삭제되지 않은 게시글만)
    public List<CommunityDTO> getAllCommunityPosts() {
        List<Community> communities = repository.findByIsDeletedFalseOrderByCreatedAtDesc();
        return communities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 카테고리별 데이터 조회
    public List<CommunityDTO> getPostsByCategory(String category) {
        List<Community> communities = repository.findByCategoryAndIsDeletedFalseOrderByCreatedAtDesc(category);
        return communities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 게시글 수정
    public Optional<CommunityDTO> updateCommunityPost(Long idx, CommunityDTO updatedCommunityDTO, String userId) {
        return repository.findById(idx).map(existingCommunity -> {
            if (!existingCommunity.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("수정 권한이 없습니다.");
            }
            existingCommunity.setTitle(updatedCommunityDTO.getTitle());
            existingCommunity.setContent(updatedCommunityDTO.getContent());
            existingCommunity.setCategory(updatedCommunityDTO.getCategory());
            existingCommunity.setFile(updatedCommunityDTO.getFile());
            Community updatedCommunity = repository.save(existingCommunity);
            return convertToDTO(updatedCommunity);
        });
    }

    // 게시글 삭제
    public boolean deleteCommunityPost(Long idx, String userId) {
        return repository.findById(idx).map(community -> {
            if (!community.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("삭제 권한이 없습니다.");
            }
            community.setDeleted(true);
            repository.save(community);
            return true;
        }).orElse(false);
    }

    // 제목으로 검색 (삭제되지 않은 게시글만)
    public List<CommunityDTO> searchPostsByTitle(String title) {
        List<Community> communities = repository.findByTitleContainingAndIsDeletedFalse(title);
        return communities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 작성자 ID로 검색 (삭제되지 않은 게시글만)
    public List<CommunityDTO> searchPostsByUserId(String userId) {
        List<Community> communities = repository.findByUserIdAndIsDeletedFalse(userId);
        return communities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 닉네임으로 검색 (삭제되지 않은 게시글만)
    public List<CommunityDTO> searchPostsByNickname(String nickname) {
        List<Community> communities = repository.findByNicknameAndIsDeletedFalse(nickname);
        return communities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 카테고리별로 최신 4개 글 조회 (삭제되지 않은 게시글만)
    public List<CommunityDTO> getLatestPostsByCategory(String category) {
        List<Community> communities = repository.findTop4ByCategoryAndIsDeletedFalseOrderByCreatedAtDesc(category);
        return communities.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 사용자가 작성한 게시글 확인
    public Page<CommunityDTO> getUserCommunityPosts(String userId, Pageable pageable) {
        Page<Community> communities = repository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable);
        return communities.map(community -> {
            Long commentsCount = commentRepository.countByCommunityIdxAndIsDeletedFalse(community.getIdx());
            return new CommunityDTO(community.getIdx(), community.getTitle(), community.getContent(), commentsCount);
        });
    }

    // 게시글 좋아요 기능
    public void addLike(Long communityIdx, String userId) {
        // 사용자 포인트 확인
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        if (user.getPoints() < 10) {
            throw new IllegalStateException("포인트가 부족합니다."); // 기본 예외 사용
        }

        // 포인트 차감 및 좋아요 증가
        user.setPoints(user.getPoints() - 10); // 포인트 10 차감
        userRepository.save(user); // 사용자 포인트 업데이트

        // 게시글의 좋아요 수 증가
        Community community = repository.findById(communityIdx).orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        community.setLikeCount(community.getLikeCount() + 1); // 좋아요 수 증가
        repository.save(community); // 게시글 업데이트
    }

    // 엔티티를 DTO로 변환
    private CommunityDTO convertToDTO(Community community) {
        return new CommunityDTO(
                community.getIdx(),
                community.getUser().getId(),
                community.getCategory(),
                community.getTitle(),
                community.getContent(),
                community.getFile(),
                community.getCreatedAt(),
                community.getUpdatedAt(),
                community.getViewCount(),
                community.getLikeCount(),
                community.isDeleted(),
                community.getUser().getNickname()
        );
    }

    // DTO를 엔티티로 변환
    private Community convertToEntity(CommunityDTO communityDTO) {
        User user = new User();
        user.setId(communityDTO.getUserId());
        return new Community(
                communityDTO.getIdx(),
                user,
                communityDTO.getCategory(),
                communityDTO.getTitle(),
                communityDTO.getContent(),
                communityDTO.getFile(),
                communityDTO.getCreatedAt(),
                communityDTO.getUpdatedAt(),
                communityDTO.getViewCount(),
                communityDTO.getLikeCount(),
                communityDTO.isDeleted()
        );
    }
}