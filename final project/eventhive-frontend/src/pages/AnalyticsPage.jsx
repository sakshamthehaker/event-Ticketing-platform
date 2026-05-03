import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getEventClustersRequest,
  getUserSegmentsRequest,
  getAnomaliesRequest,
} from "../services/mlService";
import { formatCurrency } from "../utils/format";
import { Link } from "react-router-dom";

const TABS = [
  { id: "clusters", label: "🎯 Event Clusters", subtitle: "K-Means Clustering" },
  { id: "segments", label: "👥 User Segments", subtitle: "Behavior Analysis" },
  { id: "anomalies", label: "🚨 Anomalies", subtitle: "Outlier Detection" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("clusters");
  const [clusterData, setClusterData] = useState(null);
  const [segmentData, setSegmentData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      if (tab === "clusters" && !clusterData) {
        const res = await getEventClustersRequest();
        setClusterData(res.data.data);
      } else if (tab === "segments" && !segmentData) {
        const res = await getUserSegmentsRequest();
        setSegmentData(res.data.data);
      } else if (tab === "anomalies" && !anomalyData) {
        const res = await getAnomaliesRequest();
        setAnomalyData(res.data.data);
      }
    } catch {
      // Toast will show via apiClient interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <PageShell
      title="ML Analytics"
      subtitle="🧠 Unsupervised Learning Insights — powered by K-Means & Z-Score"
    >
      {/* Tab Navigation */}
      <div className="analytics-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`analytics-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-subtitle">{tab.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="analytics-content">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === "clusters" && <ClustersTab data={clusterData} />}
            {activeTab === "segments" && <SegmentsTab data={segmentData} />}
            {activeTab === "anomalies" && <AnomaliesTab data={anomalyData} />}
          </>
        )}
      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════
   TAB 1: EVENT CLUSTERS
   ═══════════════════════════════════════ */
function ClustersTab({ data }) {
  if (!data) return null;

  return (
    <div className="ml-section">
      {/* Model info card */}
      <div className="card ml-info-card">
        <div className="ml-info-header">
          <span className="ml-model-icon">🎯</span>
          <div>
            <h3>K-Means Event Clustering</h3>
            <p className="muted">
              Automatically groups events into categories using TF-IDF text
              vectorization + normalized numeric features
            </p>
          </div>
        </div>
        <div className="ml-stats-row">
          <div className="ml-stat">
            <span className="ml-stat-value">{data.totalEvents}</span>
            <span className="ml-stat-label">Events Analyzed</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">{data.clusterCount}</span>
            <span className="ml-stat-label">Clusters Found</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">K={data.kValue}</span>
            <span className="ml-stat-label">K Value</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">{data.algorithm}</span>
            <span className="ml-stat-label">Algorithm</span>
          </div>
        </div>
        <div className="ml-features">
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            Features:{" "}
          </span>
          {data.features?.map((f, i) => (
            <span key={i} className="feature-chip">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Cluster cards */}
      {data.clusters?.length ? (
        <div className="clusters-grid">
          {data.clusters.map((cluster) => (
            <div key={cluster.clusterId} className="card cluster-card">
              <div className="cluster-header">
                <div
                  className="cluster-badge"
                  style={{
                    background: `hsl(${cluster.clusterId * 72}, 70%, 50%)`,
                  }}
                >
                  C{cluster.clusterId + 1}
                </div>
                <div>
                  <h3>{cluster.label || `Cluster ${cluster.clusterId + 1}`}</h3>
                  <p className="muted" style={{ fontSize: "0.85rem" }}>
                    {cluster.eventCount} event(s) · Avg ₹
                    {cluster.averagePrice} · ~{cluster.averageSeats} seats
                  </p>
                </div>
              </div>

              <div className="cluster-events">
                {cluster.events?.slice(0, 5).map((event) => (
                  <Link
                    key={event._id}
                    to={`/events/${event._id}`}
                    className="cluster-event-item"
                  >
                    <span className="cluster-event-title">{event.title}</span>
                    <span className="muted" style={{ fontSize: "0.8rem" }}>
                      📍 {event.location} · {formatCurrency(event.price)}
                    </span>
                  </Link>
                ))}
                {cluster.eventCount > 5 && (
                  <p
                    className="muted"
                    style={{ fontSize: "0.8rem", textAlign: "center" }}
                  >
                    +{cluster.eventCount - 5} more events
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="🎯" message="Not enough events to form clusters. Create more events!" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   TAB 2: USER SEGMENTS
   ═══════════════════════════════════════ */
function SegmentsTab({ data }) {
  if (!data) return null;

  return (
    <div className="ml-section">
      {/* Model info */}
      <div className="card ml-info-card">
        <div className="ml-info-header">
          <span className="ml-model-icon">👥</span>
          <div>
            <h3>K-Means User Segmentation</h3>
            <p className="muted">
              Clusters users into behavior-based segments by analyzing booking
              patterns, spending, frequency, and cancellation rates
            </p>
          </div>
        </div>
        <div className="ml-stats-row">
          <div className="ml-stat">
            <span className="ml-stat-value">{data.totalUsers}</span>
            <span className="ml-stat-label">Total Users</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">{data.activeUsers}</span>
            <span className="ml-stat-label">Active Users</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">{data.segmentCount}</span>
            <span className="ml-stat-label">Segments</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">K={data.kValue}</span>
            <span className="ml-stat-label">K Value</span>
          </div>
        </div>
        <div className="ml-features">
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            Features:{" "}
          </span>
          {data.features?.map((f, i) => (
            <span key={i} className="feature-chip">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Segment cards */}
      {data.segments?.length ? (
        <div className="segments-grid">
          {data.segments.map((segment) => (
            <div key={segment.segmentId} className="card segment-card">
              <div className="segment-header">
                <span
                  className="segment-icon"
                  style={{
                    background: `${segment.color}20`,
                    border: `1px solid ${segment.color}40`,
                  }}
                >
                  {segment.icon}
                </span>
                <div>
                  <h3 style={{ color: segment.color }}>{segment.name}</h3>
                  <p className="muted" style={{ fontSize: "0.85rem" }}>
                    {segment.description}
                  </p>
                </div>
              </div>

              <div className="segment-stats">
                <div className="segment-stat-item">
                  <span className="segment-stat-value">
                    {segment.userCount}
                  </span>
                  <span className="segment-stat-label">Users</span>
                </div>
                <div className="segment-stat-item">
                  <span className="segment-stat-value">
                    {segment.avgBookings}
                  </span>
                  <span className="segment-stat-label">Avg Bookings</span>
                </div>
                <div className="segment-stat-item">
                  <span className="segment-stat-value">
                    {segment.avgSeatsPerBooking}
                  </span>
                  <span className="segment-stat-label">Avg Seats</span>
                </div>
                <div className="segment-stat-item">
                  <span className="segment-stat-value">
                    {segment.cancellationRate}%
                  </span>
                  <span className="segment-stat-label">Cancel Rate</span>
                </div>
              </div>

              {segment.users?.length > 0 && (
                <div className="segment-users">
                  <p
                    className="muted"
                    style={{
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    Users in segment
                  </p>
                  {segment.users.slice(0, 4).map((user) => (
                    <div key={user._id} className="segment-user-row">
                      <span>{user.name}</span>
                      <span className="muted" style={{ fontSize: "0.82rem" }}>
                        {user.totalBookings} bookings
                      </span>
                    </div>
                  ))}
                  {segment.userCount > 4 && (
                    <p
                      className="muted"
                      style={{ fontSize: "0.8rem", textAlign: "center" }}
                    >
                      +{segment.userCount - 4} more
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="👥" message="Not enough booking data to segment users. Need at least 2 active users with bookings." />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   TAB 3: ANOMALY DETECTION
   ═══════════════════════════════════════ */
function AnomaliesTab({ data }) {
  if (!data) return null;

  return (
    <div className="ml-section">
      {/* Model info */}
      <div className="card ml-info-card">
        <div className="ml-info-header">
          <span className="ml-model-icon">🚨</span>
          <div>
            <h3>Statistical Anomaly Detection</h3>
            <p className="muted">
              Identifies unusual booking patterns using Z-Score analysis and
              statistical outlier detection across multiple features
            </p>
          </div>
        </div>
        <div className="ml-stats-row">
          <div className="ml-stat">
            <span className="ml-stat-value">{data.totalAnalyzed}</span>
            <span className="ml-stat-label">Bookings Analyzed</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">{data.anomalyCount}</span>
            <span className="ml-stat-label">Anomalies Found</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">
              Z&gt;{data.thresholds?.zScoreThreshold}
            </span>
            <span className="ml-stat-label">Z-Score Threshold</span>
          </div>
          <div className="ml-stat">
            <span className="ml-stat-value">{data.algorithm?.split(" ")[0]}</span>
            <span className="ml-stat-label">Method</span>
          </div>
        </div>
        <div className="ml-features">
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            Detection features:{" "}
          </span>
          {data.features?.map((f, i) => (
            <span key={i} className="feature-chip">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Anomaly list */}
      {data.anomalies?.length ? (
        <div className="anomalies-list">
          {data.anomalies.map((anomaly, idx) => (
            <div
              key={idx}
              className={`card anomaly-card severity-${anomaly.severity}`}
            >
              <div className="anomaly-header">
                <div className="anomaly-icon-wrap">
                  <span className="anomaly-type-icon">{anomaly.icon}</span>
                  <span
                    className={`anomaly-severity badge ${anomaly.severity === "high" ? "cancelled" : "pending"}`}
                  >
                    {anomaly.severity}
                  </span>
                </div>
                <div className="anomaly-info">
                  <h4>{anomaly.description}</h4>
                  <p className="muted" style={{ fontSize: "0.82rem" }}>
                    Type:{" "}
                    {anomaly.type.replace(/_/g, " ").replace(/\b\w/g, (c) =>
                      c.toUpperCase()
                    )}
                  </p>
                </div>
              </div>

              <div className="anomaly-details">
                {anomaly.booking?.user && (
                  <span>
                    👤 {anomaly.booking.user.name || anomaly.booking.user.email}
                  </span>
                )}
                {anomaly.booking?.event && (
                  <span>🎪 {anomaly.booking.event.title}</span>
                )}
                {anomaly.booking?.seatsBooked && (
                  <span>🎫 {anomaly.booking.seatsBooked} seats</span>
                )}
                {anomaly.details?.zScore != null && (
                  <span>
                    📊 Z-Score: {anomaly.details.zScore}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="✅" message="No anomalies detected! All booking patterns appear normal." />
      )}
    </div>
  );
}

/* ── Empty State Component ── */
function EmptyState({ icon, message }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
      <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{icon}</p>
      <p className="muted" style={{ fontSize: "1.05rem" }}>
        {message}
      </p>
    </div>
  );
}
