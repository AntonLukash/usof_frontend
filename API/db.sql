CREATE DATABASE IF NOT EXISTS usof_db_alukash;
GRANT ALL PRIVILEGES ON usof_db_alukash.* TO 'alukash'@'localhost';
USE usof_db_alukash;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_picture VARCHAR(255) DEFAULT 'uploads/avatars/default.png',
    rating INT DEFAULT 0,
    role ENUM('user', 'admin') DEFAULT 'user',
    email_confirmed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    content TEXT,
    rating INT DEFAULT 0,
    images JSON DEFAULT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT,
    category_id INT,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    post_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    rating INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    entity_type ENUM('post', 'comment') NOT NULL,
    entity_id INT NOT NULL,
    type ENUM('like', 'dislike') NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_posts (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
-- Вставка пользователей
INSERT INTO users (login, password, full_name, email, profile_picture, rating, role, email_confirmed) VALUES
('user1', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'User One', 'user1@example.com', 'uploads/avatars/undefined-2024-11-29T12-11-04.201Z.png', 15, 'user', 1),
('user2', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'User Two', 'user2@example.com', 'uploads/avatars/default.png', 20, 'user', 1),
('user3', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'User Three', 'user3@example.com', 'uploads/avatars/default.png', 5, 'user', 1),
('admin1', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'Admin One', 'admin1@example.com', 'uploads/avatars/undefined-2024-11-29T12-18-12.854Z.png', 100, 'admin', 1),
('admin2', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'Admin Two', 'admin2@example.com', 'uploads/avatars/default.png', 85, 'admin', 1),
('user4', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'User Four', 'user4@example.com', 'uploads/avatars/undefined-2024-11-29T13-02-24.086Z.png', 12, 'user', 1),
('user5', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'User Five', 'user5@example.com', 'uploads/avatars/default.png', 7, 'user', 1),
('user6', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'User Six', 'user6@example.com', 'uploads/avatars/default.png', 25, 'user', 1),
('user7', '$2b$10$s6F1siTW4B7WtBDTeeSne.rBj2NcJ/OSgZqjzJM.YuReeyxi5kzdW', 'User Seven', 'user7@example.com', 'uploads/avatars/default.png', 18, 'user', 1);

-- Вставка категорий с описаниями
INSERT INTO categories (title, description) VALUES
('Artificial Intelligence', 'Posts about the impact, development, and future of artificial intelligence, including its implications for industries and society.'),
('Technology and Innovation', 'Posts about emerging technologies, innovations, and their impact on various sectors such as robotics, self-driving cars, and renewable energy.'),
('Business and Entrepreneurship', 'Posts that focus on starting and managing businesses, including financial advice, strategy, and success stories from entrepreneurs.'),
('Cryptocurrency and Investment', 'Posts discussing cryptocurrency, blockchain technology, and other financial investments, including risks and strategies.'),
('Health and Wellness', 'Posts that provide advice on maintaining a healthy lifestyle, including fitness, mental health, and wellness topics.'),
('Education and Learning', 'Posts about how technology is transforming education, along with discussions on improving teaching, learning methods, and educational systems.'),
('Climate Change and Sustainability', 'Posts about the role of science and technology in addressing climate change and promoting sustainability.'),
('Entertainment and Pop Culture', 'Posts about the latest trends in movies, music, games, and other entertainment fields, including upcoming releases and reviews.'),
('Sports and Athletic Performance', 'Posts related to sports, athletic events, performance psychology, and the role of fitness in overall well-being.'),
('Personal Growth and Development', 'Posts that discuss personal development strategies, including recommended books, self-improvement, and career growth.');

-- Вставка постов
-- Вставка 20 постов
-- Inserting posts with more detailed content
INSERT INTO posts (author_id, title, content, rating, images) VALUES
(1, 'How Will Artificial Intelligence Change Jobs in the Future?', 
'Artificial intelligence is rapidly evolving, and many industries are already feeling its impact. Some experts predict that entire professions may disappear, while others suggest that new ones will emerge. What do you think? Which jobs are most at risk, and which ones will thrive in an AI-dominated world? How can we prepare for this transformation?', 
10, NULL),
(2, 'What Technologies Could Change Our Future?', 
'From self-driving cars to renewable energy sources, new technologies have the potential to revolutionize every aspect of our lives. Which emerging technologies do you think will have the greatest impact on society in the coming decades? Will they make our lives easier, or introduce new challenges?', 
8, NULL),
(3, 'How Can Technology Improve Education?', 
'With the rapid development of new technologies, there are endless possibilities for improving education. How can AI and other technological advancements help teachers enhance the learning experience for students? Should technology be integrated more into schools, and how can it best serve both students and educators?', 
12, NULL),
(4, 'What Are the Best Movies to Watch in 2024?', 
'2024 is shaping up to be an exciting year for films, with a mix of drama, science fiction, and thrilling genres. What are the top movies you’re looking forward to in 2024? Which genres do you think will dominate the movie scene this year? Let’s discuss the most anticipated films and why they are generating so much buzz.', 
15, NULL),
(5, 'How to Avoid Financial Mistakes When Starting a Business?', 
'Starting a business is always challenging, especially when it comes to managing finances. Many new entrepreneurs make critical financial mistakes, which can lead to failure. What are the most common financial mistakes people make when starting a business, and how can they avoid them? What strategies have worked for you?', 
20, NULL),
(6, 'Is It Worth Investing in Cryptocurrencies?', 
'Cryptocurrency markets are known for their volatility, and the future of digital currencies remains uncertain. Do you think cryptocurrencies are a good long-term investment? What are the risks involved, and how can you minimize them? Are there any cryptocurrencies you believe will succeed in the coming years?', 
25, NULL),
(7, 'How to Choose the Right Diet?', 
'With so many different diets available today, it can be overwhelming to know which one is right for you. From keto to intermittent fasting, each diet promises different results. Have you tried any specific diets that worked for you? What advice do you have for someone looking to adopt a healthier eating plan?', 
18, NULL),
(8, 'What Is the Role of Science in Combating Climate Change?', 
'Climate change is one of the most pressing issues of our time, and science is playing a crucial role in developing solutions. How can scientific innovations help reduce the effects of climate change? What new technologies or research are you most hopeful for in the fight against global warming?', 
30, NULL),
(1, 'What Role Will Robotics Play in the Future?', 
'Robots are already being used in manufacturing, healthcare, and even customer service, but what does the future hold? Do you think robots will become a regular part of our daily lives, and if so, how? Where do you see the most potential for robots to improve our world?', 
12, NULL),
(2, 'What Strategy Should Entrepreneurs Use to Build a Successful Startup?', 
'Building a successful startup requires more than just a good idea. Entrepreneurs need to understand the market, build a strong team, and develop effective strategies to sustain growth. What steps do you think are essential for a startup to thrive? What lessons have you learned in your own entrepreneurial journey?', 
7, NULL),
(3, 'Which Books Should You Read for Personal Growth?', 
'Reading books is one of the best ways to grow both personally and professionally. Whether it’s for self-improvement, business, or leadership, there’s always something new to learn. What books have you read that made the biggest impact on your life? Which books do you recommend for someone looking to improve their skills?', 
9, NULL),
(4, 'Do We Need to Change the Education System in Our Society?', 
'There’s a growing debate about whether the traditional education system is still relevant in the 21st century. Some believe the current model is outdated and doesn’t prepare students for the modern world. What changes do you think are necessary to improve the education system? Should we focus more on practical skills or theoretical knowledge?', 
6, NULL),
(5, 'How to Fight Professional Burnout?', 
'Professional burnout is becoming increasingly common, especially in high-stress jobs. Many people struggle with maintaining a healthy work-life balance. How do you recognize the signs of burnout, and what steps can be taken to avoid it? Have you ever dealt with burnout, and how did you overcome it?', 
22, NULL),
(6, 'Can We Trust Artificial Intelligence?', 
'AI is becoming more integrated into our daily lives, from self-driving cars to virtual assistants. But how much should we trust AI in critical decisions? Is there a risk of over-relying on it, or can AI improve efficiency and accuracy? What concerns do you have about the increasing role of AI in our society?', 
25, NULL),
(7, 'What Video Games Do You Recommend for Relaxation?', 
'Video games aren’t just for entertainment—they can also be a great way to relax and unwind. What games do you recommend for de-stressing after a long day? Which ones offer a calming experience and help you forget about the world for a while?', 
14, NULL),
(8, 'What Are the Most Important Sports Events to Watch in 2024?', 
'From the Olympics to major football tournaments, 2024 will be filled with exciting sports events. Which sports events are you most looking forward to? Are there any underdog teams or athletes you think will make a splash this year?', 
18, NULL),
(1, 'How Can AI Help Improve Healthcare?', 
'Artificial intelligence is making waves in healthcare, from improving diagnostics to personalizing treatment plans. How can AI transform the healthcare industry for the better? Do you think AI will eventually replace doctors, or will it simply be a tool to assist them in providing better care?', 
20, NULL),
(2, 'How to Choose the Right Financial Strategy?', 
'Managing finances is crucial for long-term success, whether it’s for personal savings or running a business. What financial strategies do you recommend for someone starting out? How do you balance risk and reward when making financial decisions?', 
15, NULL),
(3, 'How Important Is Psychology in Sports?', 
'Psychological factors play a major role in athletic performance. From mental toughness to managing stress, athletes need more than just physical strength. How can coaches and teams integrate psychology into their training programs? What techniques have worked for you or your favorite athletes?', 
19, NULL);


-- Привязка категорий к постам
INSERT INTO post_categories (post_id, category_id) VALUES
(1, 1),  -- Artificial Intelligence, Пост 1
(1, 2),  -- Technology and Innovation, Пост 1
(2, 2),  -- Technology and Innovation, Пост 2
(2, 6),  -- Education and Learning, Пост 2
(3, 2),  -- Technology and Innovation, Пост 3
(3, 6),  -- Education and Learning, Пост 3
(4, 8),  -- Entertainment and Pop Culture, Пост 4
(5, 3),  -- Business and Entrepreneurship, Пост 5
(6, 4),  -- Cryptocurrency and Investment, Пост 6
(7, 5),  -- Health and Wellness, Пост 7
(8, 7),  -- Climate Change and Sustainability, Пост 8
(9, 1),  -- Artificial Intelligence, Пост 9
(9, 2),  -- Technology and Innovation, Пост 9
(10, 3), -- Business and Entrepreneurship, Пост 10
(11, 10), -- Personal Growth and Development, Пост 11
(12, 6), -- Education and Learning, Пост 12
(13, 3), -- Business and Entrepreneurship, Пост 13
(14, 1), -- Artificial Intelligence, Пост 14
(15, 5), -- Health and Wellness, Пост 15
(16, 9), -- Sports and Athletic Performance, Пост 16
(17, 4), -- Cryptocurrency and Investment, Пост 17
(18, 7), -- Climate Change and Sustainability, Пост 18
(19, 2); -- Technology and Innovation, Пост 19



-- Вставка комментариев
-- Inserting comments with more depth and engagement
-- Inserting comments with user interactions
INSERT INTO comments (author_id, post_id, content, rating, is_active, parent_id) VALUES
(1, 1, 'This is an exciting read! I believe AI will radically transform entire industries, especially in automation and healthcare. Do you think there will be a significant job displacement in certain sectors, or will new jobs be created in parallel with AI advancements?', 12, TRUE, NULL),
(2, 1, 'I can’t wait for these innovations to come to life! The possibilities for AI in areas like self-driving cars, and even personalized medicine, seem endless. However, how do you think we’ll manage the ethical implications of AI decisions, especially in life-and-death situations?', 15, TRUE, NULL),
(3, 1, 'This article is fascinating! As AI advances, it’s crucial to consider both the potential job losses and the creation of new roles. What kind of jobs do you think will emerge in the AI-driven economy?', 10, TRUE, NULL),
(4, 1, 'Great discussion! I agree AI will replace some jobs, but I think it will also create entirely new sectors. The real challenge will be retraining the workforce to meet these new demands.', 14, TRUE, NULL),
(1, 2, 'This is an interesting question! Technologies like blockchain and renewable energy have so much potential. In your opinion, which technology will have the most positive impact on the environment in the next decade?', 10, TRUE, NULL),
(2, 2, 'I think self-driving cars and renewable energy will lead the charge. But how do you think we can encourage the adoption of these technologies on a global scale, especially in developing countries?', 8, TRUE, NULL),
(3, 2, 'I’m most excited about renewable energy. It’s so important to reduce our dependence on fossil fuels. What kind of initiatives do you think could make green energy more affordable for everyone?', 12, TRUE, NULL),
(4, 3, 'AI in education is a game-changer! It can personalize learning and make education accessible to people around the world. But I wonder, will AI be able to replace human teachers, or will it only complement their work?', 17, TRUE, NULL),
(5, 3, 'Absolutely! I think AI will assist teachers by providing personalized learning paths for students. But there will always be a need for human interaction in education, especially for social and emotional development.', 11, TRUE, NULL),
(6, 3, 'I believe AI will be a powerful tool, but it should never replace teachers entirely. Teachers are mentors, and AI can only support them in delivering content more effectively.', 16, TRUE, NULL),
(7, 4, 'I loved the movie list you put together! I’m particularly looking forward to the sci-fi films this year, but there are so many to choose from. Which movie are you most excited about, and what’s the one you think will be the sleeper hit of 2024?', 19, TRUE, NULL),
(1, 4, 'I’m looking forward to the new superhero movies, but I think there will be some smaller indie films that will surprise us! What do you think makes a movie “underrated”?', 10, TRUE, NULL),
(2, 4, 'I’m most excited about the sci-fi movies! The technology portrayed is always so mind-blowing. Do you think the trend of remakes and reboots will continue, or will there be more original content in the future?', 13, TRUE, NULL),
(3, 5, 'These financial tips are really helpful! It’s so important to start early when building wealth. In your opinion, should new entrepreneurs focus more on securing investors or building up capital through their own savings first?', 20, TRUE, NULL),
(4, 5, 'I agree—personal savings are a solid foundation. But securing investors could bring in much-needed expertise and networks. It’s about finding the right balance between the two.', 15, TRUE, NULL),
(1, 5, 'Starting with savings seems more secure, but it can be slow. At what point should an entrepreneur start looking for investors, and how do you decide whether they’re a good fit for your business?', 14, TRUE, NULL),
(6, 6, 'Cryptocurrency is the future! I think the future of blockchain technology holds massive potential, but it’s still so volatile. How can we convince people to invest in crypto safely, considering the market’s unpredictable nature?', 20, TRUE, NULL),
(7, 6, 'Crypto is definitely exciting, but I’d advise caution. With all the volatility, how can we ensure more people are aware of the risks and avoid falling into scams or FOMO?', 18, TRUE, NULL),
(1, 6, 'The potential is huge, but the market’s unpredictability makes it hard to know where to invest. Do you think regulation will help stabilize the market in the near future?', 25, TRUE, NULL),
(2, 7, 'The gaming industry is evolving so fast, it’s amazing to watch. VR and AR are definitely the next frontiers. I wonder, what do you think will be the next big gaming trend after VR/AR?', 22, TRUE, NULL),
(3, 7, 'I think AI-driven games will be the next big thing! Imagine a game that learns and adapts to your play style. What do you think the role of AI in gaming should be? Should it be just for improving gameplay or also for creating better narratives?', 20, TRUE, NULL),
(4, 7, 'I love the idea of VR and AR in gaming, but I also think mobile gaming will keep growing rapidly. What do you think is the future of mobile gaming as technology improves?', 18, TRUE, NULL),
(5, 8, 'Climate change is a global crisis, and science is key in tackling it. What new technologies or innovations do you think have the greatest potential to slow or reverse its effects?', 30, TRUE, NULL),
(6, 8, 'Renewable energy, definitely! But we need more investment in carbon capture technologies and sustainable agriculture. Do you think governments are doing enough to support this research?', 28, TRUE, NULL),
(7, 8, 'Science has a huge role to play, but I think the real challenge is getting the public to take climate change seriously. How can we make this issue a global priority?', 25, TRUE, NULL),
(1, 9, 'AI is revolutionizing healthcare, but do you think it could replace doctors in some areas? What parts of healthcare do you think will benefit most from AI advancements?', 20, TRUE, NULL),
(2, 9, 'AI in healthcare could be incredible, especially in diagnostics and personalized treatment. Do you think we’ll see widespread use of AI in hospitals within the next 5 years?', 18, TRUE, NULL),
(3, 9, 'AI will definitely play a role, but I don’t think it can replace doctors entirely. There are human aspects of care, like empathy, that AI can’t replicate. How do we balance the two?', 25, TRUE, NULL),
-- Вложенные комментарии
(5, 1, 'I think the ethical implications of AI are crucial to address. In your opinion, how can we ensure that AI is developed with ethical guidelines, especially regarding its use in healthcare?', 22, TRUE, 1),
(6, 1, 'You make an excellent point about job displacement. However, do you think the shift to AI-driven industries could lead to increased inequality if certain sectors are left behind?', 18, TRUE, 2),
(7, 1, 'I believe AI should be developed with a focus on benefiting humanity as a whole. Do you think AI could exacerbate social inequalities, or do you think it could help reduce them in the long run?', 23, TRUE, 3),
(8, 2, 'Blockchain technology offers some intriguing solutions. How do you think it will impact financial systems in the future? Do you think it could become a mainstream tool for decentralized finance?', 21, TRUE, 5),
(9, 2, 'Renewable energy is definitely the future, but what about the infrastructure challenges? How can governments and industries collaborate to ensure global access to clean energy?', 19, TRUE, 6);


-- Вставка лайков
-- Посты
INSERT INTO likes (author_id, entity_type, entity_id, type) VALUES
(1, 'post', 1, 'like'),
(2, 'post', 1, 'like'),
(3, 'post', 1, 'dislike'),
(4, 'post', 2, 'like'),
(5, 'post', 2, 'like'),
(6, 'post', 3, 'dislike'),
(7, 'post', 3, 'like'),
(8, 'post', 4, 'like'),
(1, 'post', 4, 'dislike'),
(2, 'post', 5, 'like'),
(3, 'post', 6, 'like'),
(4, 'post', 7, 'like'),
(5, 'post', 8, 'like'),
(6, 'post', 9, 'like'),
(7, 'post', 10, 'dislike');

-- Комментарии
INSERT INTO likes (author_id, entity_type, entity_id, type) VALUES
(2, 'comment', 1, 'like'),
(3, 'comment', 2, 'like'),
(4, 'comment', 3, 'like'),
(1, 'comment', 4, 'dislike'),
(5, 'comment', 5, 'like'),
(6, 'comment', 6, 'like'),
(7, 'comment', 7, 'like'),
(8, 'comment', 8, 'dislike'),
(9, 'comment', 9, 'like');

-- Вставка сохраненных постов
INSERT INTO saved_posts (user_id, post_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(1, 9),
(2, 10);


