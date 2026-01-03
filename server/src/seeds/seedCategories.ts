// src/seeds/seedCategories.ts
import mongoose from "mongoose";
import { env } from "src/configs/env.js";
import { CategoryModel } from "src/models/category.model.js";
import logger from "src/utils/logger.js";

// ==================== CATEGORY DATA ====================
interface CategorySeed {
    name: string;
    slug: string;
    description: string;
    icon: string;
    isFeatured?: boolean;
    order: number;
    subcategories?: SubcategorySeed[];
}

interface SubcategorySeed {
    name: string;
    slug: string;
    description: string;
    icon?: string;
    order: number;
}

const CATEGORIES: CategorySeed[] = [
    {
        name: "Development",
        slug: "development",
        description: "Learn programming, web development, mobile apps, and software engineering",
        icon: "💻",
        isFeatured: true,
        order: 1,
        subcategories: [
            {
                name: "Web Development",
                slug: "web-development",
                description: "HTML, CSS, JavaScript, React, Node.js, and modern web technologies",
                icon: "🌐",
                order: 1,
            },
            {
                name: "Mobile Development",
                slug: "mobile-development",
                description: "iOS, Android, React Native, Flutter, and cross-platform development",
                icon: "📱",
                order: 2,
            },
            {
                name: "Programming Languages",
                slug: "programming-languages",
                description: "Python, JavaScript, Java, C++, Go, Rust, and more",
                icon: "⌨️",
                order: 3,
            },
            {
                name: "Game Development",
                slug: "game-development",
                description: "Unity, Unreal Engine, game design, and interactive entertainment",
                icon: "🎮",
                order: 4,
            },
            {
                name: "Database Design",
                slug: "database-design",
                description: "SQL, NoSQL, MongoDB, PostgreSQL, and database management",
                icon: "🗄️",
                order: 5,
            },
            {
                name: "Software Testing",
                slug: "software-testing",
                description: "QA, automation testing, Selenium, Jest, and testing methodologies",
                icon: "🧪",
                order: 6,
            },
        ],
    },
    {
        name: "Data Science",
        slug: "data-science",
        description: "Data analysis, machine learning, AI, and statistical modeling",
        icon: "📊",
        isFeatured: true,
        order: 2,
        subcategories: [
            {
                name: "Machine Learning",
                slug: "machine-learning",
                description: "ML algorithms, neural networks, and predictive modeling",
                icon: "🤖",
                order: 1,
            },
            {
                name: "Data Analysis",
                slug: "data-analysis",
                description: "Data visualization, pandas, Excel, and business analytics",
                icon: "📈",
                order: 2,
            },
            {
                name: "Artificial Intelligence",
                slug: "artificial-intelligence",
                description: "Deep learning, NLP, computer vision, and AI applications",
                icon: "🧠",
                order: 3,
            },
            {
                name: "Python for Data Science",
                slug: "python-data-science",
                description: "NumPy, pandas, scikit-learn, and Python data tools",
                icon: "🐍",
                order: 4,
            },
            {
                name: "Big Data",
                slug: "big-data",
                description: "Hadoop, Spark, data pipelines, and distributed computing",
                icon: "💾",
                order: 5,
            },
        ],
    },
    {
        name: "Business",
        slug: "business",
        description: "Entrepreneurship, management, finance, and business skills",
        icon: "💼",
        isFeatured: true,
        order: 3,
        subcategories: [
            {
                name: "Entrepreneurship",
                slug: "entrepreneurship",
                description: "Starting a business, startup fundamentals, and business planning",
                icon: "🚀",
                order: 1,
            },
            {
                name: "Communication",
                slug: "communication",
                description: "Public speaking, presentation skills, and business writing",
                icon: "🎤",
                order: 2,
            },
            {
                name: "Management",
                slug: "management",
                description: "Leadership, team management, and organizational skills",
                icon: "👔",
                order: 3,
            },
            {
                name: "Sales",
                slug: "sales",
                description: "Sales techniques, negotiation, and customer relations",
                icon: "🤝",
                order: 4,
            },
            {
                name: "Strategy",
                slug: "business-strategy",
                description: "Business strategy, competitive analysis, and planning",
                icon: "♟️",
                order: 5,
            },
        ],
    },
    {
        name: "Finance & Accounting",
        slug: "finance-accounting",
        description: "Financial management, accounting, investing, and taxation",
        icon: "💰",
        isFeatured: true,
        order: 4,
        subcategories: [
            {
                name: "Accounting",
                slug: "accounting",
                description: "Bookkeeping, financial statements, and accounting principles",
                icon: "📒",
                order: 1,
            },
            {
                name: "Investing",
                slug: "investing",
                description: "Stock market, portfolio management, and investment strategies",
                icon: "📊",
                order: 2,
            },
            {
                name: "Cryptocurrency",
                slug: "cryptocurrency",
                description: "Bitcoin, blockchain, DeFi, and crypto trading",
                icon: "₿",
                order: 3,
            },
            {
                name: "Financial Modeling",
                slug: "financial-modeling",
                description: "Excel modeling, valuations, and financial analysis",
                icon: "📐",
                order: 4,
            },
            {
                name: "Taxation",
                slug: "taxation",
                description: "Tax planning, GST, income tax, and compliance",
                icon: "🧾",
                order: 5,
            },
        ],
    },
    {
        name: "Design",
        slug: "design",
        description: "Graphic design, UX/UI, 3D modeling, and creative arts",
        icon: "🎨",
        isFeatured: true,
        order: 5,
        subcategories: [
            {
                name: "UI/UX Design",
                slug: "ui-ux-design",
                description: "User interface, user experience, Figma, and prototyping",
                icon: "📱",
                order: 1,
            },
            {
                name: "Graphic Design",
                slug: "graphic-design",
                description: "Photoshop, Illustrator, branding, and visual design",
                icon: "🖼️",
                order: 2,
            },
            {
                name: "Web Design",
                slug: "web-design",
                description: "Website design, responsive design, and CSS",
                icon: "🌐",
                order: 3,
            },
            {
                name: "3D & Animation",
                slug: "3d-animation",
                description: "Blender, Maya, 3D modeling, and motion graphics",
                icon: "🎬",
                order: 4,
            },
            {
                name: "Design Tools",
                slug: "design-tools",
                description: "Figma, Adobe XD, Sketch, and design software",
                icon: "🛠️",
                order: 5,
            },
        ],
    },
    {
        name: "Marketing",
        slug: "marketing",
        description: "Digital marketing, SEO, social media, and branding",
        icon: "📣",
        isFeatured: true,
        order: 6,
        subcategories: [
            {
                name: "Digital Marketing",
                slug: "digital-marketing",
                description: "Online marketing strategies, campaigns, and analytics",
                icon: "💻",
                order: 1,
            },
            {
                name: "Social Media Marketing",
                slug: "social-media-marketing",
                description: "Instagram, Facebook, LinkedIn, and social strategies",
                icon: "📱",
                order: 2,
            },
            {
                name: "SEO",
                slug: "seo",
                description: "Search engine optimization, keywords, and ranking",
                icon: "🔍",
                order: 3,
            },
            {
                name: "Content Marketing",
                slug: "content-marketing",
                description: "Blogging, copywriting, and content strategy",
                icon: "✍️",
                order: 4,
            },
            {
                name: "Paid Advertising",
                slug: "paid-advertising",
                description: "Google Ads, Facebook Ads, and PPC campaigns",
                icon: "💵",
                order: 5,
            },
        ],
    },
    {
        name: "IT & Software",
        slug: "it-software",
        description: "Cloud computing, DevOps, networking, and IT certifications",
        icon: "🖥️",
        isFeatured: true,
        order: 7,
        subcategories: [
            {
                name: "Cloud Computing",
                slug: "cloud-computing",
                description: "AWS, Azure, Google Cloud, and cloud architecture",
                icon: "☁️",
                order: 1,
            },
            {
                name: "DevOps",
                slug: "devops",
                description: "CI/CD, Docker, Kubernetes, and automation",
                icon: "🔄",
                order: 2,
            },
            {
                name: "Cybersecurity",
                slug: "cybersecurity",
                description: "Ethical hacking, security, and penetration testing",
                icon: "🔒",
                order: 3,
            },
            {
                name: "Networking",
                slug: "networking",
                description: "Network administration, protocols, and infrastructure",
                icon: "🌐",
                order: 4,
            },
            {
                name: "IT Certifications",
                slug: "it-certifications",
                description: "CompTIA, Cisco, AWS certifications, and more",
                icon: "📜",
                order: 5,
            },
        ],
    },
    {
        name: "Personal Development",
        slug: "personal-development",
        description: "Productivity, leadership, career development, and soft skills",
        icon: "🌱",
        isFeatured: false,
        order: 8,
        subcategories: [
            {
                name: "Leadership",
                slug: "leadership",
                description: "Leadership skills, management, and team building",
                icon: "👑",
                order: 1,
            },
            {
                name: "Productivity",
                slug: "productivity",
                description: "Time management, focus, and efficiency",
                icon: "⏰",
                order: 2,
            },
            {
                name: "Career Development",
                slug: "career-development",
                description: "Career planning, job search, and professional growth",
                icon: "📈",
                order: 3,
            },
            {
                name: "Communication Skills",
                slug: "communication-skills",
                description: "Public speaking, writing, and interpersonal skills",
                icon: "💬",
                order: 4,
            },
        ],
    },
    {
        name: "Photography & Video",
        slug: "photography-video",
        description: "Photography, video production, editing, and visual storytelling",
        icon: "📷",
        isFeatured: false,
        order: 9,
        subcategories: [
            {
                name: "Photography",
                slug: "photography",
                description: "Camera skills, lighting, and photo composition",
                icon: "📸",
                order: 1,
            },
            {
                name: "Video Production",
                slug: "video-production",
                description: "Filming, directing, and video creation",
                icon: "🎥",
                order: 2,
            },
            {
                name: "Video Editing",
                slug: "video-editing",
                description: "Premiere Pro, Final Cut, DaVinci Resolve, and editing",
                icon: "🎞️",
                order: 3,
            },
        ],
    },
    {
        name: "Health & Fitness",
        slug: "health-fitness",
        description: "Wellness, nutrition, yoga, and mental health",
        icon: "🏃",
        isFeatured: false,
        order: 10,
        subcategories: [
            {
                name: "Fitness",
                slug: "fitness",
                description: "Exercise, workouts, and physical training",
                icon: "💪",
                order: 1,
            },
            {
                name: "Nutrition",
                slug: "nutrition",
                description: "Diet, healthy eating, and nutrition science",
                icon: "🥗",
                order: 2,
            },
            {
                name: "Yoga & Meditation",
                slug: "yoga-meditation",
                description: "Yoga practice, meditation, and mindfulness",
                icon: "🧘",
                order: 3,
            },
            {
                name: "Mental Health",
                slug: "mental-health",
                description: "Stress management, anxiety, and mental wellness",
                icon: "🧠",
                order: 4,
            },
        ],
    },
    {
        name: "Music",
        slug: "music",
        description: "Music production, instruments, singing, and audio engineering",
        icon: "🎵",
        isFeatured: false,
        order: 11,
        subcategories: [
            {
                name: "Music Production",
                slug: "music-production",
                description: "DAWs, mixing, mastering, and audio production",
                icon: "🎧",
                order: 1,
            },
            {
                name: "Instruments",
                slug: "instruments",
                description: "Guitar, piano, drums, and other instruments",
                icon: "🎸",
                order: 2,
            },
            {
                name: "Singing",
                slug: "singing",
                description: "Vocal training, techniques, and performance",
                icon: "🎤",
                order: 3,
            },
        ],
    },
    {
        name: "Teaching & Academics",
        slug: "teaching-academics",
        description: "Teaching skills, academic subjects, and exam preparation",
        icon: "📚",
        isFeatured: false,
        order: 12,
        subcategories: [
            {
                name: "Engineering",
                slug: "engineering",
                description: "Engineering subjects and technical education",
                icon: "⚙️",
                order: 1,
            },
            {
                name: "Math",
                slug: "math",
                description: "Mathematics, calculus, statistics, and algebra",
                icon: "➗",
                order: 2,
            },
            {
                name: "Science",
                slug: "science",
                description: "Physics, chemistry, biology, and natural sciences",
                icon: "🔬",
                order: 3,
            },
            {
                name: "Test Prep",
                slug: "test-prep",
                description: "GATE, CAT, GRE, GMAT, and competitive exams",
                icon: "📝",
                order: 4,
            },
            {
                name: "Language Learning",
                slug: "language-learning",
                description: "English, Hindi, foreign languages, and linguistics",
                icon: "🗣️",
                order: 5,
            },
        ],
    },
];

// ==================== SEED FUNCTION ====================
async function seedCategories() {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info("🟢 MongoDB connected for seeding categories...");

        // Clear existing categories (optional - comment out if you want to preserve existing data)
        // await CategoryModel.deleteMany({});
        // logger.info("🗑️ Cleared existing categories");

        let totalCreated = 0;
        let totalSkipped = 0;

        for (const category of CATEGORIES) {
            // Check if parent category exists
            let parentCategory = await CategoryModel.findOne({ slug: category.slug });

            if (!parentCategory) {
                parentCategory = await CategoryModel.create({
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    icon: category.icon,
                    level: 0,
                    order: category.order,
                    isFeatured: category.isFeatured || false,
                    isActive: true,
                    parent: null,
                });
                logger.info(`✅ Created category: ${category.name}`);
                totalCreated++;
            } else {
                logger.info(`⏭️ Skipped existing category: ${category.name}`);
                totalSkipped++;
            }

            // Create subcategories
            if (category.subcategories) {
                for (const sub of category.subcategories) {
                    const existingSub = await CategoryModel.findOne({ slug: sub.slug });

                    if (!existingSub) {
                        await CategoryModel.create({
                            name: sub.name,
                            slug: sub.slug,
                            description: sub.description,
                            icon: sub.icon,
                            level: 1,
                            order: sub.order,
                            isActive: true,
                            isFeatured: false,
                            parent: parentCategory._id,
                        });
                        logger.info(`  ✅ Created subcategory: ${sub.name}`);
                        totalCreated++;
                    } else {
                        logger.info(`  ⏭️ Skipped existing subcategory: ${sub.name}`);
                        totalSkipped++;
                    }
                }
            }
        }

        logger.info(`\n🎉 Category seeding completed!`);
        logger.info(`   📊 Created: ${totalCreated} categories`);
        logger.info(`   ⏭️ Skipped: ${totalSkipped} existing categories`);
        logger.info(`   📁 Total in DB: ${await CategoryModel.countDocuments()}`);

        process.exit(0);
    } catch (err) {
        logger.error("❌ Error seeding categories:", err);
        process.exit(1);
    }
}

seedCategories();
