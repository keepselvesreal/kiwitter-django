import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Avatar, Box, TextField, Link } from '@mui/material';
import TweetActions from './tweetActions'; // 이 컴포넌트는 트윗의 액션 버튼들을 관리합니다.
import CommentsSection from './commentSection'; // 이 컴포넌트는 트윗의 댓글 섹션을 관리합니다.
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Tweet({ tweet, refreshTweets, onBookmarkToggle, onTweetUpdate }) {
    // console.log(tweet)
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(tweet.content);
    const [showComments, setShowComments] = useState(false);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(tweet.isLiked);
    const [likesCount, setLikesCount] = useState(tweet.likes.length);
    const [isBookmarked, setIsBookmarked] = useState(tweet.isBookmarked);
    const [isFollowing, setIsFollowing] = useState(tweet.isFollowing);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const accessToken = localStorage.getItem("access token");
    const currentUser = localStorage.getItem("username");
    const navigate = useNavigate();
    // 댓글 추가 성공 후 CommentsSection의 댓글 목록을 업데이트하기 위한 상태 변수 추가
    const [commentsUpdated, setCommentsUpdated] = useState(false);

    // 편집 모드 진입 처리
    const handleEditClick = () => setIsEditing(true);

    // 편집 취소 처리
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(tweet.content); // 편집 내용을 원래대로 리셋
    };

    // TextField 내용 업데이트 처리
    const handleContentChange = (e) => setEditContent(e.target.value);

    // 편집 저장 처리
    const handleSaveEdit = async () => {
        try {
            // 트윗 수정 API 호출
            const response = await axios.patch(`http://localhost:8000/tweets/${tweet.id}/`, {
                content: editContent
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
    
            // 편집 모드 종료
            setIsEditing(false);
    
            // 수정된 트윗 데이터를 상위 컴포넌트에 반영하기 위한 호출
            // 이 부분은 예시로 refreshTweets() 함수를 호출하는 것입니다.
            // 실제 구현에서는 수정된 트윗 데이터를 직접 관리할 수도 있습니다.
            refreshTweets();
    
            // 선택적으로, 수정된 트윗 내용을 직접 로컬 상태에 반영할 수도 있습니다.
            // 이를 위해서는 상위 컴포넌트에서 현재 트윗의 상태를 관리하는 로직이 필요합니다.
            // 예: onTweetUpdate(tweet.id, response.data);
    
        } catch (error) {
            console.error('트윗 수정 중 오류 발생:', error);
            // 에러 처리 로직 추가 (예: 사용자에게 에러 메시지 표시)
        }
    };

    const handleTweetDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/tweets/${tweet.id}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            refreshTweets(); // 트윗 삭제 후 목록 새로고침
        } catch (error) {
            console.error('트윗 삭제 중 오류 발생:', error);
        }
    };

    // 댓글 달기 기능 구현
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axios.post(`http://localhost:8000/tweets/${tweet.id}/comments/`, { content: newComment }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setNewComment("");
            setShowCommentInput(false);
            // refreshTweets(); // 댓글 추가 후 목록 새로고침
            setCommentsUpdated(!commentsUpdated); // 댓글 추가 후 CommentsSection의 댓글 목록 업데이트 트리거
        } catch (error) {
            console.error('댓글 달기 중 오류:', error);
        }
    };

    // 좋아요 수를 불러오는 함수
    const fetchLikesCount = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/tweets/${tweet.id}/likes/count/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            setLikesCount(response.data.likes_count);
        } catch (error) {
            console.error('Error fetching likes count', error);
        }
    };

    // 좋아요 토글
    const handleLike = async () => {
        try {
            await axios.post(`http://localhost:8000/api/tweets/${tweet.id}/toggle_like/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setIsLiked(!isLiked); // 상태 토글
            fetchLikesCount();
            refreshTweets(); // 트윗 목록 새로고침
        } catch (error) {
            console.error('좋아요 처리 중 오류 발생:', error);
        }
    };

    useEffect(() => {
        fetchLikesCount(); // 컴포넌트 마운트 시 좋아요 수 불러오기
    }, [tweet.id]);

    // 북마크 토글
    const handleBookmark = async () => {
        try {
            await axios.post(`http://localhost:8000/api/tweets/${tweet.id}/toggle_bookmark/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setIsBookmarked(!isBookmarked);
            onBookmarkToggle && onBookmarkToggle(tweet.id);
            refreshTweets(); // 트윗 목록 새로고침
        } catch (error) {
            console.error('북마크 처리 중 오류 발생:', error);
        }
    };

    // 팔로우/언팔로우 토글
    const handleFollowToggle = async () => {
        console.log("tweet", tweet)
        const url = isFollowing ? `http://localhost:8000/api/unfollow/${tweet.author.id}/` : `http://localhost:8000/api/follow/${tweet.author.id}/`;
        try {
            await axios.post(url, {}, { headers: { 'Authorization': `Bearer ${accessToken}` }});
            setIsFollowing(!isFollowing);
            refreshTweets(); // 트윗 목록 새로고침
        } catch (error) {
            console.error(tweet.isFollowing ? '언팔로우 처리 중 오류:' : '팔로우 처리 중 오류:', error);
        }
    };

    // 트윗에 이미지 URL이 있을 경우 이미지를 렌더링하기 위한 조건부 렌더링 로직 추가
    const renderTweetImage = () => {
        // 트윗 객체 내의 이미지 URL이 있는 경우에만 이미지 태그를 렌더링합니다.
        // tweet.imageUrl를 tweet 객체 내의 이미지 URL을 가리키는 실제 속성명으로 변경해야 할 수 있습니다.
        if (tweet.images && tweet.images.length > 0) {
            return (
                <Box sx={{ my: 2, display: 'flex', justifyContent: 'center'}}>
                    {tweet.images.map((image, index) => (
                    <img 
                        key={index} 
                        src={`${image.image}`}
                        alt={`Tweet ${index}`} 
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} />
                ))}
                </Box>
            );
        }
    };

    const parseHashtags = (content) => {
        return content.split(/(\s+)/).map((part, index) => {
            if (part.startsWith('#')) {
                // 해시태그를 클릭했을 때 이벤트 처리
                return (
                    <Link
                        key={index}
                        component="button"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/hashtags/${part.slice(1)}`);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    // 댓글 보기/숨기기 토글 함수
    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const [commentsCount, setCommentsCount] = useState(0);

    // API에서 댓글 개수를 가져오는 함수
    const fetchCommentsCount = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/tweets/${tweet.id}/comments-count/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            setCommentsCount(response.data.comments_count); // 가정: API 응답이 { count: 댓글 개수 } 형태라고 가정
        } catch (error) {
            console.error('댓글 개수를 가져오는 중 오류 발생:', error);
        }
    };

    const handleAvatarClick = () => {
        navigate('/profile');
    };

    useEffect(() => {
        fetchCommentsCount();
    }, [tweet.id]); // tweet.id가 변경될 때마다 댓글 개수를 가져옴


    useEffect(() => {
        // 댓글 목록 초기 로딩 로직은 유지
    }, [showComments, tweet.id]); // 댓글 보기 상태 변경 시 댓글 목록 갱신

    useEffect(() => {
        // 좋아요 상태를 가져오는 함수
        const fetchLikedStatus = async () => {
            try {
                // API 요청을 통해 좋아요 상태 확인
                const response = await axios.get(`http://localhost:8000/api/tweets/${tweet.id}/is_liked/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                // response.data.is_liked 대신 올바른 필드명으로 수정
                setIsLiked(response.data.is_liked);
            } catch (error) {
                console.error('좋아요 상태 가져오기 실패:', error);
            }
        };
    
        // 북마크 상태를 가져오는 함수
        const fetchBookmarkedStatus = async () => {
            try {
                // API 요청을 통해 북마크 상태 확인
                const response = await axios.get(`http://localhost:8000/api/tweets/${tweet.id}/is_bookmarked/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                // response.data.is_bookmarked 대신 올바른 필드명으로 수정
                setIsBookmarked(response.data.is_bookmarked);
            } catch (error) {
                console.error('북마크 상태 가져오기 실패:', error);
            }
        };

        const fetchFollowingStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users/${tweet.author.id}/is_following/`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                // response.data.is_bookmarked 대신 올바른 필드명으로 수정
                setIsFollowing(response.data.is_following);
            } catch (error) {
                console.error('팔로우 상태 가져오기 실패:', error);
            }
        };
    
        fetchLikedStatus();
        fetchBookmarkedStatus();
        fetchFollowingStatus();
    }, [tweet.id, tweet.author.id,]); 

    return (
        <Card sx={{ marginBottom: 2, width: "60%" }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={tweet.authorProfileImageUrl} alt="Author" onClick={handleAvatarClick} />
                    <Typography variant="body1">{tweet.author.username}</Typography>
                </Box>
                {isEditing ? (
                    <TextField
                        fullWidth
                        multiline
                        value={editContent}
                        onChange={handleContentChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { // shift + enter는 줄바꿈을 위해 예외 처리
                                e.preventDefault(); // 폼 제출 방지
                                handleSaveEdit();
                            }
                        }}
                        margin="dense"
                    />
                ) : (
                    <>
                        <Typography>{parseHashtags(tweet.content)}</Typography>
                        {renderTweetImage()} 
                    </>
                    
                )}
                <Typography variant="body2">좋아요 {likesCount}명</Typography>
                <TweetActions
                    currentUser={currentUser}
                    tweetAuthor={tweet.author.username}
                    onEdit={handleEditClick}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onDelete={handleTweetDelete}
                    isEditing={isEditing}
                    isLiked={isLiked}
                    isBookmarked={isBookmarked}
                    isFollowing={isFollowing}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onFollowToggle={handleFollowToggle}
                />
                <Box>
                    <Button onClick={toggleComments}>
                        {showComments ? `댓글 접기` : `댓글(${commentsCount}) 펴기`}
                    </Button>
                    {showComments && (
                        <Box>
                            <TextField 
                                fullWidth 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault(); // 폼 제출 방지
                                        handleCommentSubmit(e);
                                    }
                                }}
                                placeholder="댓글을 입력하세요" 
                                size="small" 
                            />
                            <Button onClick={handleCommentSubmit}>입력</Button>
                            <Button
                                onClick={() => {
                                    setNewComment("");
                                    setShowCommentInput(false);
                                }}
                                >
                                취소
                            </Button>
                        </Box>
                    )}
                    {showComments && <CommentsSection tweetId={tweet.id} commentsUpdated={commentsUpdated} />}
                </Box>
            </CardContent>
        </Card>
    );
}

export default Tweet;


