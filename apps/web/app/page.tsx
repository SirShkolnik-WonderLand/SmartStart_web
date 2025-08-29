export default async function Home() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          SmartStart
        </h1>
        <p className="page-subtitle">
          Community-driven development platform for building ventures together
        </p>
      </div>

      <div className="grid grid-3">
        {/* Welcome */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Welcome to SmartStart
            </h3>
            <p className="card-subtitle">Your community-driven development platform</p>
          </div>
          <div className="card-content">
            <p>SmartStart brings together project management, equity tracking, contribution management, and community collaboration in one secure, scalable solution.</p>
            <div className="button-group">
              <a href="/projects" className="button button-primary">View Projects</a>
              <a href="/mesh" className="button button-secondary">Community Mesh</a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Platform Stats
            </h3>
            <p className="card-subtitle">Current activity overview</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <span className="status-text">Active Projects: 3</span>
            </li>
            <li className="status-item">
              <span className="status-text">Community Members: 12</span>
            </li>
            <li className="status-item">
              <span className="status-text">Total Contributions: 47</span>
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Recent Activity
            </h3>
            <p className="card-subtitle">Latest community updates</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <span className="status-text">New project proposal submitted</span>
            </li>
            <li className="status-item">
              <span className="status-text">Community poll created</span>
            </li>
            <li className="status-item">
              <span className="status-text">Equity distribution updated</span>
            </li>
          </ul>
        </div>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Feature priority ranking</span>
                <span className="status-time danger">24h</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Partnership decision</span>
                <span className="status-time">7d</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Needs Help */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Needs Help
            </h3>
            <p className="card-subtitle">Opportunities to contribute</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Growth sprint contributor</span>
                <span className="status-badge badge-warning">2 weeks</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">UI/UX designer for mobile app</span>
                <span className="status-badge badge-primary">Open</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Data analyst for metrics</span>
                <span className="status-badge badge-info">Urgent</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Kudos */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Kudos
            </h3>
            <p className="card-subtitle">Recognition and appreciation</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Sarah for excellent sprint leadership</span>
                <span className="status-badge badge-success">Today</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Mike for hitting all milestone targets</span>
                <span className="status-badge badge-success">Yesterday</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Team for collaborative problem-solving</span>
                <span className="status-badge badge-success">This week</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="call-to-action">
        <div className="cta-content">
          <h3 className="cta-title">
            Ready to contribute?
          </h3>
          <p className="cta-text">
            Check the Projects tab to see available opportunities, or submit your ideas in the Ideas section. 
            Every contribution builds your portfolio and strengthens the community!
          </p>
          <div className="cta-actions">
            <a href="/projects" className="btn btn-primary">
              <span>View Projects</span>
              <span>→</span>
            </a>
            <a href="/ideas" className="btn">
              <span>Submit Idea</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
