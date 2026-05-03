const DAY_IN_MS = 24 * 60 * 60 * 1000;
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with"
]);

const tokenize = (value = "") =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOP_WORDS.has(token));

const buildVocabulary = (events) => {
  const vocabulary = new Map();

  events.forEach((event) => {
    const tokens = tokenize(`${event.title} ${event.description} ${event.location}`);
    tokens.forEach((token) => {
      if (!vocabulary.has(token)) {
        vocabulary.set(token, vocabulary.size);
      }
    });
  });

  return vocabulary;
};

const getNumericRanges = (events) => {
  const prices = events.map((event) => Number(event.price) || 0);
  const seats = events.map((event) => Number(event.totalSeats) || 0);
  const timestamps = events.map((event) => new Date(event.date).getTime());

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minSeats: Math.min(...seats),
    maxSeats: Math.max(...seats),
    minTimestamp: Math.min(...timestamps),
    maxTimestamp: Math.max(...timestamps)
  };
};

const normalize = (value, min, max) => {
  if (!Number.isFinite(value) || min === max) {
    return 0;
  }

  return (value - min) / (max - min);
};

const vectorizeEvent = (event, vocabulary, ranges) => {
  const textVector = Array.from({ length: vocabulary.size }, () => 0);
  const tokens = tokenize(`${event.title} ${event.description} ${event.location}`);

  tokens.forEach((token) => {
    const index = vocabulary.get(token);
    if (index !== undefined) {
      textVector[index] += 1;
    }
  });

  return [
    normalize(Number(event.price) || 0, ranges.minPrice, ranges.maxPrice),
    normalize(Number(event.totalSeats) || 0, ranges.minSeats, ranges.maxSeats),
    normalize(new Date(event.date).getTime(), ranges.minTimestamp, ranges.maxTimestamp),
    ...textVector
  ];
};

const euclideanDistance = (left, right) => {
  let sum = 0;
  for (let index = 0; index < left.length; index += 1) {
    sum += (left[index] - right[index]) ** 2;
  }

  return Math.sqrt(sum);
};

const averageVectors = (vectors) => {
  if (!vectors.length) {
    return [];
  }

  const centroid = Array.from({ length: vectors[0].length }, () => 0);
  vectors.forEach((vector) => {
    for (let index = 0; index < vector.length; index += 1) {
      centroid[index] += vector[index];
    }
  });

  return centroid.map((value) => value / vectors.length);
};

const runKMeans = (vectors, clusterCount, maxIterations = 12) => {
  const centroids = vectors.slice(0, clusterCount).map((vector) => [...vector]);
  let assignments = Array.from({ length: vectors.length }, (_, index) => index % clusterCount);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const nextAssignments = vectors.map((vector) => {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      centroids.forEach((centroid, centroidIndex) => {
        const distance = euclideanDistance(vector, centroid);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = centroidIndex;
        }
      });

      return bestIndex;
    });

    const changed = nextAssignments.some((value, index) => value !== assignments[index]);
    assignments = nextAssignments;

    if (!changed && iteration > 0) {
      break;
    }

    for (let centroidIndex = 0; centroidIndex < clusterCount; centroidIndex += 1) {
      const clusterVectors = vectors.filter((_, vectorIndex) => assignments[vectorIndex] === centroidIndex);
      if (clusterVectors.length) {
        centroids[centroidIndex] = averageVectors(clusterVectors);
      }
    }
  }

  return assignments;
};

const calculateSimilarityScore = (baseEvent, candidateEvent) => {
  const priceGap = Math.abs((Number(baseEvent.price) || 0) - (Number(candidateEvent.price) || 0));
  const seatGap = Math.abs((Number(baseEvent.totalSeats) || 0) - (Number(candidateEvent.totalSeats) || 0));
  const dateGapDays = Math.abs(new Date(baseEvent.date).getTime() - new Date(candidateEvent.date).getTime()) / DAY_IN_MS;

  const baseTokens = new Set(tokenize(`${baseEvent.title} ${baseEvent.description} ${baseEvent.location}`));
  const candidateTokens = new Set(tokenize(`${candidateEvent.title} ${candidateEvent.description} ${candidateEvent.location}`));
  const overlap = [...baseTokens].filter((token) => candidateTokens.has(token)).length;
  const tokenUnion = new Set([...baseTokens, ...candidateTokens]).size || 1;
  const textSimilarity = overlap / tokenUnion;

  return textSimilarity * 1.2 - priceGap * 0.002 - seatGap * 0.001 - dateGapDays * 0.003;
};

const getRecommendedEvents = (events, eventId, limit = 5) => {
  if (!Array.isArray(events) || events.length < 2) {
    return [];
  }

  const targetEvent = events.find((event) => String(event._id) === String(eventId));
  if (!targetEvent) {
    return [];
  }

  const vocabulary = buildVocabulary(events);
  const ranges = getNumericRanges(events);
  const vectors = events.map((event) => vectorizeEvent(event, vocabulary, ranges));
  const clusterCount = Math.max(2, Math.min(4, Math.floor(Math.sqrt(events.length))));
  const assignments = runKMeans(vectors, clusterCount);
  const targetIndex = events.findIndex((event) => String(event._id) === String(eventId));
  const targetCluster = assignments[targetIndex];

  return events
    .filter((event) => String(event._id) !== String(eventId))
    .map((event, index) => {
      const eventIndex = index >= targetIndex ? index + 1 : index;
      const clusterBonus = assignments[eventIndex] === targetCluster ? 0.15 : 0;

      return {
        ...event,
        recommendationScore: calculateSimilarityScore(targetEvent, event) + clusterBonus
      };
    })
    .sort((left, right) => right.recommendationScore - left.recommendationScore)
    .slice(0, limit);
};

module.exports = {
  getRecommendedEvents
};
