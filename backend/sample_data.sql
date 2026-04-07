TRUNCATE TABLE internships, videos RESTART IDENTITY;

INSERT INTO videos (
  title,
  subject,
  description,
  video_url,
  thumbnail_url,
  video_public_id,
  uploader_name,
  view_count,
  rating,
  created_at,
  labsheet_url,
  modelpaper_url
)
VALUES
  (
    'Programming Fundamentals: Variables and Control Flow',
    'Programming',
    'A beginner-friendly walkthrough of variables, conditions, loops, and the reasoning patterns behind small program design.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://dummyimage.com/640x360/1f3b63/ffffff.png&text=Programming+Fundamentals',
    'sample-programming-fundamentals',
    'Dr. N. Perera',
    324,
    4.8,
    '2026-03-08',
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps'
  ),
  (
    'Data Structures: Arrays, Linked Lists, and Stacks',
    'Data Structures',
    'Covers the tradeoffs between sequential and linked storage with practical problem-solving examples.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://dummyimage.com/640x360/315b8d/ffffff.png&text=Data+Structures',
    'sample-data-structures-core',
    'Prof. S. Wijesinghe',
    451,
    4.9,
    '2026-03-11',
    'https://www.geeksforgeeks.org/data-structures/',
    'https://www.programiz.com/dsa'
  ),
  (
    'Database Systems: SQL Queries and Joins',
    'Database Systems',
    'Demonstrates filtering, sorting, grouping, and joining relational tables using practical examples.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://dummyimage.com/640x360/152943/ffffff.png&text=Database+Systems',
    'sample-database-joins',
    'Lect. R. Fernando',
    398,
    4.7,
    '2026-03-15',
    'https://www.postgresql.org/docs/current/tutorial-sql-intro.html',
    'https://www.postgresql.org/docs/current/tutorial-join.html'
  ),
  (
    'Operating Systems: Processes, Threads, and Scheduling',
    'Operating Systems',
    'Explains process lifecycle, CPU scheduling ideas, and why concurrency design decisions matter.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://dummyimage.com/640x360/0f4c5c/ffffff.png&text=Operating+Systems',
    'sample-os-process-scheduling',
    'Dr. P. Jayawardena',
    287,
    4.6,
    '2026-03-19',
    'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    'https://www.geeksforgeeks.org/operating-systems/'
  ),
  (
    'Computer Networks: TCP, UDP, and Routing Basics',
    'Computer Networks',
    'Introduces layered communication, transport protocols, and packet movement through simple visual explanations.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://dummyimage.com/640x360/28536b/ffffff.png&text=Computer+Networks',
    'sample-networks-transport-routing',
    'Eng. T. Karunaratne',
    365,
    4.8,
    '2026-03-24',
    'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
    'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/'
  ),
  (
    'Software Engineering: Requirements to Release',
    'Software Engineering',
    'A practical overview of requirement gathering, design, implementation, testing, and release planning.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://dummyimage.com/640x360/3b3b58/ffffff.png&text=Software+Engineering',
    'sample-software-engineering-lifecycle',
    'Ms. H. De Silva',
    259,
    4.5,
    '2026-03-28',
    'https://www.atlassian.com/agile/project-management/requirements',
    'https://martinfowler.com/articles/practical-test-pyramid.html'
  );

INSERT INTO internships (
  title,
  company,
  category,
  type,
  job_type,
  location,
  description,
  deadline
)
VALUES
  (
    'Software Engineering Intern',
    'CodeSprint Labs',
    'IT',
    'Full time',
    'Full time',
    'Colombo',
    'Join a product engineering team to work on React interfaces, REST APIs, bug fixing, and QA support with mentor guidance.',
    '2026-05-15'
  ),
  (
    'Data Analyst Intern',
    'Insight Bridge',
    'Business',
    'Part time',
    'Part time',
    'Kandy',
    'Support reporting workflows, dashboard preparation, spreadsheet automation, and business performance analysis.',
    '2026-05-22'
  ),
  (
    'Network Support Intern',
    'NetAxis Solutions',
    'Engineering',
    'Full time',
    'Full time',
    'Galle',
    'Assist with infrastructure monitoring, router configuration reviews, incident logging, and documentation of support tasks.',
    '2026-05-27'
  ),
  (
    'Bioinformatics Intern',
    'GenomeWorks',
    'Bio tech',
    'Remote',
    'Remote',
    'Remote',
    'Work with structured datasets, validation pipelines, and technical reporting for biology-focused data workflows.',
    '2026-06-03'
  ),
  (
    'QA Automation Intern',
    'LaunchPad Systems',
    'IT',
    'Remote',
    'Remote',
    'Remote',
    'Help build regression checks, document defects, and improve release confidence across web application features.',
    '2026-06-10'
  );
