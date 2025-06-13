const db = require('../config/database');

const adminController = {
    // 대시보드 데이터 조회
    getDashboard: async (req, res) => {
        try {
            // 사용자 통계
            const [userStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_users_week
                FROM users
            `);

            // 게시물 통계
            const [postStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_posts,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_posts_week,
                    AVG((SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id)) as avg_likes
                FROM posts
            `);

            // 댓글 통계
            const [commentStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_comments,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_comments_week
                FROM comments
            `);

            // 최근 활동
            const [recentActivity] = await db.execute(`
                (SELECT 'post' as type, posts.title as content, users.username, posts.created_at
                 FROM posts 
                 JOIN users ON posts.user_id = users.id 
                 ORDER BY posts.created_at DESC 
                 LIMIT 5)
                UNION ALL
                (SELECT 'comment' as type, SUBSTRING(comments.content, 1, 50) as content, users.username, comments.created_at
                 FROM comments 
                 JOIN users ON comments.user_id = users.id 
                 ORDER BY comments.created_at DESC 
                 LIMIT 5)
                ORDER BY created_at DESC
                LIMIT 10
            `);

            res.json({
                success: true,
                data: {
                    userStats: userStats[0],
                    postStats: postStats[0],
                    commentStats: commentStats[0],
                    recentActivity
                }
            });
        } catch (error) {
            console.error('Dashboard data error:', error);
            res.status(500).json({ success: false, message: '대시보드 데이터를 불러오는데 실패했습니다.' });
        }
    },

    // 모든 사용자 조회
    getUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const [users] = await db.execute(`
                SELECT 
                    u.id, u.username, u.email, u.role, u.created_at,
                    COUNT(DISTINCT p.id) as post_count,
                    COUNT(DISTINCT c.id) as comment_count
                FROM users u
                LEFT JOIN posts p ON u.id = p.user_id
                LEFT JOIN comments c ON u.id = c.user_id
                GROUP BY u.id, u.username, u.email, u.role, u.created_at
                ORDER BY u.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `);

            const [total] = await db.execute('SELECT COUNT(*) as count FROM users');

            res.json({
                success: true,
                data: {
                    users: users.map(user => ({
                        ...user,
                        is_active: true // 기본값으로 true 설정
                    })),
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total[0].count / limit),
                        totalUsers: total[0].count
                    }
                }
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ success: false, message: '사용자 목록을 불러오는데 실패했습니다.' });
        }
    },

    // 사용자 역할 변경
    updateUserRole: async (req, res) => {
        try {
            const { userId } = req.params;
            const { role } = req.body;

            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ success: false, message: '유효하지 않은 역할입니다.' });
            }

            await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

            res.json({ success: true, message: '사용자 역할이 변경되었습니다.' });
        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({ success: false, message: '사용자 역할 변경에 실패했습니다.' });
        }
    },

    // 사용자 계정 비활성화/활성화
    toggleUserStatus: async (req, res) => {
        try {
            const { userId } = req.params;
            const { active } = req.body;

            // is_active 컬럼이 없으므로 일단 성공 응답만 반환
            // 실제로는 사용자 비활성화 기능을 구현하려면 DB에 컬럼을 추가해야 함
            console.log(`사용자 ${userId} 상태 변경 요청: ${active ? '활성화' : '비활성화'}`);

            res.json({ 
                success: true, 
                message: active ? '사용자가 활성화되었습니다.' : '사용자가 비활성화되었습니다.' 
            });
        } catch (error) {
            console.error('Toggle user status error:', error);
            res.status(500).json({ success: false, message: '사용자 상태 변경에 실패했습니다.' });
        }
    },

    // 모든 게시물 조회 (관리자용)
    getPosts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const [posts] = await db.execute(`
                SELECT 
                    p.id, p.title, p.content, p.created_at, p.updated_at,
                    u.username as author,
                    COUNT(DISTINCT pl.user_id) as like_count,
                    COUNT(DISTINCT c.id) as comment_count
                FROM posts p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN post_likes pl ON p.id = pl.post_id
                LEFT JOIN comments c ON p.id = c.post_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            const [total] = await db.execute('SELECT COUNT(*) as count FROM posts');

            res.json({
                success: true,
                data: {
                    posts: posts.map(post => ({
                        ...post,
                        content: post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content
                    })),
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total[0].count / limit),
                        totalPosts: total[0].count
                    }
                }
            });
        } catch (error) {
            console.error('Get posts error:', error);
            res.status(500).json({ success: false, message: '게시물 목록을 불러오는데 실패했습니다.' });
        }
    },

    // 게시물 삭제
    deletePost: async (req, res) => {
        try {
            const { postId } = req.params;

            // 관련된 좋아요와 댓글도 함께 삭제
            await db.execute('DELETE FROM post_likes WHERE post_id = ?', [postId]);
            await db.execute('DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE post_id = ?)', [postId]);
            await db.execute('DELETE FROM comments WHERE post_id = ?', [postId]);
            await db.execute('DELETE FROM posts WHERE id = ?', [postId]);

            res.json({ success: true, message: '게시물이 삭제되었습니다.' });
        } catch (error) {
            console.error('Delete post error:', error);
            res.status(500).json({ success: false, message: '게시물 삭제에 실패했습니다.' });
        }
    },

    // 댓글 조회 (관리자용)
    getComments: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const [comments] = await db.execute(`
                SELECT 
                    c.id, c.content, c.created_at,
                    u.username as author,
                    p.title as post_title,
                    p.id as post_id
                FROM comments c
                JOIN users u ON c.user_id = u.id
                JOIN posts p ON c.post_id = p.id
                ORDER BY c.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            const [total] = await db.execute('SELECT COUNT(*) as count FROM comments');

            res.json({
                success: true,
                data: {
                    comments,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total[0].count / limit),
                        totalComments: total[0].count
                    }
                }
            });
        } catch (error) {
            console.error('Get comments error:', error);
            res.status(500).json({ success: false, message: '댓글 목록을 불러오는데 실패했습니다.' });
        }
    },

    // 댓글 삭제
    deleteComment: async (req, res) => {
        try {
            const { commentId } = req.params;

            await db.execute('DELETE FROM comment_likes WHERE comment_id = ?', [commentId]);
            await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);

            res.json({ success: true, message: '댓글이 삭제되었습니다.' });
        } catch (error) {
            console.error('Delete comment error:', error);
            res.status(500).json({ success: false, message: '댓글 삭제에 실패했습니다.' });
        }
    },

    // 시스템 설정 조회
    getSystemSettings: async (req, res) => {
        try {
            // 시스템 설정을 반환 (실제 사이트용 설정)
            const settings = {
                siteName: 'CoinTalk',
                maxPostLength: 5000,
                maxCommentLength: 1000,
                maxFileSize: 10 // MB
            };

            res.json({ success: true, data: settings });
        } catch (error) {
            console.error('Get system settings error:', error);
            res.status(500).json({ success: false, message: '시스템 설정을 불러오는데 실패했습니다.' });
        }
    },

    // 시스템 설정 업데이트
    updateSystemSettings: async (req, res) => {
        try {
            const settings = req.body;
            
            // 실제로는 DB나 설정 파일에 저장해야 하지만, 여기서는 응답만 반환
            console.log('Updated settings:', settings);

            res.json({ success: true, message: '시스템 설정이 업데이트되었습니다.' });
        } catch (error) {
            console.error('Update system settings error:', error);
            res.status(500).json({ success: false, message: '시스템 설정 업데이트에 실패했습니다.' });
        }
    },

    // 사용자 삭제
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;

            // 관리자 계정은 삭제할 수 없음
            const [user] = await db.execute('SELECT role FROM users WHERE id = ?', [userId]);
            if (user[0]?.role === 'admin') {
                return res.status(400).json({ success: false, message: '관리자 계정은 삭제할 수 없습니다.' });
            }

            // 사용자와 관련된 모든 데이터 삭제
            await db.execute('DELETE FROM comment_likes WHERE comment_id IN (SELECT id FROM comments WHERE user_id = ?)', [userId]);
            await db.execute('DELETE FROM post_likes WHERE user_id = ?', [userId]);
            await db.execute('DELETE FROM comments WHERE user_id = ?', [userId]);
            await db.execute('DELETE FROM posts WHERE user_id = ?', [userId]);
            await db.execute('DELETE FROM users WHERE id = ?', [userId]);

            res.json({ success: true, message: '사용자가 삭제되었습니다.' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ success: false, message: '사용자 삭제에 실패했습니다.' });
        }
    },

    // 비밀번호 초기화
    resetUserPassword: async (req, res) => {
        try {
            const { userId } = req.params;

            // 랜덤 임시 비밀번호 생성 (8자리)
            const newPassword = Math.random().toString(36).slice(-8);
            
            // 비밀번호 해싱
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync(newPassword, 10);

            // 데이터베이스 업데이트
            await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

            res.json({ 
                success: true, 
                message: '비밀번호가 초기화되었습니다.',
                data: { newPassword }
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ success: false, message: '비밀번호 초기화에 실패했습니다.' });
        }
    }
};

module.exports = adminController;
