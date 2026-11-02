import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearAuthError, signIn, signOut, signUp, verifySession } from './features/auth/authSlice'
import {
  clearDataError,
  deleteItem,
  loadDashboard,
  resetData,
  saveFeedback,
  saveItem,
} from './features/dashboard/dataSlice'
import './App.css'

const navigation = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'projects', label: 'Projects', icon: '▧' },
  { id: 'tasks', label: 'My tasks', icon: '☷' },
  { id: 'skills', label: 'Skills', icon: '✳' },
  { id: 'certifications', label: 'Certifications', icon: '◇' },
  { id: 'reviews', label: 'Faculty reviews', icon: '▤', facultyOnly: true },
]

const resourceDetails = {
  projects: {
    singular: 'project',
    fields: [
      { name: 'title', label: 'Project title', required: true, placeholder: 'e.g. Campus sustainability tracker' },
      { name: 'category', label: 'Category', placeholder: 'e.g. Web development' },
      { name: 'description', label: 'About this project', type: 'textarea', placeholder: 'What are you building?' },
      { name: 'status', label: 'Status', type: 'select', options: [['planning', 'Planning'], ['in-progress', 'In progress'], ['completed', 'Completed']] },
      { name: 'due_date', label: 'Target date', type: 'date' },
      { name: 'repository_url', label: 'Repository link', type: 'url', placeholder: 'https://' },
      { name: 'submission_url', label: 'Submission link', type: 'url', placeholder: 'https://' },
    ],
  },
  tasks: {
    singular: 'task',
    fields: [
      { name: 'title', label: 'Task title', required: true, placeholder: 'e.g. Finish wireframes' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Add a few details' },
      { name: 'project_id', label: 'Related project', type: 'project' },
      { name: 'priority', label: 'Priority', type: 'select', options: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']] },
      { name: 'status', label: 'Status', type: 'select', options: [['todo', 'To do'], ['in-progress', 'In progress'], ['done', 'Done']] },
      { name: 'due_date', label: 'Due date', type: 'date' },
    ],
  },
  skills: {
    singular: 'skill',
    fields: [
      { name: 'name', label: 'Skill', required: true, placeholder: 'e.g. React' },
      { name: 'level', label: 'Proficiency', type: 'select', options: [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced'], ['expert', 'Expert']] },
    ],
  },
  certifications: {
    singular: 'certification',
    fields: [
      { name: 'name', label: 'Certification', required: true, placeholder: 'e.g. Cloud practitioner' },
      { name: 'issuer', label: 'Issued by', placeholder: 'Organization or institution' },
      { name: 'issue_date', label: 'Issue date', type: 'date' },
      { name: 'credential_url', label: 'Credential link', type: 'url', placeholder: 'https://' },
    ],
  },
}

function formatDate(value) {
  if (!value) return 'No date set'
  return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function AuthScreen() {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function changeMode(nextMode) {
    setMode(nextMode)
    dispatch(clearAuthError())
  }

  function submit(event) {
    event.preventDefault()
    if (mode === 'signup') dispatch(signUp({ name, email, password }))
    else dispatch(signIn({ email, password }))
  }

  return (
    <main className="auth-page">
      <div className="auth-aside">
        <a className="brand brand-light" href="#home" aria-label="CampusHub home">
          <span className="brand-mark">c</span>
          <span>campus<span>hub</span></span>
        </a>
        <div className="auth-aside-copy">
          <div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> YOUR CAMPUS, IN SYNC</div>
          <h1>Make room for<br />your next big idea.</h1>
          <p>One calm place to track what you are learning, building, and working toward.</p>
        </div>
        <div className="auth-note"><span>✳</span> Made for the work behind the work.</div>
      </div>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-welcome">
            <div className="eyebrow">WELCOME TO CAMPUSHUB</div>
            <h2>{mode === 'login' ? 'Good to have you back.' : 'Start your journey.'}</h2>
            <p>{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create your student account and get organized.'}</p>
          </div>
          <div className="auth-tabs" role="tablist" aria-label="Account options">
            <button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => changeMode('login')}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'selected' : ''} onClick={() => changeMode('signup')}>Create account</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                Full name
                <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" minLength="2" maxLength="120" required />
              </label>
            )}
            <label>
              Campus email
              <input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" required />
            </label>
            <label>
              Password
              <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength="8" maxLength="72" required />
            </label>
            {error && <div className="inline-error" role="alert">{error}</div>}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? 'One moment…' : mode === 'login' ? 'Sign in to CampusHub' : 'Create my account'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="auth-footnote">By continuing, you agree to use CampusHub for your academic work.</p>
        </div>
      </section>
    </main>
  )
}

function Field({ field, value, onChange, projects }) {
  if (field.type === 'textarea') {
    return <textarea value={value || ''} onChange={onChange} rows="3" maxLength="5000" placeholder={field.placeholder} />
  }
  if (field.type === 'select') {
    return (
      <select value={value ?? field.options[0][0]} onChange={onChange}>
        {field.options.map(([optionValue, label]) => <option value={optionValue} key={optionValue}>{label}</option>)}
      </select>
    )
  }
  if (field.type === 'project') {
    return (
      <select value={value ?? ''} onChange={onChange}>
        <option value="">No project</option>
        {projects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}
      </select>
    )
  }
  return (
    <input
      type={field.type || 'text'}
      value={value ?? ''}
      onChange={onChange}
      required={field.required}
      maxLength={field.type === 'url' ? 500 : 180}
      placeholder={field.placeholder}
    />
  )
}

function Modal({ modal, onClose, onSave, onFeedback, projects, saving, error }) {
  const isFeedback = modal.type === 'feedback'
  const details = resourceDetails[modal.type]
  const [values, setValues] = useState(() => modal.item ? { ...modal.item } : {})
  const [comment, setComment] = useState('')
  const [grade, setGrade] = useState('')

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (isFeedback) onFeedback({ projectId: modal.project.id, comment, grade })
    else {
      const payload = { ...values }
      if (modal.type === 'tasks' && payload.project_id) payload.project_id = Number(payload.project_id)
      for (const key of ['description', 'category', 'due_date', 'repository_url', 'submission_url', 'issuer', 'issue_date', 'credential_url', 'project_id']) {
        if (payload[key] === '') payload[key] = null
      }
      onSave(payload)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            <div className="eyebrow">{isFeedback ? 'FACULTY REVIEW' : modal.item ? 'EDIT DETAILS' : 'ADD TO YOUR WORKSPACE'}</div>
            <h2 id="modal-title">
              {isFeedback ? `Review ${modal.project.title}` : `${modal.item ? 'Edit' : 'Add'} ${details.singular}`}
            </h2>
          </div>
          <button type="button" className="icon-button close-button" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          {isFeedback ? (
            <>
              <label>Feedback<textarea value={comment} onChange={(event) => setComment(event.target.value)} rows="5" maxLength="5000" placeholder="Share specific, constructive feedback…" required /></label>
              <label>Grade <span className="optional-label">optional · out of 100</span><input type="number" min="0" max="100" step="0.5" value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="e.g. 88" /></label>
            </>
          ) : details.fields.map((field) => (
            <label key={field.name}>
              {field.label}{field.required && <span className="required-mark"> *</span>}
              <Field
                field={field}
                value={values[field.name]}
                projects={projects}
                onChange={(event) => updateField(field.name, event.target.value)}
              />
            </label>
          ))}
          {error && <div className="inline-error" role="alert">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button" disabled={saving}>{saving ? 'Saving…' : isFeedback ? 'Send review' : 'Save changes'} <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>
    </div>
  )
}

function ProjectCard({ project, feedback, isFaculty, onEdit, onDelete, onReview }) {
  const reviews = feedback.filter((item) => item.project_id === project.id)
  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className={`status-pill status-${project.status}`}>{project.status?.replace('-', ' ') || 'planning'}</span>
        {project.category && <span className="project-category">{project.category}</span>}
      </div>
      <h3>{project.title}</h3>
      {isFaculty && <p className="student-owner">by {project.student_name}</p>}
      <p className="project-description">{project.description || 'A new idea taking shape. Add a description to share more.'}</p>
      <div className="project-meta">
        <span><span className="meta-icon">◷</span> Due {formatDate(project.due_date)}</span>
        {reviews.length > 0 && <span><span className="meta-icon">✳</span> {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>}
      </div>
      {reviews.length > 0 && (
        <div className="project-feedback">
          <span className="feedback-mark">“</span>
          <div><p>{reviews[0].comment}</p><small>{reviews[0].faculty_name}{reviews[0].grade !== null ? ` · ${reviews[0].grade}/100` : ''}</small></div>
        </div>
      )}
      <div className="project-links">
        {project.repository_url && <a href={project.repository_url} target="_blank" rel="noreferrer">Repository ↗</a>}
        {project.submission_url && <a href={project.submission_url} target="_blank" rel="noreferrer">Submission ↗</a>}
      </div>
      <div className="card-actions">
        {isFaculty
          ? <button type="button" className="text-button" onClick={() => onReview(project)}>Write feedback <span>→</span></button>
          : <><button type="button" className="text-button" onClick={() => onEdit(project)}>Edit details</button><button type="button" className="text-button text-danger" onClick={() => onDelete(project)}>Delete</button></>}
      </div>
    </article>
  )
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

function App() {
  const dispatch = useDispatch()
  const { token, user, sessionChecking, sessionVerified } = useSelector((state) => state.auth)
  const { projects, tasks, skills, certifications, feedback, loading, saving, error } = useSelector((state) => state.data)
  const [activePage, setActivePage] = useState('overview')
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const isFaculty = user?.role === 'faculty'

  useEffect(() => {
    if (token) dispatch(loadDashboard(token))
  }, [dispatch, token])

  useEffect(() => {
    if (token && !sessionVerified) dispatch(verifySession(token))
  }, [dispatch, sessionVerified, token])

  const pendingTasks = tasks.filter((task) => task.status !== 'done')
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  const visibleProjects = useMemo(() => projects.filter((project) =>
    `${project.title} ${project.description || ''} ${project.category || ''} ${project.student_name || ''}`.toLowerCase().includes(search.toLowerCase()),
  ), [projects, search])
  const visibleTasks = useMemo(() => tasks.filter((task) =>
    `${task.title} ${task.description || ''}`.toLowerCase().includes(search.toLowerCase()),
  ), [tasks, search])
  const greetingName = user?.name?.trim().split(/\s+/)[0] || 'there'
  const isManageable = !isFaculty && resourceDetails[activePage]

  if (sessionChecking || (token && !sessionVerified)) {
    return <main className="session-loading">Opening your workspace…</main>
  }
  if (!token || !user) return <AuthScreen />

  function openEditor(resource, item = null) {
    dispatch(clearDataError())
    setModal({ type: resource, item })
  }

  function openFeedback(project) {
    dispatch(clearDataError())
    setModal({ type: 'feedback', project })
  }

  function save(payload) {
    const promise = modal.type === 'feedback'
      ? dispatch(saveFeedback({ ...payload, token }))
      : dispatch(saveItem({ resource: modal.type, values: payload, itemId: modal.item?.id, token }))
    promise.unwrap().then(() => setModal(null)).catch(() => {})
  }

  function remove(resource, item) {
    if (window.confirm(`Delete "${item.title || item.name}"? This cannot be undone.`)) {
      dispatch(deleteItem({ resource, itemId: item.id, token }))
    }
  }

  function renderProjectCards(items) {
    if (!items.length) {
      return <EmptyState icon="▧" title="Your next project starts here" description={isFaculty ? 'Student submissions will show up here when they are ready.' : 'Bring an idea to life. Add a project to start tracking your progress.'} action={!isFaculty && <button className="text-button" type="button" onClick={() => openEditor('projects')}>Add your first project →</button>} />
    }
    return <div className="project-grid">{items.map((project) => <ProjectCard key={project.id} project={project} feedback={feedback} isFaculty={isFaculty} onEdit={(item) => openEditor('projects', item)} onDelete={(item) => remove('projects', item)} onReview={openFeedback} />)}</div>
  }

  function renderTasks(items) {
    if (!items.length) return <EmptyState icon="☷" title="A little room to plan" description="Add a task to turn your next milestone into something manageable." action={<button className="text-button" type="button" onClick={() => openEditor('tasks')}>Create a task →</button>} />
    return (
      <div className="task-list">
        {items.map((task) => {
          const project = projects.find((item) => item.id === task.project_id)
          return (
            <article className={`task-row ${task.status === 'done' ? 'task-complete' : ''}`} key={task.id}>
              <span className={`task-check ${task.status === 'done' ? 'checked' : ''}`}>{task.status === 'done' ? '✓' : ''}</span>
              <div className="task-copy"><h3>{task.title}</h3><p>{project?.title || task.description || 'Independent task'}</p></div>
              <span className={`priority-label priority-${task.priority}`}>{task.priority}</span>
              <span className="task-date">{formatDate(task.due_date)}</span>
              <div className="task-actions"><button type="button" className="text-button" onClick={() => openEditor('tasks', task)}>Edit</button><button type="button" className="text-button text-danger" onClick={() => remove('tasks', task)}>Delete</button></div>
            </article>
          )
        })}
      </div>
    )
  }

  const visibleNavigation = navigation.filter((item) => !item.facultyOnly || isFaculty)
  const titleByPage = {
    overview: isFaculty ? 'Faculty workspace' : 'Your workspace',
    projects: isFaculty ? 'Student projects' : 'Your projects',
    tasks: 'My tasks',
    skills: 'Skills & strengths',
    certifications: 'Certifications',
    reviews: 'Project reviews',
  }
  const introByPage = {
    overview: isFaculty ? 'Review student work and share thoughtful feedback.' : 'A little progress, consistently, adds up to a lot.',
    projects: isFaculty ? 'Explore submissions and help students move forward.' : 'Keep every idea, update, and submission in one place.',
    tasks: 'Make the next step the easiest one to take.',
    skills: 'A growing picture of what you can do.',
    certifications: 'Keep your achievements easy to find.',
    reviews: 'Feedback you have shared with students.',
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActivePage('overview')}>
          <span className="brand-mark">c</span>
          <span>campus<span>hub</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {visibleNavigation.map((item) => (
            <button type="button" key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => { setActivePage(item.id); setSearch('') }}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {item.id === 'tasks' && pendingTasks.length > 0 && <span className="nav-count">{pendingTasks.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-sparkle">✳</span>
            <strong>Small steps count.</strong>
            <p>You are building more than a project. Keep going.</p>
          </div>
          <div className="profile-row">
            <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || 'C'}</div>
            <div className="profile-copy"><strong>{user.name}</strong><span>{isFaculty ? 'Faculty' : 'Student'}</span></div>
            <button type="button" className="signout-button" onClick={() => { dispatch(signOut()); dispatch(resetData()) }} title="Sign out" aria-label="Sign out">↗</button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{titleByPage[activePage]}</strong></div>
          <div className="topbar-right">
            <span className="today-label">{new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <div className="top-avatar">{user.name?.charAt(0)?.toUpperCase() || 'C'}</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading">
            <div>
              <div className="eyebrow">{activePage === 'overview' ? 'YOUR CAMPUS, IN SYNC' : 'KEEP THE MOMENTUM'}</div>
              <h1>{activePage === 'overview' ? <>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {greetingName}<span className="wave">✳</span></> : titleByPage[activePage]}</h1>
              <p>{activePage === 'overview' ? introByPage.overview : introByPage[activePage]}</p>
            </div>
            {isManageable && <button type="button" className="primary-button heading-button" onClick={() => openEditor(activePage)}><span className="plus-icon">+</span> Add {resourceDetails[activePage].singular}</button>}
            {isFaculty && activePage === 'reviews' && <button type="button" className="secondary-button" onClick={() => setActivePage('projects')}>Browse projects →</button>}
            {!isFaculty && activePage === 'overview' && <button type="button" className="primary-button heading-button" onClick={() => openEditor('projects')}><span className="plus-icon">+</span> New project</button>}
          </section>

          {error && <div className="notice-error" role="alert"><span>{error}</span><button type="button" onClick={() => dispatch(clearDataError())} aria-label="Dismiss error">×</button></div>}

          {activePage === 'overview' && !isFaculty && (
            <>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <div className="banner-label"><span /> YOUR SEMESTER, AT A GLANCE</div>
                  <h2>Look how far<br />you have come.</h2>
                  <p>Your progress is made up of every small step. Keep showing up.</p>
                  <button type="button" onClick={() => setActivePage('projects')}>Explore your projects <span>→</span></button>
                </div>
                <div className="banner-art" aria-hidden="true">
                  <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
                  <div className="art-sun">✳</div>
                  <div className="art-card art-card-back"><span>THIS WEEK</span><b>3 tasks done</b><i>↗</i></div>
                  <div className="art-card art-card-front"><span>YOUR MOMENTUM</span><b>{progress}%</b><div className="art-progress"><i style={{ width: `${progress}%` }} /></div><small>semester progress</small></div>
                  <span className="art-star star-one">✦</span><span className="art-star star-two">✳</span>
                </div>
                <div className="banner-number">01 <span>—</span> KEEP GOING</div>
              </section>
              <section className="stats-grid">
                <article className="stat-card"><div className="stat-heading"><span className="stat-icon stat-violet">▧</span><span className="stat-caption">IN MOTION</span></div><strong>{projects.length.toString().padStart(2, '0')}</strong><span className="stat-foot">active projects</span><div className="stat-decoration">↗</div></article>
                <article className="stat-card"><div className="stat-heading"><span className="stat-icon stat-peach">☷</span><span className="stat-caption">ON YOUR LIST</span></div><strong>{pendingTasks.length.toString().padStart(2, '0')}</strong><span className="stat-foot">open tasks <span className="muted-separator">·</span> {completedTasks} complete</span><div className="stat-decoration">↗</div></article>
                <article className="stat-card"><div className="stat-heading"><span className="stat-icon stat-mint">✳</span><span className="stat-caption">IN YOUR TOOLKIT</span></div><strong>{skills.length.toString().padStart(2, '0')}</strong><span className="stat-foot">skills and growing</span><div className="stat-decoration">↗</div></article>
                <article className="stat-card"><div className="stat-heading"><span className="stat-icon stat-blue">◇</span><span className="stat-caption">MILESTONES</span></div><strong>{certifications.length.toString().padStart(2, '0')}</strong><span className="stat-foot">certifications earned</span><div className="stat-decoration">↗</div></article>
              </section>
              <section className="overview-lower">
                <div className="section-panel projects-preview">
                  <div className="section-heading"><div><div className="eyebrow">WHAT YOU ARE BUILDING</div><h2>Projects in motion</h2></div><button type="button" className="view-all" onClick={() => setActivePage('projects')}>View all <span>→</span></button></div>
                  {loading && !projects.length ? <div className="loading-line">Loading your workspace…</div> : renderProjectCards(projects.slice(0, 2))}
                </div>
                <aside className="section-panel tasks-preview">
                  <div className="section-heading"><div><div className="eyebrow">ONE THING AT A TIME</div><h2>Coming up</h2></div><button type="button" className="view-all" onClick={() => setActivePage('tasks')}>All tasks <span>→</span></button></div>
                  {pendingTasks.length ? (
                    <div className="upcoming-list">{pendingTasks.slice(0, 4).map((task) => (
                      <button type="button" className="upcoming-item" key={task.id} onClick={() => { setActivePage('tasks'); openEditor('tasks', task) }}>
                        <span className={`upcoming-dot priority-dot-${task.priority}`} /><span className="upcoming-copy"><strong>{task.title}</strong><small>{formatDate(task.due_date)}</small></span><span className="upcoming-arrow">↗</span>
                      </button>
                    ))}</div>
                  ) : <p className="quiet-empty">Nothing waiting on you. Enjoy the breathing room.</p>}
                </aside>
              </section>
            </>
          )}

          {activePage === 'overview' && isFaculty && (
            <section className="faculty-summary">
              <article className="stat-card"><div className="stat-heading"><span className="stat-icon stat-violet">▧</span><span className="stat-caption">STUDENT WORK</span></div><strong>{projects.length.toString().padStart(2, '0')}</strong><span className="stat-foot">projects to explore</span></article>
              <article className="stat-card"><div className="stat-heading"><span className="stat-icon stat-mint">✳</span><span className="stat-caption">FEEDBACK SHARED</span></div><strong>{feedback.length.toString().padStart(2, '0')}</strong><span className="stat-foot">reviews given</span></article>
              <div className="section-panel faculty-projects"><div className="section-heading"><div><div className="eyebrow">STUDENT SUBMISSIONS</div><h2>Recent projects</h2></div><button type="button" className="view-all" onClick={() => setActivePage('projects')}>All projects <span>→</span></button></div>{loading && !projects.length ? <div className="loading-line">Loading student work…</div> : renderProjectCards(projects.slice(0, 3))}</div>
            </section>
          )}

          {activePage === 'projects' && (
            <>
              <div className="collection-toolbar"><span>{visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}</span><label className="search-field"><span>⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a project" /></label></div>
              {loading && !projects.length ? <div className="loading-line">Loading projects…</div> : renderProjectCards(visibleProjects)}
            </>
          )}

          {activePage === 'tasks' && (
            <>
              <div className="collection-toolbar"><span>{visibleTasks.filter((task) => task.status !== 'done').length} open · {visibleTasks.length} total</span><label className="search-field"><span>⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a task" /></label></div>
              {loading && !tasks.length ? <div className="loading-line">Loading tasks…</div> : renderTasks(visibleTasks)}
            </>
          )}

          {activePage === 'skills' && (
            skills.length ? <div className="skills-grid">{skills.map((skill) => (
              <article className="skill-card" key={skill.id}><span className="skill-card-mark">✳</span><div><h3>{skill.name}</h3><span className={`skill-level level-${skill.level}`}>{skill.level}</span></div><div className="skill-actions"><button type="button" className="icon-button" onClick={() => openEditor('skills', skill)} aria-label={`Edit ${skill.name}`}>✎</button><button type="button" className="icon-button" onClick={() => remove('skills', skill)} aria-label={`Delete ${skill.name}`}>×</button></div></article>
            ))}</div> : <EmptyState icon="✳" title="Your skills, in one place" description="Capture what you know today and watch your toolkit grow." action={<button type="button" className="text-button" onClick={() => openEditor('skills')}>Add a skill →</button>} />
          )}

          {activePage === 'certifications' && (
            certifications.length ? <div className="cert-grid">{certifications.map((certificate) => (
              <article className="cert-card" key={certificate.id}><div className="cert-icon">◇</div><div className="cert-date">{formatDate(certificate.issue_date)}</div><h3>{certificate.name}</h3><p>{certificate.issuer || 'Independent certification'}</p>{certificate.credential_url && <a href={certificate.credential_url} target="_blank" rel="noreferrer">View credential ↗</a>}<div className="cert-actions"><button type="button" className="text-button" onClick={() => openEditor('certifications', certificate)}>Edit</button><button type="button" className="text-button text-danger" onClick={() => remove('certifications', certificate)}>Delete</button></div></article>
            ))}</div> : <EmptyState icon="◇" title="Celebrate what you have earned" description="Save a certification here so your achievements are always close at hand." action={<button type="button" className="text-button" onClick={() => openEditor('certifications')}>Add a certification →</button>} />
          )}

          {activePage === 'reviews' && (
            feedback.length ? <div className="reviews-list">{feedback.map((item) => {
              const project = projects.find((entry) => entry.id === item.project_id)
              return <article className="review-card" key={item.id}><div className="review-top"><span className="review-project">{project?.title || 'Student project'}</span><span>{formatDate(item.created_at)}</span></div><p>“{item.comment}”</p><div className="review-bottom"><span>For {project?.student_name || 'student'} · by you</span>{item.grade !== null && <strong>{item.grade}/100</strong>}</div></article>
            })}</div> : <EmptyState icon="▤" title="Your feedback lives here" description="Open a student project to share a review. Your feedback will appear here." action={<button type="button" className="text-button" onClick={() => setActivePage('projects')}>Browse student projects →</button>} />
          )}

          <footer className="page-footer"><span>Made for curious minds.</span><span>CampusHub <b>·</b> Keep showing up.</span></footer>
        </div>
      </main>

      {modal && <Modal modal={modal} onClose={() => setModal(null)} onSave={save} onFeedback={save} projects={projects} saving={saving} error={error} />}
    </div>
  )
}

export default App
