import { useEffect, useMemo, useState } from 'react'
import './App.css'

const facultyData = [
  {
    id: 1,
    name: 'Dr. Aisha Nair',
    department: 'Computer Science',
    subjects: ['DBMS', 'Operating Systems'],
    overall: 8.7,
    ratingBreakdown: { clarity: 8.8, pace: 7.9, fairness: 9.1, approachability: 8.9, relevance: 8.7 },
    wouldTakeAgain: 79,
    difficulty: 6,
    attendance: 'Strict',
    tags: ['Notes are gold', 'Explains with real examples', 'Surprise quizzes'],
    reviews: [
      { id: 11, semester: 'Sem 6', subject: 'DBMS', author: 'Student', helpful: 24, text: 'She writes the ER diagram like it is a story. Painful at first, then completely fair. Final paper was tough but only because she wants you to think.' },
      { id: 12, semester: 'Sem 5', subject: 'OS', author: 'Student', helpful: 18, text: 'Labs are very useful. If you pay attention in class, the viva feels easy. A bit fast in the first 15 minutes, but the examples are solid.' },
    ],
  },
  {
    id: 2,
    name: 'Prof. Rajesh Iyer',
    department: 'Mathematics',
    subjects: ['Engineering Maths', 'Calculus'],
    overall: 7.4,
    ratingBreakdown: { clarity: 7.2, pace: 6.8, fairness: 7.8, approachability: 7.3, relevance: 7.6 },
    wouldTakeAgain: 63,
    difficulty: 7,
    attendance: 'Moderate',
    tags: ['Chill internals', 'Boardwork is clear', 'He expects derivations'],
    reviews: [
      { id: 21, semester: 'Sem 2', subject: 'Engineering Maths', author: 'Student', helpful: 16, text: 'He is very patient with doubts, but the pace can feel like a sprint in the last month. If you do the tutorial sheets, you will survive.' },
      { id: 22, semester: 'Sem 1', subject: 'Calculus', author: 'Student', helpful: 21, text: 'You remember the theorems because he keeps linking them to how the questions appear in exams. Not for people who skip classes.' },
    ],
  },
  {
    id: 3,
    name: 'Dr. Meera Shah',
    department: 'Information Technology',
    subjects: ['Data Structures', 'Algorithms'],
    overall: 8.9,
    ratingBreakdown: { clarity: 9.1, pace: 8.2, fairness: 9.0, approachability: 8.8, relevance: 8.9 },
    wouldTakeAgain: 88,
    difficulty: 5,
    attendance: 'Flexible',
    tags: ['Real-world examples', 'Great for placements', 'Clear problem sets'],
    reviews: [
      { id: 31, semester: 'Sem 4', subject: 'Data Structures', author: 'Student', helpful: 31, text: 'She explains why a tree works before the code. This is the first prof who made DS feel like a toolkit instead of a punishment.' },
      { id: 32, semester: 'Sem 5', subject: 'Algorithms', author: 'Student', helpful: 27, text: 'The assignment questions are a little spicy, but she gives enough hints. Easy to ask for help in office hours.' },
    ],
  },
  {
    id: 4,
    name: 'Prof. Karan Malhotra',
    department: 'Electronics',
    subjects: ['Digital Systems', 'Signals'],
    overall: 6.9,
    ratingBreakdown: { clarity: 6.7, pace: 5.9, fairness: 7.4, approachability: 6.8, relevance: 7.1 },
    wouldTakeAgain: 55,
    difficulty: 8,
    attendance: 'Mandatory',
    tags: ['Tough but fair', 'Surprise quizzes', 'Slow to start'],
    reviews: [
      { id: 41, semester: 'Sem 3', subject: 'Signals', author: 'Student', helpful: 12, text: 'If you are a last-bencher, you will need to restart. The course is good, but his class can be heavy. Marks are fair if you show work.' },
      { id: 42, semester: 'Sem 4', subject: 'Digital Systems', author: 'Student', helpful: 15, text: 'There is no handholding, but he explains the core concept well. Not a chill professor, but not a bad one.' },
    ],
  },
]

const allDepartments = ['All', ...new Set(facultyData.map((faculty) => faculty.department))]
const allTags = ['Notes are gold', 'Surprise quizzes', 'Chill internals', 'Explains with real examples', 'Real-world examples', 'He expects derivations', 'Clear problem sets']

const defaultDraft = {
  step: 1,
  ratings: { clarity: 8, pace: 7, fairness: 8, approachability: 8, relevance: 7 },
  tags: ['Notes are gold', 'Explains with real examples'],
  reviewText: '',
  faculty: 'Dr. Aisha Nair',
}

function App() {
  const [page, setPage] = useState('home')
  const [theme, setTheme] = useState('paper')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [activeFacultyId, setActiveFacultyId] = useState(1)
  const [reviewDraft, setReviewDraft] = useState(() => {
    if (typeof window === 'undefined') return defaultDraft
    const savedDraft = window.localStorage.getItem('marginalia-review-draft')
    return savedDraft ? { ...defaultDraft, ...JSON.parse(savedDraft) } : defaultDraft
  })
  const [queue, setQueue] = useState([
    { id: 101, faculty: 'Dr. Aisha Nair', reason: 'Profanity in the final paragraph', reportCount: 2, date: '12 Sep', status: 'Pending' },
    { id: 102, faculty: 'Prof. Rajesh Iyer', reason: 'Personal attack and name-calling', reportCount: 3, date: '09 Sep', status: 'Pending' },
    { id: 103, faculty: 'Dr. Meera Shah', reason: 'Off-topic feedback unrelated to teaching', reportCount: 1, date: '08 Sep', status: 'Pending' },
  ])

  const activeFaculty = facultyData.find((faculty) => faculty.id === activeFacultyId) ?? facultyData[0]

  const filteredFaculty = useMemo(() => {
    return facultyData.filter((faculty) => {
      const matchesDepartment = departmentFilter === 'All' || faculty.department === departmentFilter
      const haystack = `${faculty.name} ${faculty.department} ${faculty.subjects.join(' ')}`.toLowerCase()
      const matchesQuery = haystack.includes(searchTerm.toLowerCase())
      return matchesDepartment && matchesQuery
    })
  }, [departmentFilter, searchTerm])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('marginalia-review-draft', JSON.stringify(reviewDraft))
    }
  }, [reviewDraft])

  const totalHelpfulReviews = facultyData.reduce((sum, faculty) => sum + faculty.reviews.reduce((inner, review) => inner + review.helpful, 0), 0)

  const handleSlider = (key, value) => {
    setReviewDraft((draft) => ({
      ...draft,
      ratings: { ...draft.ratings, [key]: Number(value) },
    }))
  }

  const handleDraftTagToggle = (tag) => {
    setReviewDraft((draft) => {
      const exists = draft.tags.includes(tag)
      return {
        ...draft,
        tags: exists ? draft.tags.filter((item) => item !== tag) : [...draft.tags, tag],
      }
    })
  }

  const handleSubmitReview = () => {
    setPage('profile')
    setReviewDraft({ ...defaultDraft, faculty: activeFaculty.name })
  }

  const handleQueueAction = (id, action) => {
    setQueue((items) => items.filter((item) => item.id !== id))
    if (action === 'ban') {
      console.log('Faculty banned from moderation queue')
    }
  }

  const getScore = (rating) => {
    const value = Number(rating)
    return value > 0 ? (value / 10) * 100 : 0
  }

  const averageRating = (scores) => {
    const values = Object.values(scores)
    return (values.reduce((sum, item) => sum + item, 0) / values.length).toFixed(1)
  }

  const renderHome = () => (
    <div className="page-stack home-page">
      <section className="editorial-hero note-card">
        <div className="rubric-line" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Reviews by students, for students.</p>
          <h1>
            Know your <span className="italic-squiggle">prof</span> before the first bell.
          </h1>
          <label className="fill-line" htmlFor="faculty-search">
            <span>I want to know about</span>
            <input
              id="faculty-search"
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setPage('directory')
              }}
              placeholder="DBMS / Aisha / Operating Systems"
            />
          </label>
        </div>
      </section>

      <section className="content-strip two-column">
        <div className="paper-panel">
          <div className="section-header">
            <p className="eyebrow">Recently annotated</p>
            <span className="stamp small">Fresh notes</span>
          </div>
          <div className="recent-list">
            {facultyData.slice(0, 3).map((faculty) => (
              <button key={faculty.id} type="button" className="mini-row" onClick={() => { setActiveFacultyId(faculty.id); setPage('profile') }}>
                <div>
                  <strong>{faculty.name}</strong>
                  <span>{faculty.department}</span>
                </div>
                <span className="grade-badge">{faculty.overall.toFixed(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="paper-panel">
          <div className="section-header">
            <p className="eyebrow">Department index</p>
            <span className="stamp small">Table of contents</span>
          </div>
          <div className="toc-grid">
            {allDepartments.slice(1).map((department) => (
              <button key={department} type="button" className="toc-link" onClick={() => { setDepartmentFilter(department); setPage('directory') }}>
                {department}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="paper-panel review-strip-wrap">
        <div className="section-header">
          <p className="eyebrow">Most helpful reviews this week</p>
          <span className="stamp small">Verified</span>
        </div>
        <div className="review-strip">
          {facultyData.flatMap((faculty) => faculty.reviews.map((review) => ({ faculty, review }))).slice(0, 4).map(({ faculty, review }) => (
            <article key={review.id} className="teaser-card">
              <div className="note-mark" aria-hidden="true">✎</div>
              <p>“{review.text}”</p>
              <footer>
                <span>{faculty.name}</span>
                <strong>{review.helpful} helpful</strong>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  const renderDirectory = () => (
    <div className="page-stack directory-page">
      <aside className="left-rail paper-panel">
        <div className="section-header">
          <p className="eyebrow">Catalogue</p>
          <span className="stamp small">Filter</span>
        </div>

        <label className="field-label" htmlFor="directory-search">
          Search faculty
          <input id="directory-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Name / department / subject" />
        </label>

        <div className="filter-group">
          {allDepartments.map((department) => (
            <button key={department} type="button" className={`filter-chip ${departmentFilter === department ? 'active' : ''}`} onClick={() => setDepartmentFilter(department)}>
              {department}
            </button>
          ))}
        </div>
      </aside>

      <section className="directory-list paper-panel">
        <div className="section-header">
          <p className="eyebrow">Faculty ledger</p>
          <span className="stamp small">Sorted by rating</span>
        </div>
        <div className="faculty-list">
          {filteredFaculty.map((faculty) => (
            <button key={faculty.id} type="button" className="faculty-row" onClick={() => { setActiveFacultyId(faculty.id); setPage('profile') }}>
              <div className="faculty-main">
                <div className="faculty-name-block">
                  <h3>{faculty.name}</h3>
                  <span>{faculty.department}</span>
                </div>
                <ul>
                  {faculty.subjects.map((subject) => <li key={subject}>{subject}</li>)}
                </ul>
              </div>
              <div className="faculty-meta">
                <span className="grade-badge large">{faculty.overall.toFixed(1)}</span>
                <small>{faculty.reviews.length} reviews</small>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )

  const renderProfile = () => (
    <div className="page-stack profile-page">
      <section className="profile-main paper-panel">
        <div className="profile-overview">
          <div className="heading-lockup">
            <p className="eyebrow">Faculty profile</p>
            <h2>{activeFaculty.name}</h2>
            <div className="subject-line">
              <span>{activeFaculty.department}</span>
              {activeFaculty.subjects.map((subject) => <span key={subject}>{subject}</span>)}
            </div>
          </div>
          <div className="grade-cluster">
            <div className="score-circle">
              <svg viewBox="0 0 120 120" className="score-ring" aria-label={`${activeFaculty.overall.toFixed(1)} out of 10`}>
                <circle cx="60" cy="60" r="42" className="ring-track" />
                <circle cx="60" cy="60" r="42" className="ring-fill" style={{ strokeDasharray: 264, strokeDashoffset: 264 - (264 * (activeFaculty.overall / 10)) }} />
              </svg>
              <span className="score-value">{activeFaculty.overall.toFixed(1)}<small>/10</small></span>
            </div>
            <TeachingFingerprint scores={activeFaculty.ratingBreakdown} />
          </div>
        </div>

        <div className="profile-breakdown">
          {Object.entries(activeFaculty.ratingBreakdown).map(([key, value]) => (
            <div key={key} className="metric-row">
              <span>{key}</span>
              <div className="track">
                <span className="fill" style={{ width: `${getScore(value)}%` }} />
              </div>
              <strong>{value.toFixed(1)}</strong>
            </div>
          ))}
        </div>

        <div className="signal-row">
          <div className="signal-card">
            <p>Would take again</p>
            <strong>{activeFaculty.wouldTakeAgain}%</strong>
          </div>
          <div className="signal-card">
            <p>Difficulty</p>
            <strong>{activeFaculty.difficulty}/10</strong>
          </div>
          <div className="signal-card">
            <p>Attendance</p>
            <strong>{activeFaculty.attendance}</strong>
          </div>
        </div>

        <div className="tag-row">
          {activeFaculty.tags.map((tag) => (
            <span key={tag} className="stamp-tag">{tag}</span>
          ))}
        </div>
      </section>

      <aside className="review-column">
        <div className="sticky-cta paper-panel">
          <p className="eyebrow">Your verdict</p>
          <h3>Have notes from the semester?</h3>
          <button type="button" className="primary-button" onClick={() => { setReviewDraft((draft) => ({ ...draft, faculty: activeFaculty.name })); setPage('review') }}>
            Write a review
          </button>
        </div>

        <section className="review-list paper-panel">
          <div className="section-header">
            <p className="eyebrow">Recent notes</p>
            <span className="stamp small">Anonymous</span>
          </div>
          {activeFaculty.reviews.map((review) => (
            <article key={review.id} className="review-slip">
              <div className="slip-meta">
                <span>{review.semester}</span>
                <span>{review.subject}</span>
              </div>
              <p>{review.text}</p>
              <div className="slip-actions">
                <button type="button">Helpful · {review.helpful}</button>
                <button type="button" className="ghost-link">Report</button>
              </div>
            </article>
          ))}
        </section>
      </aside>
    </div>
  )

  const renderReviewForm = () => (
    <div className="page-stack review-form-page">
      <div className="paper-panel form-shell">
        <div className="section-header form-topbar">
          <p className="eyebrow">Write a review</p>
          <span className="stamp small">One per semester</span>
        </div>

        <div className="stepper">
          {[1, 2, 3, 4].map((step) => (
            <button key={step} type="button" onClick={() => setReviewDraft((draft) => ({ ...draft, step }))} className={`step-dot ${reviewDraft.step === step ? 'active' : ''}`}>
              {step}
            </button>
          ))}
        </div>

        {reviewDraft.step === 1 && (
          <div className="step-panel">
            <h3>Rate the teaching</h3>
            <p className="helper-copy">Drag the ink marks. You are rating what felt true in class, not a performance review.</p>
            <div className="slider-stack">
              {Object.entries(reviewDraft.ratings).map(([key, value]) => (
                <label key={key} className="range-row">
                  <div className="range-head">
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                  <input type="range" min="1" max="10" value={value} onChange={(event) => handleSlider(key, event.target.value)} />
                </label>
              ))}
            </div>
          </div>
        )}

        {reviewDraft.step === 2 && (
          <div className="step-panel">
            <h3>Tag the experience</h3>
            <div className="tag-picker">
              {allTags.map((tag) => (
                <button key={tag} type="button" className={`tag-option ${reviewDraft.tags.includes(tag) ? 'selected' : ''}`} onClick={() => handleDraftTagToggle(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {reviewDraft.step === 3 && (
          <div className="step-panel">
            <h3>Write the note</h3>
            <p className="helper-copy">Helpful reviews stay on teaching. Mention examples, grading, communication and the vibe. Keep it specific.</p>
            <textarea
              value={reviewDraft.reviewText}
              onChange={(event) => setReviewDraft((draft) => ({ ...draft, reviewText: event.target.value }))}
              placeholder="What would you tell a junior before they pick this course?"
              maxLength={420}
            />
            <div className="char-counter">
              <span>{reviewDraft.reviewText.length}/420</span>
            </div>
          </div>
        )}

        {reviewDraft.step === 4 && (
          <div className="step-panel">
            <h3>Final check</h3>
            <div className="confirm-sheet">
              <div>
                <span>Faculty</span>
                <strong>{reviewDraft.faculty}</strong>
              </div>
              <div>
                <span>Average score</span>
                <strong>{averageRating(reviewDraft.ratings)}/10</strong>
              </div>
              <div>
                <span>Tags</span>
                <strong>{reviewDraft.tags.join(', ') || 'No tags added'}</strong>
              </div>
              <div>
                <span>Summary</span>
                <strong>{reviewDraft.reviewText || 'No summary written yet'}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => setReviewDraft((draft) => ({ ...draft, step: Math.max(1, draft.step - 1) }))} disabled={reviewDraft.step === 1}>
            Back
          </button>
          <button type="button" className="secondary-button" onClick={() => setReviewDraft((draft) => ({ ...draft, step: Math.min(4, draft.step + 1) }))}>
            {reviewDraft.step === 4 ? 'Review' : 'Next'}
          </button>
          {reviewDraft.step === 4 && (
            <button type="button" className="primary-button" onClick={handleSubmitReview}>
              Submit an anonymous review
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderAdmin = () => (
    <div className="page-stack admin-page">
      <section className="paper-panel admin-panel">
        <div className="section-header">
          <p className="eyebrow">Moderation queue</p>
          <span className="stamp small">{queue.length} pending</span>
        </div>
        <div className="queue-list">
          {queue.map((item) => (
            <article key={item.id} className="queue-item">
              <div className="queue-meta">
                <span>{item.faculty}</span>
                <small>{item.date}</small>
              </div>
              <p>{item.reason}</p>
              <div className="queue-actions">
                <button type="button" className="small-success" onClick={() => handleQueueAction(item.id, 'approve')}>Approve</button>
                <button type="button" className="small-danger" onClick={() => handleQueueAction(item.id, 'remove')}>Remove</button>
                <button type="button" className="small-ghost" onClick={() => handleQueueAction(item.id, 'ban')}>Ban</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )

  return (
    <div className={`app-shell ${theme}`}>
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">M</span>
          <div>
            <strong>Marginalia</strong>
            <small>Faculty notes</small>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {['home', 'directory', 'profile', 'review', 'admin'].map((tab) => (
            <button key={tab} type="button" className={page === tab ? 'nav-link active' : 'nav-link'} onClick={() => setPage(tab)}>
              {tab === 'home' ? 'Home' : tab === 'directory' ? 'Directory' : tab === 'profile' ? 'Profile' : tab === 'review' ? 'Write review' : 'Moderation'}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="theme-toggle" onClick={() => setTheme((value) => value === 'paper' ? 'ink' : 'paper')}>{theme === 'paper' ? 'Ink mode' : 'Paper mode'}</button>
        </div>
      </header>

      <main className="main-view">
        {page === 'home' && renderHome()}
        {page === 'directory' && renderDirectory()}
        {page === 'profile' && renderProfile()}
        {page === 'review' && renderReviewForm()}
        {page === 'admin' && renderAdmin()}
      </main>

      <footer className="footer-note">
        <span>Reviews by students, for students.</span>
        <span>{totalHelpfulReviews} helpful votes logged</span>
      </footer>
    </div>
  )
}

function TeachingFingerprint({ scores }) {
  const keys = ['clarity', 'relevance', 'fairness', 'approachability', 'pace']
  const size = 180
  const centerX = 90
  const centerY = 90

  const points = keys.map((key, index) => {
    const angle = (-Math.PI / 2) + (index / keys.length) * Math.PI * 2
    const raw = scores[key] / 10
    const radius = 58 * raw
    const wobble = Math.sin(index + 1.6) * 7
    return {
      x: centerX + Math.cos(angle) * (radius + wobble),
      y: centerY + Math.sin(angle) * (radius + wobble),
    }
  })

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ') + ' Z'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="fingerprint-svg" aria-label="Teaching fingerprint">
      <g>
        {[...Array(5)].map((_, index) => {
          const angle = (-Math.PI / 2) + (index / 5) * Math.PI * 2
          const x = centerX + Math.cos(angle) * 58
          const y = centerY + Math.sin(angle) * 58
          return <line key={index} x1={centerX} y1={centerY} x2={x} y2={y} className="radial-line" />
        })}
        <path d={path} className="blob-shape" />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.5" className="blob-dot" />
        ))}
      </g>
    </svg>
  )
}

export default App
