package com.linguagen.service;

import com.linguagen.dto.CommunityDTO;
import com.linguagen.entity.Community;
import com.linguagen.entity.User;
import com.linguagen.repository.CommunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommunityService {

    @Autowired
    private CommunityRepository repository;
    @Autowired
    private CommunityRepository communityRepository;

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

    // 게시글 조회 (단일)
    public Optional<CommunityDTO> getCommunityByIdx(Long idx) {
        return repository.findById(idx).map(this::convertToDTO);
    }

    // 게시글 전체 조회
    public List<CommunityDTO> getAllCommunityPosts() {
        List<Community> communities = repository.findAll();
        return communities.stream().map(this::convertToDTO).toList();
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

    // 제목으로 검색
    public List<CommunityDTO> searchPostsByTitle(String title) {
        List<Community> communities = repository.findByTitleContaining(title);
        return communities.stream().map(this::convertToDTO).toList();
    }

    // 글 작성자 회원 아이디로 검색
    public List<CommunityDTO> searchPostsByUserId(String userId) {
        List<Community> communities = repository.findByUserId(userId);
        return communities.stream().map(this::convertToDTO).toList();
    }

    // 글 작성자 닉네임으로 검색
    public List<CommunityDTO> searchPostsByNickname(String nickname) {
        List<Community> communities = repository.findByUserNicknameContaining(nickname);
        return communities.stream().map(this::convertToDTO).toList();
    }

    // 카테고리별로 최신 글 4개 가져오기
    public List<CommunityDTO> getLatestPostsByCategory(String category) {
        List<Community> latestPosts = communityRepository.findTop4ByCategoryOrderByCreatedAtDesc(category);
        return latestPosts.stream().map(this::convertToDTO).toList();
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