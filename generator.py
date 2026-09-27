
import random
import json
from datetime import datetime

random.seed()

first_names = [
    "Bartholomew", "Kevin", "Princess", "Dr. Pickles",
    "Boris", "Greg", "X Æ A-12", "Geraldine", "Lord",
    "Chad", "Waffle", "Mildred", "Sir Reginald",
    "Banana", "Quantum", "Toaster", "Dingus", "Susan",
    "Professor", "Captain", "Meatball", "Zorp", "Goblin",
    "Mysterious", "Lord", "Chairman", "Definitely"
]

last_names = [
    "McNoodle", "Von Wobble", "The Third", "Potato",
    "Thunderpants", "McSpaghetti", "Quantum",
    "Pancake", "Laserbeam", "Waffle", "Noodle",
    "The Destroyer", "Bananabottom", "McFluff",
    "Jellyfish", "Crumbington", "Moonboots",
    "The Unemployed", "Toast", "Puddleworth",
    "McExplosion", "Bigfoot", "of Nowhere"
]

jobs = [
    "Chief Executive of Unnecessary Meetings",
    "Professional Cloud Whisperer",
    "Senior Intergalactic Parking Consultant",
    "Certified Dinosaur Therapist",
    "Chief Sandwich Architect",
    "Director of Imaginary Infrastructure",
    "Supreme Potato Strategist",
    "Quantum Spreadsheet Necromancer",
    "Professional Time-Traveling Accountant",
    "Head of Advanced Spoon Technology",
    "Underwater Influencer",
    "Chief Happiness Dispenser",
    "Freelance Reality Glitch Engineer",
    "Senior Manager of Existential Confusion",
    "Professional Ghost Influencer",
    "Chief Vibe Optimization Officer",
    "Director of Suspiciously Specific Ideas",
    "International Nap Consultant",
    "Lead Developer of Invisible Websites",
    "Chief Banana Logistics Officer",
    "Professional Alien Translator",
    "Minister of Unfinished Projects",
    "Advanced Croissant Engineer",
    "Director of the Department of Nothing",
    "Chief Meme Archaeologist",
    "Certified Professional Goblin"
]

locations = [
    "The Moon, Floor 3",
    "Atlantis, Basement",
    "A suspicious potato farm",
    "Somewhere behind a vending machine",
    "The Republic of Lost Socks",
    "New York, Mars",
    "The Bermuda Triangle",
    "A parallel universe with bad Wi-Fi",
    "Inside a very large refrigerator",
    "The International Space Station (uninvited)",
    "The Internet, probably",
    "The 47th dimension",
    "A cardboard box in Luxembourg",
    "Under the office coffee machine",
    "The Forbidden Spreadsheet",
    "A secret underground waffle bunker",
    "The backrooms, level 404",
    "The middle of nowhere, Ohio",
    "A floating island of unpaid invoices"
]

companies = [
    "Definitely Real Technologies",
    "Nobody Asked LLC",
    "The Ministry of Mild Confusion",
    "Global Potato Corporation",
    "Waffle Dynamics",
    "Quantum Toast Industries",
    "The Department of Questionable Ideas",
    "Invisible Solutions Inc.",
    "The Galactic Institute of Bad Decisions",
    "Moonlight & Associates",
    "The International Nap Foundation",
    "Cloudless Cloud Corp.",
    "Suspiciously Large Enterprises",
    "The Society of Professional Nappers",
    "The Bureau of Unfinished Business",
    "Banana Incorporated",
    "The Council of Extremely Weird People",
    "404 Industries"
]

bio_openers = [
    "I was born during a software update and have been buffering ever since.",
    "My career began when a pigeon accidentally promoted me to CEO.",
    "I have 47 years of experience despite being three weeks old.",
    "My mother says I am special. My employer says I am a liability.",
    "I once defeated an entire army of sentient staplers using only a spoon.",
    "I specialize in solving problems that I personally invented.",
    "I am the world's first professionally certified imaginary professional.",
    "I have been banned from 14 office supply stores for reasons I cannot disclose.",
    "I am a visionary who has never actually seen the vision.",
    "I turned my childhood imaginary friend into a multinational corporation.",
    "My greatest professional achievement was surviving a team-building exercise.",
    "I have successfully failed at 93 different careers."
]

bio_middles = [
    "My work combines advanced mathematics, aggressive interpretive dance, and the ancient art of guessing.",
    "My daily routine involves negotiating with printers, fighting invisible deadlines, and explaining myself to confused managers.",
    "I have revolutionized absolutely nothing, but I have done it with confidence.",
    "My patented approach to innovation is to press random buttons until something catches fire.",
    "I bring a unique combination of unearned confidence and extremely questionable technical skills.",
    "I believe every problem can be solved with artificial intelligence, three spreadsheets, and a very large sandwich.",
    "My leadership style has been described as 'a surprise attack by a confused raccoon.'",
    "I once delivered a keynote speech to a room full of chairs. The chairs were unimpressed.",
    "My portfolio contains 600 projects, 599 of which are still loading.",
    "I am currently disrupting the global market for imaginary products."
]

bio_endings = [
    "Please do not contact my previous employers. They have moved to another dimension.",
    "Available for freelance work, interdimensional travel, and extremely suspicious business deals.",
    "My references include three ghosts, a sentient microwave, and a very judgmental pigeon.",
    "I accept payment in gold bars, expired coupons, and emotional support potatoes.",
    "I am not responsible for any timelines accidentally deleted during my employment.",
    "My hobbies include staring at walls, collecting imaginary awards, and avoiding accountability.",
    "I am currently wanted in 12 countries and one particularly angry spreadsheet.",
    "Please note: all achievements are technically true in a universe that no longer exists."
]

skills = [
    "Advanced Napping", "JavaScript", "Quantum Typing",
    "Professional Guessing", "Unlicensed Telepathy",
    "Strategic Confusion", "Python", "React",
    "Emotional Support Excel", "Cloud Appreciation",
    "Vague Leadership", "Digital Archaeology",
    "Interdimensional Networking", "CSS Sorcery",
    "Meeting Survival", "Unnecessary Innovation",
    "Professional Goblin Behavior", "Dream Engineering",
    "Coffee Optimization", "Advanced Spoon Handling",
    "Existential Debugging", "Unpaid Intern Management",
    "Invisible Infrastructure", "PowerPoint Archaeology",
    "Crisis Avoidance", "Aggressive Procrastination",
    "Telepathic Sandwich Design", "Meme Engineering",
    "Time Management (Badly)", "Fake It Till You Make It",
    "Excel Wizardry", "Forbidden Spreadsheet Magic",
    "Underwater Basket Weaving", "Advanced Potato Theory",
    "Reality Glitch Detection", "Intergalactic HR"
]

project_names = [
    "Project Banana", "The Invisible App", "Operation NapTime",
    "Quantum Sandwich", "The Potato Protocol",
    "Cloudless Cloud", "Dreamscapes 404", "Vibe Calculator",
    "The Great Spoon Initiative", "The Time-Traveling Toaster",
    "Intergalactic Parking", "Unnecessary AI",
    "The Forbidden Spreadsheet", "GoblinGPT",
    "The Emotional Support Printer", "The Infinite Loading Screen",
    "The Sentient Waffle", "The Department of Nothing",
    "The Chaos Engine", "The Unpaid Invoice Generator",
    "The Moon Cheese Project", "The Multiverse of Mild Inconvenience"
]

project_descriptions = [
    "A revolutionary application that does absolutely nothing, beautifully.",
    "An AI-powered system that generates increasingly suspicious ideas.",
    "A decentralized platform for the secure exchange of imaginary potatoes.",
    "An experimental framework for negotiating with extraterrestrial accountants.",
    "A productivity tool that makes sleeping look like a legitimate career.",
    "A highly classified project that accidentally became a public website.",
    "An interactive experience that turns random thoughts into questionable products.",
    "A virtual companion that judges your life choices in real time.",
    "A cloud platform that is not actually in the cloud.",
    "An advanced system for scheduling meetings that should never happen.",
    "A futuristic infrastructure project built entirely out of cardboard.",
    "An award-winning prototype that was never finished or started.",
    "A mysterious digital organism that eats expired spreadsheets.",
    "An ambitious experiment in the field of unnecessary complexity."
]

achievements = [
    "Won the International Championship of Professional Napping.",
    "Successfully negotiated peace between two rival houseplants.",
    "Invented a color that only exists on Tuesdays.",
    "Received a lifetime achievement award from three pigeons.",
    "Built a viral side project with 2 million imaginary views.",
    "Was briefly mistaken for a government official at a sandwich shop.",
    "Published 47 research papers on the cultural significance of office snacks.",
    "Made a printer work by politely asking it.",
    "Successfully completed a 30-day challenge of avoiding all responsibilities.",
    "Became the first human to be fired from an imaginary job.",
    "Received a Nobel Prize in Extremely Questionable Science.",
    "Created a self-aware PowerPoint presentation that immediately resigned.",
    "Survived a hostile takeover by sentient office chairs.",
    "Was voted Most Likely to Accidentally Delete the Internet.",
    "Won a gold medal in competitive staring at walls.",
    "Was named Person of the Year by a magazine that does not exist.",
    "Invented a new form of currency based on expired coupons.",
    "Reached level 99 in professional procrastination."
]

degrees = [
    "PhD in Applied Nonsense",
    "MSc in Advanced Daydreaming",
    "Doctorate in Unnecessary Complexity",
    "Bachelor of Intergalactic Business",
    "Diploma in Professional Confusion",
    "Honorary Degree in Vibes",
    "Certificate in Theoretical Sandwiches",
    "Master of Suspicious Technology",
    "PhD in Existential Spreadsheet Studies",
    "BSc in Unlicensed Innovation"
]

universities = [
    "The University of Questionable Excellence",
    "International Academy of Unnecessary Knowledge",
    "The Galactic Institute of Advanced Confusion",
    "University of Lost Socks",
    "The Institute of Professional Daydreaming",
    "The University of Things That Probably Don't Exist",
    "The Royal Academy of Imaginary Sciences",
    "The College of Suspiciously Specific Ideas"
]

def unique_items(items, amount):
    return random.sample(items, min(amount, len(items)))

def generate_profile():
    first = random.choice(first_names)
    last = random.choice(last_names)
    name = f"{first} {last}"

    current_year = datetime.now().year
    years = random.randint(1, 42)

    profile = {
        "name": name,
        "job": random.choice(jobs),
        "category": random.choice([
            "CERTIFIED NONSENSE EXPERT",
            "INTERGALACTIC INNOVATOR",
            "CHIEF OF QUESTIONABLE IDEAS",
            "SENIOR REALITY ENGINEER",
            "PROFESSIONAL CHAOS ENTHUSIAST",
            "UNLICENSED FUTURE DISRUPTOR",
            "OFFICIALLY UNVERIFIED HUMAN",
            "SUPREME MASTER OF ABSOLUTELY NOTHING"
        ]),
        "location": random.choice(locations),
        "years": years,
        "bio": (
            random.choice(bio_openers) + " "
            + random.choice(bio_middles) + " "
            + random.choice(bio_endings)
        ),
        "about": (
            random.choice(bio_middles) + " "
            + random.choice(bio_openers) + " "
            + random.choice(bio_endings)
        ),
        "id": f"CHAOS-{random.randint(100000, 999999)}",
        "experience": [],
        "projects": [],
        "skills": unique_items(skills, random.randint(8, 14)),
        "achievements": unique_items(achievements, 4),
        "degree": random.choice(degrees),
        "university": random.choice(universities),
        "education_year": current_year - random.randint(3, 30),
        "project_count": random.randint(3, 999),
        "countries": random.randint(1, 195),
        "coffee": random.choice([
            "∞", "999+", "4,208", "12,000", "Too many",
            "A suspicious amount", "Classified"
        ]),
        "avatar_color": random.choice([
            "#ff4e8b", "#a875ff", "#00d5ff", "#f8a23b",
            "#64df8e", "#ed67d0", "#ff5252", "#7c83ff"
        ]),
        "salary": random.randint(1, 999) * 100000
    }

    job_titles = unique_items(jobs, 3)
    employers = unique_items(companies, 3)
    for i in range(3):
        start = current_year - random.randint(2, 22) - i * random.randint(1, 5)
        profile["experience"].append({
            "title": job_titles[i],
            "company": employers[i],
            "period": (
                f"{start} – Present" if i == 0
                else f"{start} – {start + random.randint(1, 3)}"
            ),
            "description": random.choice([
                "Managed a team of highly confused professionals and several uncooperative office plants.",
                "Developed a revolutionary strategy that accidentally created a new dimension.",
                "Built innovative solutions for problems that were never officially reported.",
                "Directed a multi-million-dollar project funded entirely by imaginary money.",
                "Improved company efficiency by introducing a mandatory daily nap.",
                "Worked closely with an interdisciplinary team of ghosts, robots, and accountants."
            ])
        })

    project_titles = unique_items(project_names, 3)
    descriptions = unique_items(project_descriptions, 3)
    for i in range(3):
        profile["projects"].append({
            "title": project_titles[i],
            "description": descriptions[i],
            "status": random.choice(["LIVE", "BETA", "QUESTIONABLE", "HAUNTED"])
        })

    return profile

json.dumps(generate_profile(), ensure_ascii=False)
