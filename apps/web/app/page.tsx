export default async function Mesh() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Mesh
        </h1>
        <p className="page-subtitle">
          Live community status: wins, milestones, polls, ideas, and updates
        </p>
      </div>

      <div className="grid grid-3">
        {/* Today's Wins */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Today's Wins
            </h3>
            <p className="card-subtitle">Celebrating our achievements</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <span className="status-text">Project Alpha milestone reached</span>
            </li>
            <li className="status-item">
              <span className="status-text">3 PRs merged successfully</span>
            </li>
            <li className="status-item">
              <span className="status-text">Sprint goals completed</span>
            </li>
          </ul>
        </div>

        {/* Next Milestones */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Next Milestones
            </h3>
            <p className="card-subtitle">Upcoming targets and deadlines</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <div className="status-content">
                <span className="status-text"><strong>Tomorrow:</strong> Beta demo review</span>
                <span className="status-time">24h</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text"><strong>This week:</strong> Growth sprint planning</span>
                <span className="status-time">7d</span>
              </div>
            </li>
            <li className="status-item">
              <div className="status-content">
                <span className="status-text"><strong>Next week:</strong> Investor pitch prep</span>
                <span className="status-time">14d</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Idea Sparks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Idea Sparks
            </h3>
            <p className="card-subtitle">Innovation in progress</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <span className="status-text">AI-powered analytics dashboard</span>
            </li>
            <li className="status-item">
              <span className="status-text">Mobile app MVP concept</span>
            </li>
            <li className="status-item">
              <span className="status-text">Partnership expansion strategy</span>
            </li>
          </ul>
        </div>

        {/* Polls in Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Polls in Progress
            </h3>
            <p className="card-subtitle">Community decisions pending</p>
          </div>
          <ul className="status-list">
            <li className="status-item">
              <div className="status-content">
                <span className="status-text">Sprint theme selection</span>
                <span className="status-time warning">2d</span>
              </div>
            </li>
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
