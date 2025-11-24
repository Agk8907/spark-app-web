// Mock Data for Social Feed Demo
export const users = [
  {
    id: '1',
    username: 'sarah_designs',
    name: 'Sarah Anderson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'UI/UX Designer | Coffee lover ☕ | Creating beautiful digital experiences',
    followers: 12400,
    following: 856,
    posts: 342,
    isOnline: true,
  },
  {
    id: '2',
    username: 'mike_travels',
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Travel photographer 📸 | Exploring the world one photo at a time',
    followers: 8920,
    following: 432,
    posts: 567,
    isOnline: false,
  },
  {
    id: '3',
    username: 'emma_codes',
    name: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Full-stack developer 💻 | Open source enthusiast | Building cool things',
    followers: 15600,
    following: 1203,
    posts: 289,
    isOnline: true,
  },
  {
    id: '4',
    username: 'alex_fitness',
    name: 'Alex Martinez',
    avatar: 'https://i.pravatar.cc/150?img=8',
    bio: 'Fitness coach 💪 | Nutrition geek | Helping you reach your goals',
    followers: 24100,
    following: 567,
    posts: 891,
    isOnline: true,
  },
  {
    id: '5',
    username: 'lisa_foodie',
    name: 'Lisa Chen',
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: 'Food blogger 🍕 | Recipe creator | Making cooking fun and easy',
    followers: 18700,
    following: 934,
    posts: 456,
    isOnline: false,
  },
];

export const posts = [
  {
    id: 'p1',
    userId: '1',
    type: 'text',
    content: 'Just finished redesigning our mobile app! The new interface focuses on simplicity and user experience. Sometimes less is more ✨',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 342,
    comments: 28,
    shares: 15,
    isLiked: false,
  },
  {
    id: 'p2',
    userId: '2',
    type: 'image',
    content: 'Sunrise at the Grand Canyon. Nature never fails to amaze me 🌄',
    image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likes: 1203,
    comments: 67,
    shares: 89,
    isLiked: true,
  },
  {
    id: 'p3',
    userId: '3',
    type: 'text',
    content: 'Pro tip: Write code that your future self will thank you for. Clean code is happy code! 💻✨',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    likes: 567,
    comments: 94,
    shares: 123,
    isLiked: false,
  },
  {
    id: 'p4',
    userId: '4',
    type: 'image',
    content: 'Morning workout complete! Remember: consistency beats perfection every time 💪',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    likes: 892,
    comments: 45,
    shares: 34,
    isLiked: true,
  },
  {
    id: 'p5',
    userId: '5',
    type: 'image',
    content: 'Homemade pizza night! 🍕 Recipe coming to the blog tomorrow. Who else loves making pizza from scratch?',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    likes: 1456,
    comments: 123,
    shares: 78,
    isLiked: false,
  },
  {
    id: 'p6',
    userId: '1',
    type: 'text',
    content: 'Design is not just what it looks like and feels like. Design is how it works. - Steve Jobs',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    likes: 678,
    comments: 34,
    shares: 56,
    isLiked: true,
  },
  {
    id: 'p7',
    userId: '3',
    type: 'image',
    content: 'Working on something exciting! Can\'t wait to share it with you all 🚀',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000), // 1.25 days ago
    likes: 423,
    comments: 56,
    shares: 23,
    isLiked: false,
  },
];

export const comments = {
  p1: [
    {
      id: 'c1',
      userId: '3',
      content: 'Looks amazing! Would love to see a case study on this.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 'c2',
      userId: '4',
      content: 'The attention to detail is impressive! 👏',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
  ],
  p2: [
    {
      id: 'c3',
      userId: '1',
      content: 'Absolutely stunning! Adding this to my bucket list.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'c4',
      userId: '5',
      content: 'The colors in this shot are incredible! 😍',
      timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
    },
  ],
  p3: [
    {
      id: 'c5',
      userId: '2',
      content: 'So true! Documentation is also key.',
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
    },
  ],
};

export const notifications = [
  {
    id: 'n1',
    type: 'like',
    userId: '2',
    postId: 'p1',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    read: false,
  },
  {
    id: 'n2',
    type: 'comment',
    userId: '3',
    postId: 'p1',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    read: false,
  },
  {
    id: 'n3',
    type: 'follow',
    userId: '4',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
  },
  {
    id: 'n4',
    type: 'like',
    userId: '5',
    postId: 'p6',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true,
  },
];

export const currentUser = users[0]; // Sarah is the logged-in user

export default { users, posts, comments, notifications, currentUser };
