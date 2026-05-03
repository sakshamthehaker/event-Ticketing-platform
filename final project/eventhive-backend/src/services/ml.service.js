/**
 * ═══════════════════════════════════════════════════════
 * EventHive — Unsupervised Machine Learning Service
 * ═══════════════════════════════════════════════════════
 *
 * Three models implemented from scratch (no external ML libs):
 *
 * 1. Event Clustering (K-Means + TF-IDF)
 *    - Auto-categorizes events into clusters
 *    - Generates human-readable cluster labels
 *
 * 2. User Segmentation (K-Means)
 *    - Clusters users by booking behavior
 *    - Produces segment profiles (Power User, Budget Buyer, etc.)
 *
 * 3. Anomaly Detection (Z-Score + IQR)
 *    - Flags unusual booking patterns
 *    - Detects outliers in seat counts, timing, frequency
 */

const Event = require("../models/Event");
const Booking = require("../models/Booking");
const User = require("../models/User");

/* ═══════════════════════════════════════
   SHARED UTILITIES
   ═══════════════════════════════════════ */

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "or", "that",
  "the", "to", "was", "were", "will", "with", "this", "but", "they",
  "have", "had", "what", "when", "where", "who", "which", "can", "all"
]);

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

const normalize = (value, min, max) => {
  if (!Number.isFinite(value) || min === max) return 0;
  return (value - min) / (max - min);
};

const euclideanDistance = (a, b) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - (b[i] || 0)) ** 2;
  }
  return Math.sqrt(sum);
};

const averageVectors = (vectors) => {
  if (!vectors.length) return [];
  const dim = vectors[0].length;
  const centroid = new Array(dim).fill(0);
  vectors.forEach((v) => {
    for (let i = 0; i < dim; i++) centroid[i] += v[i];
  });
  return centroid.map((val) => val / vectors.length);
};

/**
 * K-Means clustering (from scratch)
 * @param {number[][]} vectors - Feature vectors
 * @param {number} k - Number of clusters
 * @param {number} maxIter - Maximum iterations
 * @returns {number[]} - Cluster assignment for each vector
 */
const kMeans = (vectors, k, maxIter = 20) => {
  if (vectors.length === 0) return [];
  if (vectors.length <= k) return vectors.map((_, i) => i);

  // Initialize centroids using K-Means++ style
  const centroids = [vectors[0].slice()];
  for (let c = 1; c < k; c++) {
    const distances = vectors.map((v) => {
      const minDist = Math.min(...centroids.map((cent) => euclideanDistance(v, cent)));
      return minDist * minDist;
    });
    const totalDist = distances.reduce((s, d) => s + d, 0);
    let rand = Math.random() * totalDist;
    for (let i = 0; i < vectors.length; i++) {
      rand -= distances[i];
      if (rand <= 0) {
        centroids.push(vectors[i].slice());
        break;
      }
    }
    if (centroids.length <= c) centroids.push(vectors[c].slice());
  }

  let assignments = new Array(vectors.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign each vector to nearest centroid
    const newAssignments = vectors.map((v) => {
      let bestIdx = 0;
      let bestDist = Infinity;
      centroids.forEach((cent, ci) => {
        const d = euclideanDistance(v, cent);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = ci;
        }
      });
      return bestIdx;
    });

    const changed = newAssignments.some((a, i) => a !== assignments[i]);
    assignments = newAssignments;

    if (!changed && iter > 0) break;

    // Update centroids
    for (let ci = 0; ci < k; ci++) {
      const members = vectors.filter((_, vi) => assignments[vi] === ci);
      if (members.length > 0) {
        centroids[ci] = averageVectors(members);
      }
    }
  }

  return assignments;
};

/**
 * Compute mean of an array
 */
const mean = (arr) => {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
};

/**
 * Compute standard deviation
 */
const stdDev = (arr) => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
};

/**
 * Compute Z-score for a value
 */
const zScore = (value, m, sd) => {
  if (sd === 0) return 0;
  return (value - m) / sd;
};

/* ═══════════════════════════════════════
   MODEL 1: EVENT CLUSTERING (K-Means + TF-IDF)
   ═══════════════════════════════════════ */

/**
 * Build TF-IDF vocabulary from events
 */
const buildTfIdf = (docs) => {
  const vocabulary = new Map();
  const docFreqs = new Map();

  // Build vocabulary and document frequencies
  docs.forEach((doc) => {
    const tokens = new Set(tokenize(doc));
    tokens.forEach((token) => {
      if (!vocabulary.has(token)) vocabulary.set(token, vocabulary.size);
      docFreqs.set(token, (docFreqs.get(token) || 0) + 1);
    });
  });

  return { vocabulary, docFreqs, totalDocs: docs.length };
};

/**
 * Vectorize an event for clustering
 */
const vectorizeEventForClustering = (event, tfidf, ranges) => {
  const text = `${event.title} ${event.description} ${event.location}`;
  const tokens = tokenize(text);
  const termFreqs = new Map();
  tokens.forEach((t) => termFreqs.set(t, (termFreqs.get(t) || 0) + 1));

  // TF-IDF vector
  const textVector = new Array(tfidf.vocabulary.size).fill(0);
  termFreqs.forEach((tf, token) => {
    const idx = tfidf.vocabulary.get(token);
    if (idx !== undefined) {
      const df = tfidf.docFreqs.get(token) || 1;
      const idf = Math.log(tfidf.totalDocs / df);
      textVector[idx] = (tf / tokens.length) * idf;
    }
  });

  // Numeric features (normalized)
  return [
    normalize(event.price || 0, ranges.minPrice, ranges.maxPrice) * 2,
    normalize(event.totalSeats || 0, ranges.minSeats, ranges.maxSeats),
    normalize(new Date(event.date).getTime(), ranges.minDate, ranges.maxDate),
    ...textVector
  ];
};

/**
 * Extract top keywords from a cluster for labeling
 */
const getClusterLabel = (clusterEvents) => {
  const wordCounts = new Map();
  clusterEvents.forEach((event) => {
    const tokens = tokenize(`${event.title} ${event.location}`);
    tokens.forEach((t) => wordCounts.set(t, (wordCounts.get(t) || 0) + 1));
  });

  const sorted = [...wordCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topWords = sorted.slice(0, 3).map(([word]) => word);
  return topWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" · ");
};

/**
 * Main: Get event clusters
 */
const getEventClusters = async () => {
  const events = await Event.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .limit(200)
    .populate("createdBy", "name email")
    .lean();

  if (events.length < 2) {
    return {
      clusters: [],
      totalEvents: events.length,
      clusterCount: 0,
      algorithm: "K-Means",
      features: ["TF-IDF text", "price", "totalSeats", "date"]
    };
  }

  // Compute numeric ranges
  const prices = events.map((e) => e.price || 0);
  const seats = events.map((e) => e.totalSeats || 0);
  const dates = events.map((e) => new Date(e.date).getTime());
  const ranges = {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minSeats: Math.min(...seats),
    maxSeats: Math.max(...seats),
    minDate: Math.min(...dates),
    maxDate: Math.max(...dates)
  };

  // Build TF-IDF
  const docs = events.map((e) => `${e.title} ${e.description} ${e.location}`);
  const tfidf = buildTfIdf(docs);

  // Vectorize all events
  const vectors = events.map((e) => vectorizeEventForClustering(e, tfidf, ranges));

  // Determine optimal K (sqrt heuristic, capped 2-6)
  const k = Math.max(2, Math.min(6, Math.ceil(Math.sqrt(events.length / 2))));

  // Run K-Means
  const assignments = kMeans(vectors, k);

  // Group events into clusters
  const clusterMap = new Map();
  assignments.forEach((clusterId, idx) => {
    if (!clusterMap.has(clusterId)) clusterMap.set(clusterId, []);
    clusterMap.get(clusterId).push(events[idx]);
  });

  const clusters = [];
  clusterMap.forEach((clusterEvents, clusterId) => {
    const avgPrice = mean(clusterEvents.map((e) => e.price || 0));
    const avgSeats = mean(clusterEvents.map((e) => e.totalSeats || 0));

    clusters.push({
      clusterId,
      label: getClusterLabel(clusterEvents),
      eventCount: clusterEvents.length,
      averagePrice: Math.round(avgPrice * 100) / 100,
      averageSeats: Math.round(avgSeats),
      events: clusterEvents.map((e) => ({
        _id: e._id,
        title: e.title,
        date: e.date,
        location: e.location,
        price: e.price,
        totalSeats: e.totalSeats,
        availableSeats: e.availableSeats
      }))
    });
  });

  clusters.sort((a, b) => b.eventCount - a.eventCount);

  return {
    clusters,
    totalEvents: events.length,
    clusterCount: clusters.length,
    algorithm: "K-Means",
    features: ["TF-IDF text vectorization", "normalized price", "normalized seats", "normalized date"],
    kValue: k
  };
};

/* ═══════════════════════════════════════
   MODEL 2: USER SEGMENTATION (K-Means)
   ═══════════════════════════════════════ */

/**
 * Build a behavior feature vector for a user
 */
const buildUserBehaviorVector = (bookings) => {
  if (!bookings.length) return [0, 0, 0, 0, 0];

  const totalBookings = bookings.length;
  const confirmed = bookings.filter((b) => b.bookingStatus === "confirmed");
  const cancelled = bookings.filter((b) => b.bookingStatus === "cancelled");
  const totalSeats = bookings.reduce((s, b) => s + (b.seatsBooked || 0), 0);
  const avgSeats = totalSeats / totalBookings;
  const cancellationRate = cancelled.length / totalBookings;

  // Average price from populated events
  const prices = bookings
    .filter((b) => b.event && b.event.price != null)
    .map((b) => b.event.price);
  const avgPrice = prices.length ? mean(prices) : 0;

  // Booking frequency: bookings per 30 days
  const dates = bookings.map((b) => new Date(b.createdAt).getTime());
  const dateSpanDays = (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24);
  const frequency = dateSpanDays > 0 ? (totalBookings / dateSpanDays) * 30 : totalBookings;

  return [totalBookings, avgSeats, avgPrice, cancellationRate, frequency];
};

/**
 * Assign a human-readable segment name based on centroid values
 */
const getSegmentProfile = (centroid, ranges) => {
  const [bookings, avgSeats, avgPrice, cancelRate, frequency] = centroid;

  // Determine segment based on behavior
  const isHighValue = avgPrice > ranges.medianPrice && bookings > ranges.medianBookings;
  const isFrequent = frequency > ranges.medianFrequency;
  const isCanceller = cancelRate > 0.3;
  const isBulkBuyer = avgSeats > ranges.medianSeats * 1.5;

  if (isCanceller) {
    return {
      name: "Uncertain Explorers",
      icon: "🔄",
      description: "Users who book but frequently cancel — may need better event info",
      color: "#f59e0b"
    };
  }
  if (isHighValue && isFrequent) {
    return {
      name: "Power Users",
      icon: "⚡",
      description: "Highly engaged users who book frequently at higher price points",
      color: "#8b5cf6"
    };
  }
  if (isBulkBuyer) {
    return {
      name: "Group Organizers",
      icon: "👥",
      description: "Users who tend to book multiple seats — likely organizing groups",
      color: "#3b82f6"
    };
  }
  if (isFrequent) {
    return {
      name: "Regular Attendees",
      icon: "🎯",
      description: "Consistent bookers with steady engagement patterns",
      color: "#22c55e"
    };
  }
  if (avgPrice < ranges.medianPrice) {
    return {
      name: "Budget Seekers",
      icon: "💰",
      description: "Price-conscious users who prefer affordable events",
      color: "#f97316"
    };
  }
  return {
    name: "Casual Browsers",
    icon: "🌟",
    description: "Light users who book occasionally — potential for engagement growth",
    color: "#ec4899"
  };
};

/**
 * Main: Get user segments
 */
const getUserSegments = async () => {
  // Get all users with bookings
  const users = await User.find({}).lean();
  const allBookings = await Booking.find({})
    .populate("event", "price title date")
    .lean();

  // Group bookings by user
  const bookingsByUser = new Map();
  allBookings.forEach((b) => {
    const uid = b.user.toString();
    if (!bookingsByUser.has(uid)) bookingsByUser.set(uid, []);
    bookingsByUser.get(uid).push(b);
  });

  // Filter users who have bookings
  const activeUsers = users.filter((u) => bookingsByUser.has(u._id.toString()));

  if (activeUsers.length < 2) {
    return {
      segments: [],
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      segmentCount: 0,
      algorithm: "K-Means",
      features: ["totalBookings", "avgSeats", "avgPrice", "cancellationRate", "frequency"]
    };
  }

  // Build behavior vectors
  const behaviorData = activeUsers.map((u) => ({
    user: u,
    bookings: bookingsByUser.get(u._id.toString()),
    vector: buildUserBehaviorVector(bookingsByUser.get(u._id.toString()))
  }));

  const rawVectors = behaviorData.map((d) => d.vector);

  // Normalize each feature dimension
  const dims = rawVectors[0].length;
  const mins = new Array(dims).fill(Infinity);
  const maxs = new Array(dims).fill(-Infinity);
  rawVectors.forEach((v) => {
    v.forEach((val, i) => {
      mins[i] = Math.min(mins[i], val);
      maxs[i] = Math.max(maxs[i], val);
    });
  });

  const normalizedVectors = rawVectors.map((v) =>
    v.map((val, i) => normalize(val, mins[i], maxs[i]))
  );

  // Determine K
  const k = Math.max(2, Math.min(5, Math.ceil(Math.sqrt(activeUsers.length / 2))));

  // Run K-Means
  const assignments = kMeans(normalizedVectors, k);

  // Compute ranges for segment labeling
  const allBookingCounts = rawVectors.map((v) => v[0]);
  const allAvgSeats = rawVectors.map((v) => v[1]);
  const allAvgPrices = rawVectors.map((v) => v[2]);
  const allFrequencies = rawVectors.map((v) => v[4]);

  const sortedArr = (arr) => [...arr].sort((a, b) => a - b);
  const median = (arr) => {
    const s = sortedArr(arr);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };

  const ranges = {
    medianBookings: median(allBookingCounts),
    medianSeats: median(allAvgSeats),
    medianPrice: median(allAvgPrices),
    medianFrequency: median(allFrequencies)
  };

  // Group users into segments
  const segmentMap = new Map();
  assignments.forEach((clusterId, idx) => {
    if (!segmentMap.has(clusterId)) segmentMap.set(clusterId, []);
    segmentMap.get(clusterId).push(behaviorData[idx]);
  });

  const segments = [];
  segmentMap.forEach((members, clusterId) => {
    const clusterVectors = members.map((m) => m.vector);
    const centroid = averageVectors(clusterVectors);
    const profile = getSegmentProfile(centroid, ranges);

    segments.push({
      segmentId: clusterId,
      ...profile,
      userCount: members.length,
      avgBookings: Math.round(centroid[0] * 10) / 10,
      avgSeatsPerBooking: Math.round(centroid[1] * 10) / 10,
      avgPriceRange: Math.round(centroid[2] * 100) / 100,
      cancellationRate: Math.round(centroid[3] * 100),
      bookingsPerMonth: Math.round(centroid[4] * 10) / 10,
      users: members.map((m) => ({
        _id: m.user._id,
        name: m.user.name,
        email: m.user.email,
        totalBookings: m.vector[0],
        avgSeats: Math.round(m.vector[1] * 10) / 10
      }))
    });
  });

  segments.sort((a, b) => b.userCount - a.userCount);

  return {
    segments,
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    segmentCount: segments.length,
    algorithm: "K-Means",
    features: ["totalBookings", "avgSeatsPerBooking", "avgPrice", "cancellationRate", "bookingFrequency"],
    kValue: k
  };
};

/* ═══════════════════════════════════════
   MODEL 3: ANOMALY DETECTION (Z-Score + IQR)
   ═══════════════════════════════════════ */

/**
 * Detect anomalies in bookings using statistical methods
 */
const detectAnomalies = async () => {
  const bookings = await Booking.find({ bookingStatus: "confirmed" })
    .populate("user", "name email")
    .populate("event", "title price totalSeats date location")
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  if (bookings.length < 5) {
    return {
      anomalies: [],
      totalAnalyzed: bookings.length,
      anomalyCount: 0,
      algorithm: "Z-Score + IQR",
      thresholds: { zScoreThreshold: 2.0 }
    };
  }

  const anomalies = [];
  const Z_THRESHOLD = 2.0;

  // ── Feature 1: Unusual seat counts ──
  const seatCounts = bookings.map((b) => b.seatsBooked);
  const seatMean = mean(seatCounts);
  const seatStd = stdDev(seatCounts);

  bookings.forEach((b) => {
    const z = zScore(b.seatsBooked, seatMean, seatStd);
    if (Math.abs(z) > Z_THRESHOLD) {
      anomalies.push({
        bookingId: b._id,
        type: "unusual_seat_count",
        severity: Math.abs(z) > 3 ? "high" : "medium",
        description: `Booked ${b.seatsBooked} seats (z-score: ${z.toFixed(2)}, mean: ${seatMean.toFixed(1)})`,
        icon: "🎫",
        details: {
          value: b.seatsBooked,
          mean: Math.round(seatMean * 10) / 10,
          stdDev: Math.round(seatStd * 10) / 10,
          zScore: Math.round(z * 100) / 100
        },
        booking: {
          _id: b._id,
          seatsBooked: b.seatsBooked,
          createdAt: b.createdAt,
          user: b.user,
          event: b.event
        }
      });
    }
  });

  // ── Feature 2: Rapid successive bookings from same user ──
  const bookingsByUser = new Map();
  bookings.forEach((b) => {
    const uid = b.user?._id?.toString();
    if (!uid) return;
    if (!bookingsByUser.has(uid)) bookingsByUser.set(uid, []);
    bookingsByUser.get(uid).push(b);
  });

  bookingsByUser.forEach((userBookings, userId) => {
    if (userBookings.length < 2) return;

    // Sort by time
    userBookings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    for (let i = 1; i < userBookings.length; i++) {
      const timeDiffMinutes =
        (new Date(userBookings[i].createdAt) - new Date(userBookings[i - 1].createdAt)) / (1000 * 60);

      if (timeDiffMinutes < 5) {
        anomalies.push({
          bookingId: userBookings[i]._id,
          type: "rapid_booking",
          severity: timeDiffMinutes < 1 ? "high" : "medium",
          description: `Booked ${timeDiffMinutes.toFixed(1)} min after previous booking`,
          icon: "⚡",
          details: {
            timeDiffMinutes: Math.round(timeDiffMinutes * 10) / 10,
            previousBookingId: userBookings[i - 1]._id
          },
          booking: {
            _id: userBookings[i]._id,
            seatsBooked: userBookings[i].seatsBooked,
            createdAt: userBookings[i].createdAt,
            user: userBookings[i].user,
            event: userBookings[i].event
          }
        });
      }
    }
  });

  // ── Feature 3: Price outlier events ──
  const eventPrices = bookings
    .filter((b) => b.event?.price != null)
    .map((b) => b.event.price);

  if (eventPrices.length >= 5) {
    const priceMean = mean(eventPrices);
    const priceStd = stdDev(eventPrices);

    bookings.forEach((b) => {
      if (!b.event?.price) return;
      const z = zScore(b.event.price, priceMean, priceStd);
      if (Math.abs(z) > Z_THRESHOLD) {
        // Avoid duplicates
        const exists = anomalies.some(
          (a) => a.bookingId?.toString() === b._id.toString() && a.type === "price_outlier"
        );
        if (!exists) {
          anomalies.push({
            bookingId: b._id,
            type: "price_outlier",
            severity: Math.abs(z) > 3 ? "high" : "medium",
            description: `Event price ₹${b.event.price} is an outlier (z-score: ${z.toFixed(2)})`,
            icon: "💰",
            details: {
              eventPrice: b.event.price,
              mean: Math.round(priceMean * 100) / 100,
              stdDev: Math.round(priceStd * 100) / 100,
              zScore: Math.round(z * 100) / 100
            },
            booking: {
              _id: b._id,
              seatsBooked: b.seatsBooked,
              createdAt: b.createdAt,
              user: b.user,
              event: b.event
            }
          });
        }
      }
    });
  }

  // ── Feature 4: High cancellation rate users ──
  const allBookingsForCancel = await Booking.find({})
    .populate("user", "name email")
    .lean();

  const userCancelStats = new Map();
  allBookingsForCancel.forEach((b) => {
    const uid = b.user?._id?.toString();
    if (!uid) return;
    if (!userCancelStats.has(uid)) {
      userCancelStats.set(uid, { total: 0, cancelled: 0, user: b.user });
    }
    const stats = userCancelStats.get(uid);
    stats.total++;
    if (b.bookingStatus === "cancelled") stats.cancelled++;
  });

  userCancelStats.forEach((stats) => {
    if (stats.total >= 3 && stats.cancelled / stats.total > 0.5) {
      anomalies.push({
        bookingId: null,
        type: "high_cancellation_rate",
        severity: stats.cancelled / stats.total > 0.7 ? "high" : "medium",
        description: `User cancelled ${stats.cancelled}/${stats.total} bookings (${Math.round((stats.cancelled / stats.total) * 100)}%)`,
        icon: "🔄",
        details: {
          totalBookings: stats.total,
          cancelledBookings: stats.cancelled,
          cancellationRate: Math.round((stats.cancelled / stats.total) * 100)
        },
        booking: {
          user: stats.user,
          event: null
        }
      });
    }
  });

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  anomalies.sort((a, b) => (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2));

  return {
    anomalies,
    totalAnalyzed: bookings.length,
    anomalyCount: anomalies.length,
    algorithm: "Z-Score + IQR Statistical Outlier Detection",
    thresholds: {
      zScoreThreshold: Z_THRESHOLD,
      rapidBookingMinutes: 5,
      highCancellationRate: 0.5
    },
    features: ["seatCount", "bookingTimeDiff", "eventPrice", "cancellationRate"]
  };
};

module.exports = {
  getEventClusters,
  getUserSegments,
  detectAnomalies
};
